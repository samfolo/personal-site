# Deployment and Infrastructure

## Overview

The site deploys to Google Cloud Run via GitHub Actions. Every push triggers a deployment:
- **main branch** → Production (receives 100% traffic)
- **other branches** → Preview deployments (tagged, no traffic)

## GitHub Actions Workflow

### Location
`.github/workflows/deploy.yml`

### Trigger
Every push to any branch:
```yaml
on:
  push:
    branches:
      - "**"
```

### Environment Variables
| Variable | Value | Description |
|----------|-------|-------------|
| `PROJECT_ID` | From secret | GCP project ID |
| `REGION` | `europe-west2` | London region |
| `SERVICE_NAME` | `personal-site` | Cloud Run service |
| `REGISTRY` | `europe-west2-docker.pkg.dev` | Artifact Registry |

### Workflow Steps

1. **Checkout code** - Clone repository
2. **Set deployment variables** - Determine if production or preview
   - Production: `is_preview=false`, no tag
   - Preview: `is_preview=true`, sanitised branch name as tag
3. **Authenticate to Google Cloud** - Using service account key
4. **Set up Cloud SDK** - Install gcloud
5. **Configure Docker** - Auth to Artifact Registry
6. **Build Docker image** - Tag with commit SHA and `latest`
7. **Push Docker image** - To Artifact Registry
8. **Deploy to Cloud Run** - Production or preview based on branch
9. **Output URL** - Log deployment URL

### Branch Tag Sanitisation
Preview tags must be valid Cloud Run identifiers:
- Lowercase alphanumeric and hyphens only
- Must start with a letter
- Maximum 63 characters

```bash
TAG=$(echo "$BRANCH_NAME" | tr '[:upper:]' '[:lower:]' | \
  sed 's/[^a-z0-9-]/-/g' | sed 's/^-//' | sed 's/-$//' | cut -c1-63)
if [[ ! "$TAG" =~ ^[a-z] ]]; then
  TAG="br-$TAG"
fi
```

## Required GitHub Secrets

| Secret | Description | How to Obtain |
|--------|-------------|---------------|
| `GCP_PROJECT_ID` | Google Cloud project ID | GCP Console → Project ID |
| `GCP_SA_KEY` | Service account JSON key | GCP Console → IAM → Service Accounts |

### Service Account Permissions
The service account needs:
- `roles/run.admin` - Deploy to Cloud Run
- `roles/artifactregistry.writer` - Push images
- `roles/iam.serviceAccountUser` - Act as service account

## Docker Configuration

### Dockerfile
Multi-stage build for minimal image size:

**Stage 1: Build**
```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

**Stage 2: Runtime**
```dockerfile
FROM node:22-alpine AS runtime
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
```

### Key Details
- Base image: Node 22 Alpine (small footprint)
- Production dependencies only in runtime stage
- Port 4321 (Astro default)
- Entry point: Built Astro SSR server

## Cloud Run Configuration

### Production Deployment Flags
```yaml
flags: |
  --min-instances=0
  --max-instances=2
  --memory=256Mi
  --allow-unauthenticated
  --port=4321
```

### Traffic Routing
- **Production**: `LATEST=100` (all traffic to latest revision)
- **Preview**: `no_traffic: true` (accessible via tag URL only)

### Preview URLs
Format: `https://{tag}---personal-site-{hash}.run.app`

## Utility Scripts (`scripts/`)

### `cleanup-previews.sh`
Remove preview traffic tags:
```bash
./scripts/cleanup-previews.sh
```
- Lists all preview tags
- Prompts for confirmation
- Removes selected tags

### `url.sh`
Get service URL:
```bash
./scripts/url.sh
```

### `logs.sh`
View service logs:
```bash
./scripts/logs.sh
```

### `revisions.sh`
List service revisions:
```bash
./scripts/revisions.sh
```

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Development server runs at `http://localhost:4321`

## Deployment Checklist

### Before Merging to Main
- [ ] Run `npm run build` locally (catches build errors)
- [ ] Test changes in development
- [ ] Check for TypeScript errors
- [ ] Verify content renders correctly

### After Deployment
- [ ] Check GitHub Actions for successful deployment
- [ ] Visit production URL to verify
- [ ] Test critical pages (home, blog, about)
- [ ] Verify RSS feed at `/rss.xml`
- [ ] Check sitemap at `/sitemap.xml`

### Troubleshooting Failed Deployments

| Issue | Solution |
|-------|----------|
| Build fails | Check npm run build locally |
| Push fails | Verify GCP_SA_KEY secret is valid |
| Deploy fails | Check Cloud Run logs |
| Site down | Check Cloud Run console for errors |
| Preview not accessible | Ensure tag URL format is correct |

## Infrastructure Costs

Cloud Run pricing (as of writing):
- **Scale to zero**: No charges when idle
- **Per-request pricing**: Pay only for actual usage
- **Free tier**: 2 million requests/month free

Current configuration is optimised for low-traffic personal site:
- Min instances: 0 (scales to zero)
- Max instances: 2 (handles traffic spikes)
- Memory: 256Mi (sufficient for SSR)

## Security Considerations

1. **Secrets Management**
   - Service account key stored in GitHub Secrets
   - Never commit secrets to repository

2. **Access Control**
   - Cloud Run allows unauthenticated access (public site)
   - Service account has minimal required permissions

3. **Container Security**
   - Alpine base image (smaller attack surface)
   - Production dependencies only
   - Non-root user recommended for production

## Monitoring

### GitHub Actions
- View workflow runs at: Repository → Actions
- Each commit shows deployment status
- Logs available for debugging

### Cloud Run Console
- Monitor at: GCP Console → Cloud Run → personal-site
- View metrics: requests, latency, memory
- Check logs for errors
- Manage revisions and traffic
