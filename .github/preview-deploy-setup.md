# Preview Deploy Setup

One-time setup required before the `deploy_preview.yml` workflow will work.

---

## AWS

### 1. Launch the preview EC2 instance

- **AMI**: Ubuntu 24.04 ARM (same family as prod)
- **Instance type**: `t4g.small` (2 vCPU, 2 GB RAM) — size up if migrations feel slow
- **Region**: `af-south-1`
- **IAM role**: attach the same role as the prod instance (ECR read + CloudWatch Logs), or create a minimal one with:
  - `ecr:GetAuthorizationToken`
  - `ecr:BatchGetImage`
  - `ecr:GetDownloadUrlForLayer`
- **Key pair**: create or reuse an SSH key pair; you'll need the private key for a GitHub secret below

### 2. Assign an Elastic IP

Allocate an Elastic IP and associate it with the preview instance. This IP never changes and is used directly in preview URLs.

### 3. Configure the security group

Inbound rules needed:

| Type | Protocol | Port range | Source      |
|------|----------|------------|-------------|
| SSH  | TCP      | 22         | Your IP / 0.0.0.0/0 |
| Custom TCP | TCP | 8001–65535 | 0.0.0.0/0  |

Each PR gets port `8000 + PR_NUMBER` (e.g. PR 1180 → port 9180). Opening 8001–65535 avoids having to think about the ceiling as PR numbers grow.

### 4. Bootstrap the instance

SSH in and run:

```bash
# Install Docker + Compose plugin
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2 unzip
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu
# Re-login after this for group membership to take effect

sudo mkdir -p /opt/vha-preview/db/dumps
sudo chmod 777 /opt/vha-preview
sudo chmod 777 /opt/vha-preview/db/dumps

### 5. Create the shared preview env file

## All preview environments share secrets from `/opt/vha-preview/.env.preview`. The `DATABASE_URL` is overridden per-PR by docker compose, so it can be a placeholder here.

sudo cat > /opt/vha-preview/.env.preview << 'EOF'
DATABASE_URL=placeholder_overridden_by_compose
GOOGLE_MAPS_API_KEY=your_key_here
EOF

```

### 6. Update the SNOMED dump when it changes

The dump rarely changes (it's SNOMED base data). When it does, scp the file into the preview instance

```bash
scp -i ~/.ssh/vha-branch-deploy.pem db/dumps/snomed ubuntu@$VHA_BRANCH_DEPLOY_IP:/opt/vha-preview/db/dumps
```

---

## GitHub

Add the following repository secrets (Settings → Secrets and variables → Actions):

| Secret name | Value |
|---|---|
| `PREVIEW_EC2_HOST` | The Elastic IP or DNS hostname of the preview instance |
| `PREVIEW_EC2_USERNAME` | SSH username (e.g. `ubuntu`) |
| `PREVIEW_EC2_SSH_KEY` | Contents of the private key file for the instance |
| `PREVIEW_EC2_IP` | The Elastic IP (used to construct the preview URL in PR comments) |

The existing `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `ECR_REPOSITORY` secrets are reused from the prod workflow — no changes needed there.

---

## How it works

- **PR opened / new commit pushed**: builds the amd image tagged `pr-{N}-{sha}`, pushes to ECR, SSHes into the preview instance, writes a per-PR `docker-compose.yml`, and runs:
  1. `postgres:16` container
  2. `migrator` container (same app image, runs `db:restore snomed && db:migrate all` against the per-PR postgres, then exits)
  3. `app` container (starts only after migrator exits cleanly), exposed on port `8000 + PR_NUMBER`
- **PR closed**: SSHes in, runs `docker compose down -v` to remove containers and the postgres volume, deletes the per-PR directory.
- **PR comment**: updated (not duplicated) on each push with the current preview URL.
