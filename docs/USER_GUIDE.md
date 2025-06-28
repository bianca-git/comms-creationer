# User Guide - Staff Communication Excel Add-in

## Getting Started

### What is the Staff Communication Add-in?

The Staff Communication Excel Add-in transforms Excel into a powerful internal communication platform with advanced mail merge capabilities. It's designed specifically for organizations that need to send personalized communications to staff members using data stored in Excel spreadsheets.

### Key Features

- **Advanced Mail Merge**: Create personalized emails with conditional content
- **Professional Templates**: 8+ categories of pre-built email templates
- **Excel Integration**: Use your existing Excel contact data
- **SharePoint Storage**: Enterprise-grade data security and backup
- **Campaign Analytics**: Track email performance and engagement
- **Embedded Help**: Contextual guidance built into the interface

## Installation

### Installing the Add-in

1. **Open Excel** (Excel 2016+, Excel Online, or Excel for Microsoft 365)
2. **Go to Insert** → **Office Add-ins** → **Upload My Add-in**
3. **Enter the manifest URL**: `https://yourdomain.com/manifest.xml`
4. **Click Add** and the add-in will appear in your Excel ribbon

### First-Time Setup

1. **Open the add-in** from the Home ribbon
2. **Connect to SharePoint** (if using SharePoint integration)
3. **Review the welcome tutorial** for key features
4. **Import or create your first contact list**

## Working with Contacts

### Setting Up Contact Data

Your contact data should be organized in an Excel table with these recommended columns:

| Column | Description | Example |
|--------|-------------|---------|
| FirstName | Staff member's first name | John |
| LastName | Staff member's last name | Smith |
| Email | Email address | john.smith@company.com |
| Department | Department or team | Marketing |
| Position | Job title | Marketing Manager |
| StartDate | Employment start date | 2023-01-15 |
| Manager | Manager's name | Sarah Johnson |
| Location | Office location | New York |

### Loading Contacts

1. **Select your contact data** in Excel (including headers)
2. **Click "Load Contacts"** in the add-in panel
3. **Review the detected fields** and confirm mapping
4. **Save to SharePoint** (optional) for backup and sharing

### Managing Contact Lists

- **Create multiple lists** for different departments or purposes
- **Update contacts** by reloading from Excel
- **Export contacts** to share with other team members
- **Archive old lists** to keep your workspace organized

## Creating Email Templates

### Using Pre-built Templates

1. **Click "Create New Template"** in the Templates section
2. **Choose a category**:
   - HR Communications
   - Training & Development
   - Company Announcements
   - Policy Updates
   - Event Invitations
   - Performance Reviews
   - Benefits Information
   - General Communications

3. **Select a template** from the category
4. **Customize the content** using the built-in editor

### Template Editor Features

- **WYSIWYG Editor**: Visual editing with formatting tools
- **Merge Field Panel**: Drag and drop contact fields
- **Real-time Preview**: See how emails will look with actual data
- **Conditional Content**: Show/hide content based on contact data
- **Template Library**: Save and reuse your custom templates

### Advanced Merge Fields

#### Basic Merge Fields
```
{{FirstName}} - Inserts the contact's first name
{{LastName}} - Inserts the contact's last name
{{Email}} - Inserts the contact's email address
{{Department}} - Inserts the contact's department
```

#### Conditional Content
```
{{#if Manager}}
Your manager {{Manager}} has approved this request.
{{/if}}

{{#if Department == "Sales"}}
Special sales team information here.
{{/if}}
```

#### Formatting Options
```
{{FirstName | uppercase}} - JOHN
{{StartDate | date}} - January 15, 2023
{{Phone | phone}} - (555) 123-4567
```

## Sending Communications

### Creating a Campaign

1. **Select your template** from the Templates section
2. **Choose your contact list** or segment
3. **Preview your emails** with real contact data
4. **Set campaign details**:
   - Campaign name
   - Subject line
   - Sender information
   - Delivery schedule

### Targeting and Segmentation

Create targeted communications by filtering your contact list:

- **Department-based**: Send to specific departments
- **Location-based**: Target specific office locations
- **Role-based**: Communicate with managers vs. individual contributors
- **Date-based**: Target based on start dates, anniversaries, etc.

### Preview and Testing

1. **Use the Preview feature** to see actual emails
2. **Send test emails** to yourself or colleagues
3. **Check formatting** across different email clients
4. **Verify merge fields** are working correctly

### Delivery Options

- **Send Immediately**: Deliver emails right away
- **Schedule Delivery**: Set a specific date and time
- **Batch Delivery**: Send in groups to avoid overwhelming email servers
- **Draft Mode**: Save campaigns to send later

## Analytics and Reporting

### Campaign Performance

Track the success of your staff communications:

- **Delivery Rate**: Percentage of emails successfully delivered
- **Open Rate**: How many staff members opened the email
- **Click Rate**: Engagement with links in your emails
- **Response Rate**: Replies and feedback received

### Detailed Analytics

- **Individual Contact Tracking**: See who opened/clicked
- **Time-based Analysis**: Best times for staff engagement
- **Content Performance**: Which templates work best
- **Department Comparisons**: Engagement by team or location

### Reporting Features

- **Export Reports**: Download analytics as Excel files
- **Scheduled Reports**: Automatic weekly/monthly summaries
- **Dashboard View**: Quick overview of all campaigns
- **Trend Analysis**: Performance over time

## SharePoint Integration

### Setting Up SharePoint

1. **Configure SharePoint site** in the add-in settings
2. **Set up document libraries** for templates and attachments
3. **Configure contact lists** for centralized data management
4. **Set permissions** for team access

### Benefits of SharePoint Integration

- **Centralized Storage**: All templates and data in one place
- **Team Collaboration**: Multiple users can access and edit
- **Version Control**: Track changes to templates and data
- **Backup and Recovery**: Enterprise-grade data protection
- **Security**: Role-based access controls

### Working with SharePoint Data

- **Sync contact lists** between Excel and SharePoint
- **Share templates** with team members
- **Collaborate on campaigns** with approval workflows
- **Archive completed campaigns** for compliance

## Tips and Best Practices

### Email Content Best Practices

1. **Keep it concise**: Staff members are busy - get to the point quickly
2. **Use clear subject lines**: Make the purpose obvious
3. **Personalize appropriately**: Use merge fields to make it relevant
4. **Include clear calls to action**: Tell people what you want them to do
5. **Test thoroughly**: Always preview and test before sending

### Data Management

1. **Keep contact data current**: Regular updates ensure accuracy
2. **Use consistent formatting**: Standardize data entry
3. **Backup regularly**: Export data periodically
4. **Clean up old data**: Remove outdated contacts
5. **Document your processes**: Help others understand your system

### Template Organization

1. **Use descriptive names**: Make templates easy to find
2. **Organize by category**: Group similar templates together
3. **Version your templates**: Keep track of changes
4. **Share successful templates**: Let others benefit from your work
5. **Regular reviews**: Update templates to stay current

### Campaign Management

1. **Plan your communications**: Avoid overwhelming staff
2. **Coordinate with other teams**: Prevent conflicting messages
3. **Track performance**: Learn what works best
4. **Follow up appropriately**: Ensure important messages are received
5. **Maintain compliance**: Follow organizational communication policies

## Troubleshooting

### Common Issues

**Add-in won't load**
- Check your internet connection
- Verify the manifest URL is correct
- Try refreshing Excel
- Contact your IT administrator

**Contacts not loading**
- Ensure data is in a proper Excel table format
- Check that headers are in the first row
- Verify there are no empty rows in your data
- Make sure email addresses are valid

**Templates not saving**
- Check your SharePoint connection
- Verify you have edit permissions
- Try saving with a different name
- Clear your browser cache

**Emails not sending**
- Verify email addresses are correct
- Check your organization's email policies
- Ensure you have proper permissions
- Try sending a test email first

### Getting Help

1. **Built-in Help**: Click the help icon (?) in any section
2. **Documentation**: Check the docs folder in the repository
3. **IT Support**: Contact your organization's IT team
4. **GitHub Issues**: Report bugs or request features
5. **Email Support**: [Contact support](mailto:support@yourcompany.com?subject=Staff%20Communication%20Add-in%20Help)

## Advanced Features

### Custom Merge Field Functions

Create custom formatting functions for your merge fields:

```javascript
// Custom date formatting
{{StartDate | customDate:"MMMM Do, YYYY"}}

// Custom number formatting
{{Salary | currency}}

// Custom text transformations
{{Department | departmentCode}}
```

### Workflow Integration

- **Approval Workflows**: Route campaigns for approval before sending
- **Automated Campaigns**: Trigger emails based on Excel data changes
- **Integration APIs**: Connect with other organizational systems
- **Custom Actions**: Add organization-specific functionality

### Advanced Analytics

- **Custom Metrics**: Define your own success measurements
- **Comparative Analysis**: Compare campaigns across time periods
- **Predictive Analytics**: Identify optimal sending times
- **ROI Tracking**: Measure the business impact of communications

## Security and Compliance

### Data Protection

- **Encryption**: All data is encrypted in transit and at rest
- **Access Controls**: Role-based permissions for team members
- **Audit Trails**: Track who accessed what and when
- **Data Retention**: Automatic cleanup of old data

### Compliance Features

- **GDPR Compliance**: Respect data privacy regulations
- **Retention Policies**: Automatic data lifecycle management
- **Consent Management**: Track communication preferences
- **Reporting**: Generate compliance reports as needed

### Best Security Practices

1. **Regular Updates**: Keep the add-in updated
2. **Strong Passwords**: Use secure SharePoint credentials
3. **Limited Access**: Only give access to those who need it
4. **Regular Audits**: Review who has access periodically
5. **Training**: Educate users on security best practices

---

## Support and Resources

- **Quick Start Guide**: [docs/QUICK_START.md](QUICK_START.md)
- **Deployment Guide**: [docs/DEPLOYMENT.md](DEPLOYMENT.md)
- **Developer Guide**: [docs/DEVELOPER.md](DEVELOPER.md)
- **Troubleshooting**: [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md)

**Need immediate help?** [Email our support team](mailto:support@yourcompany.com?subject=Staff%20Communication%20Add-in%20Support&body=Please%20describe%20your%20issue%20and%20include%20any%20error%20messages%20you're%20seeing.)

