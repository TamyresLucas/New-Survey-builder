# Azure App Service (Linux) Deployment Guide

## Overview

This guide covers deploying the Survey Builder application to Azure App Service (Linux) with Node.js.

## Build Pipeline Artifacts

The Azure Pipeline creates **two separate artifacts**:

### 1. `survey-builder-iis` (ZIP)
- **Purpose**: IIS/Windows deployment
- **Format**: ZIP file containing dist folder
- **Contents**: Pre-built static files + web.config
- **Use for**: Windows IIS servers

### 2. `survey-builder-appservice` (Unzipped)
- **Purpose**: Azure App Service Linux deployment  
- **Format**: Unzipped folder structure
- **Contents**: 
  - `dist/` - Pre-built static files
  - `package.json` - Node dependencies
  - `package-lock.json` - Locked versions
  - `.deployment` - Azure deployment config (prevents rebuild)
- **Use for**: Azure App Service (Linux with Node.js)

## Azure App Service Configuration

### Step 1: Create App Service
```bash
az webapp create \
  --resource-group <your-resource-group> \
  --plan <your-app-service-plan> \
  --name <your-app-name> \
  --runtime "NODE:20-lts"
```

### Step 2: Configure Application Settings

In Azure Portal → Your App Service → Configuration → Application Settings:

| Setting | Value | Purpose |
|---------|-------|---------|
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `false` | Skip Oryx build (already built in pipeline) |
| `WEBSITE_NODE_DEFAULT_VERSION` | `20-lts` | Node.js version |
| `GEMINI_API_KEY` | `<your-key>` | Optional: if using Gemini API |

### Step 3: Configure Startup Command

In Azure Portal → Your App Service → Configuration → General Settings:

**Startup Command:**
```bash
npm run start
```

Or directly:
```bash
npx serve dist -s -l 8080
```

**Stack Settings:**
- **Stack**: Node
- **Major version**: 20 LTS
- **Minor version**: Latest

### Step 4: Deploy Using Azure DevOps

#### Create Release Pipeline

1. **Add Artifact**
   - Source: Your build pipeline
   - Default version: Latest
   - Source alias: `_survey-builder`
   - **Artifact**: Select `survey-builder-appservice`

2. **Add Stage: Deploy to Azure App Service**

3. **Add Task: Azure App Service Deploy**
   - Azure subscription: `<your-subscription>`
   - App type: `Web App on Linux`
   - App Service name: `<your-app-name>`
   - Package or folder: `$(System.DefaultWorkingDirectory)/_survey-builder/survey-builder-appservice`
   - Runtime Stack: `Node 20 LTS`
   - Startup command: `npm run start`

## How It Works

### Traditional Flow (❌ What We're Avoiding)
```
Pipeline → Build → Artifact → Upload to Azure → Azure runs npm install → Azure runs npm run build → Start
```
**Problem**: Azure tries to rebuild but source files aren't in artifact

### Our Flow (✅ Correct)
```
Pipeline → Build → Pre-built Artifact → Upload to Azure → Azure skips build → Start serve
```
**Solution**: `.deployment` file tells Azure to skip build step

## The `.deployment` File

Located in project root:

```ini
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT = false
```

This file tells Azure's Oryx build system:
- ✅ Don't run `npm install` (we already included node_modules via package.json)
- ✅ Don't run `npm run build` (already built in pipeline)
- ✅ Just deploy the files as-is

## Deployment Verification

### 1. Check Deployment Logs
Azure Portal → Your App Service → Deployment Center → Logs

**Should see**:
```
Deployment successful
SCM_DO_BUILD_DURING_DEPLOYMENT = false
Skipping build
```

**Should NOT see**:
```
Running oryx build...
Running 'npm run build'...
```

### 2. Check Application Logs
Azure Portal → Your App Service → Log Stream

**Should see**:
```
npm run start
> survey-builder@1.0.0 start
> serve dist -s -l 8080

INFO: Accepting connections at http://localhost:8080
```

### 3. Test the Application
- Navigate to `https://<your-app-name>.azurewebsites.net`
- Should load the Survey Builder application
- Check browser console for errors
- Test navigation and refresh (SPA routing)

## Troubleshooting

### Issue 1: Still Seeing Oryx Build Logs
**Symptom**: Deployment logs show "Running oryx build..."  
**Cause**: `.deployment` file not in artifact or app setting not configured  
**Solution**: 
- Verify `.deployment` file is in the artifact
- Add `SCM_DO_BUILD_DURING_DEPLOYMENT = false` to App Settings

### Issue 2: "Cannot find module 'serve'"
**Symptom**: App crashes with "Cannot find module 'serve'"  
**Cause**: Dependencies not installed  
**Solution**: Azure needs to run `npm ci` or `npm install` once to install production dependencies

### Issue 3: "npm ERR! Missing script: start"
**Symptom**: App fails to start with missing script error  
**Cause**: `package.json` not in deployment  
**Solution**: Verify pipeline copies `package.json` to artifact

### Issue 4: 404 Errors on Refresh
**Symptom**: App works initially but 404 on page refresh  
**Cause**: SPA routing not configured  
**Solution**: The `serve -s` flag should handle this, but verify startup command

### Issue 5: Blank Page
**Symptom**: App loads but shows blank page  
**Cause**: Base path mismatch or assets not loading  
**Solution**: 
- Check `vite.config.ts` has `base: '/'`
- Check browser console for 404s on assets
- Verify `dist/` folder structure in deployment

## Performance Optimization

### Enable Compression
In App Settings, add:
```
WEBSITE_COMPRESS_CONTENT = true
```

### Enable Local Cache (Faster cold starts)
```
WEBSITE_LOCAL_CACHE_OPTION = Always
WEBSITE_LOCAL_CACHE_SIZEINMB = 1000
```

### Scale Out
Configure auto-scale rules based on CPU/Memory metrics

## CI/CD Best Practices

1. ✅ **Build once** in pipeline, deploy everywhere
2. ✅ **Version artifacts** with build numbers
3. ✅ **Separate artifacts** for different deployment targets (IIS vs App Service)
4. ✅ **Environment variables** for configuration (API keys, endpoints)
5. ✅ **Blue-green deployment** using deployment slots
6. ✅ **Automated testing** before production deployment

## Deployment Slots (Recommended)

Use slots for zero-downtime deployments:

```bash
# Create staging slot
az webapp deployment slot create \
  --name <your-app-name> \
  --resource-group <your-resource-group> \
  --slot staging

# Deploy to staging
# Test staging: https://<your-app-name>-staging.azurewebsites.net

# Swap to production
az webapp deployment slot swap \
  --name <your-app-name> \
  --resource-group <your-resource-group> \
  --slot staging
```

## Cost Optimization

- **Free/Shared Tier**: Not suitable (no custom domains, limited resources)
- **Basic Tier**: Good for dev/test (starts at ~$13/month)
- **Standard Tier**: Production workloads (starts at ~$55/month, includes slots)
- **Premium Tier**: High traffic, requires better performance

## Security

### Enable HTTPS Only
```bash
az webapp update \
  --name <your-app-name> \
  --resource-group <your-resource-group> \
  --https-only true
```

### Configure Custom Domain & SSL
1. Add custom domain in Azure Portal
2. Azure provides free SSL certificate
3. Update DNS records

### Configure CORS (if needed)
For API calls from different domains

## Monitoring

### Application Insights
Enable for:
- Performance monitoring
- Error tracking
- Usage analytics
- Custom telemetry

### Alerts
Set up alerts for:
- HTTP 5xx errors
- Response time > threshold
- CPU/Memory > 80%
- App restarts

## Support Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Node.js on Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/quickstart-nodejs)
- [Azure DevOps Integration](https://docs.microsoft.com/en-us/azure/devops/pipelines/targets/webapp)
- [Oryx Build System](https://github.com/microsoft/Oryx)

## Quick Reference

| Task | Command/Location |
|------|------------------|
| View logs | Azure Portal → Log Stream |
| Restart app | Azure Portal → Restart |
| SSH to container | Azure Portal → SSH |
| View env vars | Azure Portal → Configuration |
| Scale up | Azure Portal → Scale up (tier) |
| Scale out | Azure Portal → Scale out (instances) |
| Deploy | Azure DevOps Release Pipeline |

---

**Last Updated**: Based on Node.js 20 LTS and Azure App Service (Linux) as of January 2026

