---
name: managing-deployment
description: Deployment and infrastructure for the site. Consult when troubleshooting deployments, modifying CI/CD, or diagnosing build issues.
---

# Managing Deployment

Deployment and infrastructure maintenance for the site.

## When to Use

Consult this skill when troubleshooting failed deployments, modifying the GitHub Actions workflow, or diagnosing build issues.

## Architecture

Every push triggers deployment via GitHub Actions:

- **main branch** → Production (100% traffic)
- **other branches** → Preview (tagged revision, no traffic)

## Key Files

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | CI/CD workflow |
| `Dockerfile` | Multi-stage Docker build |

## Pre-Deployment Verification

Before pushing, verify the build will succeed:

```bash
npm run check     # TypeScript and Astro checks
npm run lint      # ESLint
npm run build     # Full production build
```

If `npm run build` succeeds locally, the Docker build should succeed in CI.

## Docker Build

Multi-stage build in `Dockerfile`:

1. **Build stage**: Node 22 Alpine, all dependencies, runs `npm run build`
2. **Runtime stage**: Production dependencies only, copies built output

Entry point: `node dist/server/entry.mjs` on port 4321.

## Diagnosing Build Failures

### TypeScript Errors

```bash
npm run check
```

Fix all errors before pushing.

### ESLint Errors

```bash
npm run lint --fix
```

### Missing Dependencies

If build fails with module not found:
1. Check the import path is correct
2. Verify package is in `package.json` dependencies (not devDependencies if needed at runtime)
3. Run `npm install` locally to verify

### Astro Build Errors

Common causes:
- Invalid frontmatter in MDX files
- Missing required props in components
- Circular imports

Run `npm run build` locally to see full error output.

## Workflow Structure

The workflow in `.github/workflows/deploy.yml`:

1. Checkout code
2. Determine if production or preview (branch name)
3. Authenticate to Google Cloud
4. Build and push Docker image to Artifact Registry
5. Deploy to Cloud Run with appropriate traffic settings

### Production vs Preview

Production (main branch):
- Receives 100% traffic immediately
- Replaces previous production revision

Preview (other branches):
- Tagged revision with no traffic
- Accessible via tag URL: `https://{tag}---personal-site-{hash}.run.app`
- Branch names are sanitised for Cloud Run (lowercase, alphanumeric + hyphens)

## Cloud Run Configuration

Current settings in workflow:

| Setting | Value |
|---------|-------|
| Region | `europe-west2` |
| Memory | `256Mi` |
| Min instances | `0` |
| Max instances | `2` |
| Port | `4321` |

To modify: edit flags in both production and preview deploy steps (keep them in sync).

## Required Secrets

GitHub repository secrets:

| Secret | Purpose |
|--------|---------|
| `GCP_PROJECT_ID` | Google Cloud project ID |
| `GCP_SA_KEY` | Service account JSON key |

If deployment fails with authentication errors, these secrets may need regenerating.

## Checking Deployment Status

With GitHub MCP server access:
- Check workflow run status for the commit
- View workflow run logs for error details
- Re-run failed workflows if the issue was transient

## Modifying the Workflow

When editing `.github/workflows/deploy.yml`:

- Keep production and preview deploy steps in sync (same flags)
- Test workflow changes on a branch first (creates preview deployment)
- Validate YAML syntax before committing
