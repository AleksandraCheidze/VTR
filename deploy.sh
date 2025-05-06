#!/bin/bash

# Project ID from your service account key
PROJECT_ID="amplified-name-425617-p7"

# Build and push the container image
echo "Building and pushing container image to Google Container Registry..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/video-text-copier

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy --image gcr.io/$PROJECT_ID/video-text-copier --platform managed --region us-central1 --allow-unauthenticated

echo "Deployment completed!"
