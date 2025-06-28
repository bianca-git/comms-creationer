# Quick Start Guide - Git Deployment

## 🚀 Deploy in 5 Minutes

### Option 1: GitHub Pages (Recommended)

1. **Fork this repository** to your GitHub account
2. **Go to Settings** → **Pages** in your forked repository
3. **Select Source**: Deploy from a branch → **main** → **/ (root)**
4. **Wait 2-3 minutes** for deployment to complete
5. **Your add-in is live!** at `https://yourusername.github.io/staff-communication-addon`

### Option 2: Clone and Deploy

```bash
# Clone the repository
git clone https://github.com/yourusername/staff-communication-addon.git
cd staff-communication-addon

# Install dependencies
npm install

# Build the project
npm run build

# Deploy to your preferred platform
npm run deploy github  # or netlify, vercel, azure
```

## 📋 Update Excel with Your Add-in

1. **Copy your deployment URL** (from step 5 above)
2. **Open Excel** → **Insert** → **Office Add-ins** → **Upload My Add-in**
3. **Upload the manifest file** from: `https://yourusername.github.io/staff-communication-addon/manifest.xml`
4. **Start using your add-in!**

## 🔧 Customize for Your Organization

### Update Branding
Edit these files to customize for your organization:
- `manifest.xml` - Add-in name, description, icons
- `src/taskpane/taskpane.html` - Interface text and styling
- `src/services/sharePointService.js` - SharePoint site URL

### Configure SharePoint Integration
```javascript
// In src/services/sharePointService.js
const SHAREPOINT_SITE_URL = 'https://yourcompany.sharepoint.com/sites/yoursite';
const CONTACTS_LIST_NAME = 'Staff Contacts';
const TEMPLATES_LIBRARY = 'Email Templates';
```

## 🎯 What You Get

✅ **Professional Email Templates** - 8+ categories for staff communications  
✅ **Advanced Mail Merge** - Conditional content, formatting, real-time preview  
✅ **SharePoint Integration** - Enterprise data storage and security  
✅ **Campaign Analytics** - Track opens, clicks, engagement  
✅ **Embedded Help** - No separate documentation needed  
✅ **Mobile Responsive** - Works on desktop and mobile Excel  

## 🆘 Need Help?

- **Documentation**: Check the [docs/](docs/) folder
- **Issues**: Create a GitHub issue
- **Email Support**: [Send feedback](mailto:support@yourcompany.com?subject=Staff%20Communication%20Add-in%20Support)

## 🔄 Keep It Updated

Your add-in will automatically update when you push changes to the main branch. No manual deployment needed!

---

**That's it! Your staff communication tool is ready to use.** 🎉

