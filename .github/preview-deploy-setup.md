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
# Install Docker
sudo apt-get update
sudo apt-get install -y docker.io git git-lfs
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu
# Re-login after this for group membership to take effect

# Create the preview directory structure
sudo mkdir -p /opt/vha-preview/db/dumps
sudo chown -R ubuntu:ubuntu /opt/vha-preview   # replace 'ubuntu' as above

# Pull the SNOMED dump from the repo (only needed once; it rarely changes)
# Clone the repo temporarily to get the LFS file, then keep just the dump
git clone --no-checkout https://github.com/morehumaninternet/virtual-hospitals-africa.git /tmp/vha-clone
cd /tmp/vha-clone
git lfs install
git lfs pull --include="db/dumps/snomed"
cp db/dumps/snomed /opt/vha-preview/db/dumps/snomed
rm -rf /tmp/vha-clone

# Verify the dump is there
ls -lh /opt/vha-preview/db/dumps/snomed
```

### 5. Create the shared preview env file

All preview environments share secrets from `/opt/vha-preview/.env.preview`. The `DATABASE_URL` is overridden per-PR by docker compose, so it can be a placeholder here.

```bash
cat > /opt/vha-preview/.env.preview << 'EOF'
DATABASE_URL=placeholder_overridden_by_compose
GOOGLE_MAPS_API_KEY=your_key_here
SKIP_GOOGLE_MAPS=false
# ... add any other env vars the app needs at runtime
EOF
chmod 600 /opt/vha-preview/.env.preview
```

### 6. Update the SNOMED dump when it changes

The dump rarely changes (it's SNOMED base data). When it does, SSH into the preview instance and replace the file:

```bash
scp db/dumps/snomed ubuntu@<preview-ec2-ip>:/opt/vha-preview/db/dumps/snomed
```

---

## GitHub

Add the following repository secrets (Settings → Secrets and variables → Actions):

| Secret name | Value |
|---|---|
| `PREVIEW_EC2_HOST` | The Elastic IP or DNS hostname of the preview instance |
| `PREVIEW_EC2_USERNAME` | SSH username (e.g. `ubuntu`) |
| `EC2_SSH_KEY` | Contents of the private key file for the instance |
| `PREVIEW_EC2_IP` | The Elastic IP (used to construct the preview URL in PR comments) |

The existing `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `ECR_REPOSITORY` secrets are reused from the prod workflow — no changes needed there.

---

## How it works

- **PR opened / new commit pushed**: builds the arm64 image tagged `pr-{N}-{sha}`, pushes to ECR, SSHes into the preview instance, writes a per-PR `docker-compose.yml`, and runs:
  1. `postgres:16` container
  2. `migrator` container (same app image, runs `db:restore snomed && db:migrate all` against the per-PR postgres, then exits)
  3. `app` container (starts only after migrator exits cleanly), exposed on port `8000 + PR_NUMBER`
- **PR closed**: SSHes in, runs `docker compose down -v` to remove containers and the postgres volume, deletes the per-PR directory.
- **PR comment**: updated (not duplicated) on each push with the current preview URL.
