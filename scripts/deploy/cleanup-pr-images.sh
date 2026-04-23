#! /usr/bin/env bash

OLD_TAGS=$(aws ecr list-images \
    --repository-name "$ECR_REPOSITORY" \
    --filter tagStatus=TAGGED \
    --query "imageIds[?starts_with(imageTag, 'pr-')].imageTag" \
    --output text)

echo "Deleting superseded images: $OLD_TAGS"

BATCH=""
COUNT=0
for tag in $OLD_TAGS; do
  BATCH="$BATCH imageTag=$tag"
  COUNT=$((COUNT + 1))
  if [ "$COUNT" -ge 100 ]; then
    aws ecr batch-delete-image \
      --repository-name "$ECR_REPOSITORY" \
      --image-ids $BATCH
    BATCH=""
    COUNT=0
  fi
done

if [ "$COUNT" -gt 0 ]; then
  aws ecr batch-delete-image \
    --repository-name "$ECR_REPOSITORY" \
    --image-ids $BATCH
fi