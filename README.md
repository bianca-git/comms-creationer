# Staff Communication Excel Add-in

A comprehensive internal staff communication tool built as an Excel Add-in with advanced mail merge capabilities, template management, and SharePoint integration.

## 🚀 Features

- **Advanced Mail Merge**: Sophisticated merge fields with conditional content
- **Template Management**: Professional email templates for staff communications
- **SharePoint Integration**: Enterprise-grade data storage and security
- **Embedded Help System**: Contextual guidance built into the interface
- **Campaign Analytics**: Comprehensive tracking and reporting
- **Excel Integration**: Seamless contact data management

## 📋 Quick Start

### Option 1: GitHub Pages Deployment (Recommended)

1. **Fork this repository** to your GitHub account
2. **Enable GitHub Pages** in repository settings
3. **Update manifest.xml** with your GitHub Pages URL
4. **Deploy** - GitHub Actions will automatically build and deploy

### Option 2: Manual Deployment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/staff-communication-addon.git
   cd staff-communication-addon
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Deploy** the `dist/` folder to your hosting platform

## 🛠 Development

### Prerequisites

- Node.js 16+ and npm
- Git
- Modern web browser
- Excel 2016+ or Excel Online

### Local Development

1. **Clone and install**:
   ```bash
   git clone https://github.com/yourusername/staff-communication-addon.git
   cd staff-communication-addon
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Sideload the add-in** in Excel for testing

### Build Commands

- `npm run build` - Production build
- `npm run dev` - Development server
- `npm run test` - Run tests
- `npm run lint` - Code linting

## 📁 Project Structure

```
staff-communication-addon/
├── src/                    # Source code
│   ├── taskpane/          # Main task pane interface
│   ├── commands/          # Add-in commands
│   ├── services/          # Business logic services
│   └── components/        # Reusable components
├── dist/                  # Built files (auto-generated)
├── docs/                  # Documentation
├── .github/workflows/     # GitHub Actions
├── scripts/               # Deployment scripts
├── manifest.xml           # Office Add-in manifest
└── package.json           # Project configuration
```

## 🌐 Deployment Options

### GitHub Pages (Free)
- **Cost**: Free for public repos
- **Setup**: Automatic with GitHub Actions
- **SSL**: Automatic HTTPS
- **Best for**: Development, small-medium organizations

### SharePoint Online (Enterprise)
- **Cost**: Included with Microsoft 365
- **Setup**: App Catalog deployment
- **Integration**: Native Office integration
- **Best for**: Large enterprises with Microsoft 365

### Other Platforms
- **Netlify**: Advanced features, generous free tier
- **Vercel**: Performance optimized, global CDN
- **Azure Static Web Apps**: Deep Azure integration

## 📖 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) - Complete deployment instructions
- [Configuration Guide](docs/CONFIGURATION.md) - Setup and configuration
- [User Guide](docs/USER_GUIDE.md) - End-user documentation
- [Developer Guide](docs/DEVELOPER.md) - Development and customization
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🔧 Configuration

### Manifest Configuration

Update `manifest.xml` with your deployment URL:

```xml
<SourceLocation DefaultValue="https://yourdomain.com/taskpane.html"/>
```

### SharePoint Configuration

For SharePoint integration, configure the SharePoint service:

```javascript
// In src/services/sharePointService.js
const SHAREPOINT_SITE_URL = 'https://yourcompany.sharepoint.com/sites/yoursite';
```

## 🚀 GitHub Actions Deployment

This repository includes automated deployment via GitHub Actions:

- **Automatic builds** on push to main branch
- **GitHub Pages deployment** with optimized assets
- **Manifest validation** and testing
- **Multi-environment support** (dev, staging, production)

## 📊 Features Overview

### Mail Merge Engine
- Intelligent field detection from Excel data
- Conditional content with `{{#if}}` blocks
- Advanced formatting (dates, phone numbers, etc.)
- Real-time preview with actual data

### Template Management
- 8+ professional template categories
- Version control and approval workflows
- Usage analytics and optimization
- Template sharing and collaboration

### Campaign Management
- Staff segmentation and targeting
- Delivery scheduling and automation
- Performance tracking and analytics
- Compliance and audit trails

## 🔒 Security

- **HTTPS required** for all deployments
- **Azure AD integration** for authentication
- **SharePoint security** for data protection
- **Content Security Policy** implementation
- **Regular security updates** via automated workflows

## 📈 Analytics

Built-in analytics provide insights into:
- Email open and click rates
- Template usage patterns
- Staff engagement metrics
- Campaign performance trends

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [docs/](docs/) folder
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

## 🎯 Roadmap

- [ ] Mobile app integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Integration with Teams
- [ ] Advanced workflow automation

---

**Built with ❤️ for internal staff communication excellence**

