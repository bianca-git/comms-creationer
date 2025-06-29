#!/usr/bin/env node

/**
 * Deployment script for Staff Communication Excel Add-in
 * Supports multiple hosting platforms with automated configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  buildDir: 'dist',
  manifestFile: 'manifest.xml',
  platforms: {
    github: {
      name: 'GitHub Pages',
      urlPattern: 'https://{owner}.github.io/{repo}',
      instructions: [
        '1. Push this repository to GitHub',
        '2. Enable GitHub Pages in repository settings',
        '3. Select "Deploy from a branch" and choose "main"',
        '4. Your add-in will be available at the URL shown above'
      ]
    },
    netlify: {
      name: 'Netlify',
      urlPattern: 'https://{sitename}.netlify.app',
      instructions: [
        '1. Connect your GitHub repository to Netlify',
        '2. Set build command: npm run build',
        '3. Set publish directory: dist',
        '4. Deploy and note your site URL'
      ]
    },
    vercel: {
      name: 'Vercel',
      urlPattern: 'https://{projectname}.vercel.app',
      instructions: [
        '1. Connect your GitHub repository to Vercel',
        '2. Set build command: npm run build',
        '3. Set output directory: dist',
        '4. Deploy and note your project URL'
      ]
    },
    azure: {
      name: 'Azure Static Web Apps',
      urlPattern: 'https://{appname}.azurestaticapps.net',
      instructions: [
        '1. Create Azure Static Web App resource',
        '2. Connect to your GitHub repository',
        '3. Set app location: /',
        '4. Set build location: dist',
        '5. Deploy and note your app URL'
      ]
    }
  }
};

class DeploymentManager {
  constructor() {
    this.projectRoot = process.cwd();
    this.buildPath = path.join(this.projectRoot, config.buildDir);
    this.manifestPath = path.join(this.buildPath, config.manifestFile);
  }

  async deploy(platform, options = {}) {
    console.log(`🚀 Deploying Staff Communication Excel Add-in to ${config.platforms[platform]?.name || platform}`);
    console.log('');

    try {
      // Step 1: Validate environment
      await this.validateEnvironment();

      // Step 2: Build project
      await this.buildProject();

      // Step 3: Configure for platform
      await this.configurePlatform(platform, options);

      // Step 4: Generate deployment info
      await this.generateDeploymentInfo(platform, options);

      // Step 5: Show instructions
      this.showDeploymentInstructions(platform, options);

      console.log('✅ Deployment preparation completed successfully!');
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    }
  }

  async validateEnvironment() {
    console.log('🔍 Validating environment...');

    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`   Node.js version: ${nodeVersion}`);

    // Check if package.json exists
    const packagePath = path.join(this.projectRoot, 'package.json');
    if (!fs.existsSync(packagePath)) {
      throw new Error('package.json not found. Are you in the correct directory?');
    }

    // Check if manifest.xml exists
    const sourceManifestPath = path.join(this.projectRoot, config.manifestFile);
    if (!fs.existsSync(sourceManifestPath)) {
      throw new Error('manifest.xml not found in project root');
    }

    console.log('   ✅ Environment validation passed');
  }

  async buildProject() {
    console.log('🔨 Building project...');

    try {
      // Install dependencies if node_modules doesn't exist
      if (!fs.existsSync(path.join(this.projectRoot, 'node_modules'))) {
        console.log('   Installing dependencies...');
        execSync('npm install', { stdio: 'inherit', cwd: this.projectRoot });
      }

      // Run build
      console.log('   Running build...');
      execSync('npm run build', { stdio: 'inherit', cwd: this.projectRoot });

      // Verify build output
      if (!fs.existsSync(this.buildPath)) {
        throw new Error('Build directory not created');
      }

      const requiredFiles = ['taskpane.html', 'taskpane.js', 'commands.html', 'commands.js'];
      for (const file of requiredFiles) {
        const filePath = path.join(this.buildPath, file);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Required build file missing: ${file}`);
        }
      }

      console.log('   ✅ Build completed successfully');
      
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  async configurePlatform(platform, options) {
    console.log(`⚙️  Configuring for ${config.platforms[platform]?.name || platform}...`);

    // Update manifest URLs
    if (fs.existsSync(this.manifestPath)) {
      let manifest = fs.readFileSync(this.manifestPath, 'utf8');
      
      // Replace placeholder URLs with platform-specific URLs
      if (options.baseUrl) {
        manifest = manifest.replace(/https:\/\/localhost:3000/g, options.baseUrl);
        manifest = manifest.replace(/https:\/\/yourdomain\.com/g, options.baseUrl);
        
        fs.writeFileSync(this.manifestPath, manifest);
        console.log(`   ✅ Updated manifest URLs to: ${options.baseUrl}`);
      } else {
        console.log('   ⚠️  Base URL not provided - you\'ll need to update manifest.xml manually');
      }
    }

    // Platform-specific configurations
    switch (platform) {
      case 'github':
        await this.configureGitHub(options);
        break;
      case 'netlify':
        await this.configureNetlify(options);
        break;
      case 'vercel':
        await this.configureVercel(options);
        break;
      case 'azure':
        await this.configureAzure(options);
        break;
    }
  }

  async configureGitHub(options) {
    // Create _config.yml for Jekyll (GitHub Pages)
    const configPath = path.join(this.buildPath, '_config.yml');
    const configContent = `
# GitHub Pages configuration for Office Add-in
include: [".well-known"]

# Disable Jekyll processing for Office Add-in files
plugins: []
markdown: kramdown
highlighter: rouge

# Security headers
webrick:
  headers:
    Content-Security-Policy: "default-src 'self' https:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:;"
    X-Frame-Options: "SAMEORIGIN"
    X-Content-Type-Options: "nosniff"
`.trim();

    fs.writeFileSync(configPath, configContent);
    console.log('   ✅ Created GitHub Pages configuration');
  }

  async configureNetlify(options) {
    // Create _redirects file for Netlify
    const redirectsPath = path.join(this.buildPath, '_redirects');
    const redirectsContent = `
# Netlify redirects for Office Add-in
/*    /index.html   200

# Security headers
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Content-Security-Policy: default-src 'self' https:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:;
`.trim();

    fs.writeFileSync(redirectsPath, redirectsContent);
    console.log('   ✅ Created Netlify configuration');
  }

  async configureVercel(options) {
    // Create vercel.json configuration
    const vercelConfigPath = path.join(this.projectRoot, 'vercel.json');
    const vercelConfig = {
      "version": 2,
      "builds": [
        {
          "src": "package.json",
          "use": "@vercel/static-build",
          "config": {
            "distDir": "dist"
          }
        }
      ],
      "headers": [
        {
          "source": "/(.*)",
          "headers": [
            {
              "key": "X-Frame-Options",
              "value": "SAMEORIGIN"
            },
            {
              "key": "X-Content-Type-Options",
              "value": "nosniff"
            },
            {
              "key": "Content-Security-Policy",
              "value": "default-src 'self' https:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:;"
            }
          ]
        }
      ]
    };

    fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
    console.log('   ✅ Created Vercel configuration');
  }

  async configureAzure(options) {
    // Create staticwebapp.config.json for Azure Static Web Apps
    const azureConfigPath = path.join(this.buildPath, 'staticwebapp.config.json');
    const azureConfig = {
      "routes": [
        {
          "route": "/*",
          "serve": "/index.html",
          "statusCode": 200
        }
      ],
      "globalHeaders": {
        "X-Frame-Options": "SAMEORIGIN",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'self' https:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:;"
      }
    };

    fs.writeFileSync(azureConfigPath, JSON.stringify(azureConfig, null, 2));
    console.log('   ✅ Created Azure Static Web Apps configuration');
  }

  async generateDeploymentInfo(platform, options) {
    console.log('📋 Generating deployment information...');

    const deploymentInfo = {
      platform: platform,
      platformName: config.platforms[platform]?.name || platform,
      timestamp: new Date().toISOString(),
      baseUrl: options.baseUrl || 'TBD',
      manifestUrl: options.baseUrl ? `${options.baseUrl}/manifest.xml` : 'TBD',
      files: fs.readdirSync(this.buildPath),
      version: require(path.join(this.projectRoot, 'package.json')).version
    };

    const infoPath = path.join(this.buildPath, 'deployment-info.json');
    fs.writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));

    console.log('   ✅ Deployment information saved');
  }

  showDeploymentInstructions(platform, options) {
    console.log('');
    console.log('📖 Deployment Instructions');
    console.log('='.repeat(50));
    
    const platformConfig = config.platforms[platform];
    if (platformConfig) {
      console.log(`Platform: ${platformConfig.name}`);
      console.log('');
      
      platformConfig.instructions.forEach((instruction, index) => {
        console.log(`${index + 1}. ${instruction}`);
      });
      
      console.log('');
      if (options.baseUrl) {
        console.log(`🌐 Your add-in will be available at: ${options.baseUrl}`);
        console.log(`📋 Manifest URL: ${options.baseUrl}/manifest.xml`);
      } else {
        console.log('🌐 Update the manifest.xml file with your deployment URL');
      }
    }
    
    console.log('');
    console.log('📁 Files ready for deployment in: ./dist/');
    console.log('');
    console.log('🎉 Happy deploying!');
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const platform = args[0] || 'github';
  const baseUrl = args[1];

  const manager = new DeploymentManager();
  manager.deploy(platform, { baseUrl }).catch(console.error);
}

module.exports = DeploymentManager;

