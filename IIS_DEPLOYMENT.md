# IIS Deployment Guide for Survey Builder

## Build Artifact Structure

The build artifact is **complete and correct**. Modern bundlers like Vite consolidate everything into minimal files:

```
dist/
├── index.html          (36 KB)  - Main HTML entry point
├── web.config          (2 KB)   - IIS configuration
└── assets/
    └── index-[hash].js (878 KB) - All application code bundled (React, components, libraries, etc.)
```

This is **normal** - all your TypeScript/React code, components, and dependencies are bundled into a single minified JavaScript file.

## IIS Requirements

### 1. Install URL Rewrite Module

The `web.config` requires the IIS URL Rewrite module for SPA routing to work.

**Download & Install:**
- https://www.iis.net/downloads/microsoft/url-rewrite
- Or use Web Platform Installer: `WebPICMD /Install /Products:UrlRewrite2`

**Without this module, you will get:**
- HTTP Error 500.19
- Error code: 0x8007000d
- "Configuration error" message

### 2. Verify IIS Installation

Ensure IIS has the following features enabled:
- Static Content
- Default Document
- HTTP Errors
- MIME Types

## Deployment Steps

### Using Azure Release Pipeline

1. **Download the build artifact** (`survey-builder-dist`) from the Azure Pipeline
2. **Extract** the artifact to your IIS web directory (e.g., `C:\inetpub\wwwroot\SurveyBuilderPoc`)
3. **Configure IIS Application Pool:**
   - Set to "No Managed Code" (this is a static SPA, not an ASP.NET app)
   - Set "Enable 32-Bit Applications" to False
4. **Create or configure the IIS Application/Site**
   - Point to the extracted dist folder
   - Set default document to `index.html`

### Manual Deployment

1. Copy all contents of the `dist` folder to your IIS directory
2. Ensure all three items are present:
   - index.html
   - web.config  
   - assets folder
3. Test by browsing to your site

## Common Issues & Solutions

### Issue 1: HTTP 500.19 - Config Error (0x8007000d)

**Cause:** URL Rewrite module not installed  
**Solution:** Install URL Rewrite module from the link above

### Issue 2: Blank Page or JavaScript Errors

**Cause:** Base path mismatch or assets not loading  
**Solution:** 
- Ensure all files from dist are deployed
- Check browser console for 404 errors
- Verify the site is at the root of the application path in IIS

### Issue 3: 404 on Refresh/Deep Links

**Cause:** URL rewrite rules not working  
**Solution:**
- Verify URL Rewrite module is installed
- Check web.config is present in the deployment
- Ensure web.config has proper permissions

### Issue 4: MIME Type Errors

**Cause:** MIME type conflicts in IIS configuration  
**Solution:** The updated web.config now removes existing MIME types before adding them, preventing duplicates

## Verifying Deployment

1. **Browse to the root URL** - Should load the application
2. **Check browser console** (F12) - Should show no errors loading assets
3. **Test routing** - Navigate within the app, then refresh - Should stay on the same page
4. **Test direct URLs** - Navigate directly to a route (e.g., `/page/2`) - Should load correctly

## web.config Explained

The web.config file handles:

1. **URL Rewriting** - Routes all non-file requests to `/index.html` (SPA routing)
2. **MIME Types** - Ensures proper content types for .js, .css, .json, fonts
3. **Default Document** - Sets index.html as the default page
4. **Error Handling** - Routes 404 errors back to the app (SPA routing)

## Performance Optimization (Optional)

Consider enabling:
- **Static Content Compression** (gzip/brotli)
- **Browser Caching** (set cache-control headers for assets)
- **CDN** for static assets

## Troubleshooting Checklist

- [ ] URL Rewrite module installed?
- [ ] All files from `dist` folder deployed?
- [ ] web.config present in root?
- [ ] IIS Application Pool set to "No Managed Code"?
- [ ] Default document set to index.html?
- [ ] Browser console showing any errors?
- [ ] File permissions correct (IIS_IUSRS has read access)?

## Support

For IIS-specific issues, check:
- IIS logs: `C:\inetpub\logs\LogFiles`
- Windows Event Viewer: Application and System logs
- Browser Developer Console (F12)
