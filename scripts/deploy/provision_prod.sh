#!/usr/bin/env bash
#
# Provision a fresh VHA production EC2 instance in af-south-1.
#
# Prerequisites:
#   - AWS CLI configured with credentials for account 150810357387
#   - ~/.ssh/vha.pem exists (the private key for the "vha" key pair)
#   - .env.prod in the repo root
#
# What this script does:
#   1. Imports your local key as the "vha" key pair (skips if it already exists)
#   2. Creates a security group with SSH (22) + HTTP (80) open
#   3. Launches a t4g.nano instance with the ec2-read-ecr IAM profile
#   4. Allocates and associates an Elastic IP
#   5. Waits for SSH to come up
#   6. Bootstraps the instance (Docker, awslogs)
#   7. Copies .env.prod to the instance
#   8. Prints connection info and next steps
#
set -euo pipefail

REGION="af-south-1"
AZ="af-south-1c"
KEY_NAME="vha"
KEY_FILE="$HOME/.ssh/vha.pem"
INSTANCE_TYPE="t4g.nano"
IAM_PROFILE="ec2-read-ecr"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_FILE="$REPO_ROOT/.env.prod"
SSH_USER="ec2-user"
TARGET_GROUP_ARN="arn:aws:elasticloadbalancing:af-south-1:150810357387:targetgroup/vha-prod/a6c36fe7b9254604"
OLD_INSTANCE_ID="i-0e0398756390003b2"

# ---------------------------------------------------------------------------
# Preflight checks
# ---------------------------------------------------------------------------
if [[ ! -f "$KEY_FILE" ]]; then
  echo "ERROR: $KEY_FILE not found. Place your private key there first."
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found."
  exit 1
fi

if ! aws sts get-caller-identity --region "$REGION" &>/dev/null; then
  echo "ERROR: AWS CLI not configured or no credentials."
  exit 1
fi

echo "==> Preflight checks passed."

# ---------------------------------------------------------------------------
# Key pair — import from local PEM if not already in AWS
# ---------------------------------------------------------------------------
if aws ec2 describe-key-pairs --key-names "$KEY_NAME" --region "$REGION" &>/dev/null; then
  echo "==> Key pair '$KEY_NAME' already exists in $REGION."
else
  echo "==> Importing key pair '$KEY_NAME' into $REGION..."
  PUB_KEY=$(ssh-keygen -y -f "$KEY_FILE")
  aws ec2 import-key-pair \
    --key-name "$KEY_NAME" \
    --public-key-material "$(echo "$PUB_KEY" | base64)" \
    --region "$REGION" >/dev/null
  echo "    Done."
fi

# ---------------------------------------------------------------------------
# Security group
# ---------------------------------------------------------------------------
SG_NAME="vha-prod"
SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=$SG_NAME" \
  --region "$REGION" \
  --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || true)

if [[ "$SG_ID" == "None" || -z "$SG_ID" ]]; then
  echo "==> Creating security group '$SG_NAME'..."
  VPC_ID=$(aws ec2 describe-vpcs --region "$REGION" \
    --filters "Name=isDefault,Values=true" \
    --query 'Vpcs[0].VpcId' --output text)
  SG_ID=$(aws ec2 create-security-group \
    --group-name "$SG_NAME" \
    --description "VHA production - SSH + HTTP" \
    --vpc-id "$VPC_ID" \
    --region "$REGION" \
    --query 'GroupId' --output text)

  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --region "$REGION" \
    --protocol tcp --port 22 --cidr 0.0.0.0/0 >/dev/null
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --region "$REGION" \
    --protocol tcp --port 80 --cidr 0.0.0.0/0 >/dev/null
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --region "$REGION" \
    --protocol tcp --port 443 --cidr 0.0.0.0/0 >/dev/null

  echo "    Created $SG_ID with SSH(22), HTTP(80), HTTPS(443) open."
else
  echo "==> Security group '$SG_NAME' already exists: $SG_ID"
fi

# ---------------------------------------------------------------------------
# Find the latest Amazon Linux 2023 ARM AMI
# ---------------------------------------------------------------------------
echo "==> Finding latest Amazon Linux 2023 ARM AMI..."
AMI_ID=$(aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=al2023-ami-2*-kernel-*-arm64" "Name=state,Values=available" \
  --region "$REGION" \
  --query 'sort_by(Images, &CreationDate)[-1].ImageId' --output text)
echo "    Using AMI: $AMI_ID"

# ---------------------------------------------------------------------------
# Launch instance
# ---------------------------------------------------------------------------
echo "==> Launching $INSTANCE_TYPE instance..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id "$AMI_ID" \
  --instance-type "$INSTANCE_TYPE" \
  --key-name "$KEY_NAME" \
  --security-group-ids "$SG_ID" \
  --iam-instance-profile Name="$IAM_PROFILE" \
  --placement AvailabilityZone="$AZ" \
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":16,"VolumeType":"gp3"}}]' \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=virtual-hospitals-africa-prod}]" \
  --region "$REGION" \
  --query 'Instances[0].InstanceId' --output text)

echo "    Instance: $INSTANCE_ID"
echo "==> Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --region "$REGION"
echo "    Running."

# ---------------------------------------------------------------------------
# Elastic IP
# ---------------------------------------------------------------------------
echo "==> Allocating Elastic IP..."
ALLOC_ID=$(aws ec2 allocate-address \
  --domain vpc \
  --region "$REGION" \
  --query 'AllocationId' --output text)

ELASTIC_IP=$(aws ec2 describe-addresses \
  --allocation-ids "$ALLOC_ID" \
  --region "$REGION" \
  --query 'Addresses[0].PublicIp' --output text)

aws ec2 associate-address \
  --instance-id "$INSTANCE_ID" \
  --allocation-id "$ALLOC_ID" \
  --region "$REGION" >/dev/null

echo "    Elastic IP: $ELASTIC_IP"

# ---------------------------------------------------------------------------
# Wait for SSH
# ---------------------------------------------------------------------------
echo "==> Waiting for SSH to become available (this may take a minute)..."
for i in $(seq 1 30); do
  if ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=5 -o BatchMode=yes \
    -i "$KEY_FILE" "$SSH_USER@$ELASTIC_IP" true 2>/dev/null; then
    echo "    SSH is up."
    break
  fi
  if [[ $i -eq 30 ]]; then
    echo "ERROR: SSH did not become available after 150s."
    echo "       Instance: $INSTANCE_ID  IP: $ELASTIC_IP"
    echo "       Try manually: ssh -i $KEY_FILE $SSH_USER@$ELASTIC_IP"
    exit 1
  fi
  sleep 5
done

# ---------------------------------------------------------------------------
# Helper: run a command on the instance
# ---------------------------------------------------------------------------
remote() {
  ssh -o StrictHostKeyChecking=accept-new -i "$KEY_FILE" "$SSH_USER@$ELASTIC_IP" "$@"
}

# ---------------------------------------------------------------------------
# Bootstrap the instance
# ---------------------------------------------------------------------------
echo "==> Bootstrapping instance..."

remote bash -s <<'BOOTSTRAP'
set -euo pipefail

# Install Docker
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user

# Docker needs group membership to take effect, but we'll use sudo for now

# Create CloudWatch log group (ignore if exists)
aws logs create-log-group \
  --log-group-name /docker/virtual-hospitals-africa \
  --region af-south-1 2>/dev/null || true

echo "Bootstrap complete."
BOOTSTRAP

echo "    Done."

# ---------------------------------------------------------------------------
# Copy .env.prod to the instance
# ---------------------------------------------------------------------------
echo "==> Copying .env.prod to instance..."
scp -o StrictHostKeyChecking=accept-new -i "$KEY_FILE" \
  "$ENV_FILE" "$SSH_USER@$ELASTIC_IP:/home/$SSH_USER/.env"
echo "    Done."

# ---------------------------------------------------------------------------
# ALB target group — swap old instance for new
# ---------------------------------------------------------------------------
echo "==> Updating ALB target group..."
aws elbv2 deregister-targets \
  --target-group-arn "$TARGET_GROUP_ARN" \
  --targets "Id=$OLD_INSTANCE_ID" \
  --region "$REGION" 2>/dev/null || true

aws elbv2 register-targets \
  --target-group-arn "$TARGET_GROUP_ARN" \
  --targets "Id=$INSTANCE_ID,Port=80" \
  --region "$REGION"

echo "    Registered $INSTANCE_ID in target group. Waiting for healthy..."
aws elbv2 wait target-in-service \
  --target-group-arn "$TARGET_GROUP_ARN" \
  --targets "Id=$INSTANCE_ID,Port=80" \
  --region "$REGION" 2>/dev/null || echo "    (target not yet healthy — will pass once the app is deployed)"

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
cat <<EOF

============================================================
  VHA Production Instance Provisioned
============================================================

  Instance ID:  $INSTANCE_ID
  Elastic IP:   $ELASTIC_IP
  SSH:          ssh -i $KEY_FILE $SSH_USER@$ELASTIC_IP
  Region:       $REGION
  ALB:          Old instance deregistered, new instance registered in vha-prod target group

  Next steps:
  1. Update GitHub secret EC2_HOST to: $ELASTIC_IP
  2. Update GitHub secret EC2_SSH_KEY with contents of: $KEY_FILE
  3. Push to main to trigger a deploy (or manually run the workflow)
  4. Terminate the old instance ($OLD_INSTANCE_ID) once verified

============================================================
EOF
