/* global Office, console */

// Import services and components
import { MailMergeService } from '../services/mailMergeService.js';
import { TemplateService } from '../services/templateService.js';
import { CampaignService } from '../services/campaignService.js';
import { HelpSystem } from '../services/helpSystem.js';
import { CampaignManager } from '../components/CampaignManager.jsx';

// Initialize services
const mailMergeService = new MailMergeService();
const templateService = new TemplateService();
const campaignService = new CampaignService();
const helpSystem = new HelpSystem();

// Initialize components
let campaignManager;

// Global state
let currentContacts = [];
let currentMergeFields = [];
let isOfficeReady = false;

Office.onReady((info) => {
    if (info.host === Office.HostType.Excel) {
        isOfficeReady = true;
        console.log('Office is ready, initializing services...');
        initializeServices();
        setupEventHandlers();
        updateUI();
    }
});

async function initializeServices() {
    try {
        await mailMergeService.initialize();
        await templateService.initialize();
        await campaignService.initialize();
        await helpSystem.initialize();
        
        // Initialize campaign manager
        campaignManager = new CampaignManager(campaignService, templateService, helpSystem);
        
        // Load sample templates for development
        await templateService.loadSampleTemplates();
        
        console.log('All services initialized successfully');
        updateConnectionStatus('Services initialized - Ready for staff communications', 'success');
        
        // Add contextual help to the interface
        addContextualHelp();
        
    } catch (error) {
        console.error('Failed to initialize services:', error);
        updateConnectionStatus('Service initialization failed', 'error');
    }
}

function addContextualHelp() {
    // Add help to main sections
    const contactSection = document.querySelector('h3:contains("Contact Management")') || 
                          document.querySelector('[style*="Contact Management"]')?.parentElement;
    if (contactSection) {
        helpSystem.addSectionHelp(contactSection, 'excel_integration', 'Excel Integration Help');
    }
    
    const templateSection = document.querySelector('h3:contains("Email Templates")') || 
                           document.querySelector('[style*="Email Templates"]')?.parentElement;
    if (templateSection) {
        helpSystem.addSectionHelp(templateSection, 'template_categories', 'Template Help');
    }
    
    // Add help icons to buttons
    const loadContactsBtn = document.getElementById('load-contacts-btn');
    if (loadContactsBtn && loadContactsBtn.parentElement) {
        helpSystem.addHelpIcon(loadContactsBtn.parentElement, 'excel_integration');
    }
    
    const createTemplateBtn = document.getElementById('create-template-btn');
    if (createTemplateBtn && createTemplateBtn.parentElement) {
        helpSystem.addHelpIcon(createTemplateBtn.parentElement, 'mail_merge_basics');
    }
}

function setupEventHandlers() {
    // Contact management
    document.getElementById('load-contacts-btn').addEventListener('click', loadContactsFromExcel);
    document.getElementById('sync-sharepoint-btn').addEventListener('click', syncWithSharePoint);
    
    // Template management
    document.getElementById('create-template-btn').addEventListener('click', openTemplateEditor);
    document.getElementById('manage-templates-btn').addEventListener('click', showTemplateManager);
    
    // Campaign management - Updated to use new campaign manager
    document.getElementById('create-campaign-btn').addEventListener('click', () => {
        if (currentContacts.length === 0) {
            alert('Please load staff contacts first before creating a campaign.');
            return;
        }
        campaignManager.showCampaignCreator();
    });
    document.getElementById('view-analytics-btn').addEventListener('click', showCampaignAnalytics);
    
    // Quick actions
    document.getElementById('import-action').addEventListener('click', importContacts);
    document.getElementById('export-action').addEventListener('click', exportContacts);
    document.getElementById('segments-action').addEventListener('click', manageSegments);
    document.getElementById('cleanup-action').addEventListener('click', cleanupData);
    document.getElementById('browse-action').addEventListener('click', browseTemplates);
    document.getElementById('editor-action').addEventListener('click', openTemplateEditor);
    document.getElementById('schedule-action').addEventListener('click', () => {
        campaignManager.showCampaignCreator();
    });
    document.getElementById('analytics-action').addEventListener('click', showCampaignAnalytics);
}

async function loadContactsFromExcel() {
    try {
        updateConnectionStatus('Loading staff contacts from Excel...', 'loading');
        
        await Excel.run(async (context) => {
            const worksheet = context.workbook.worksheets.getActiveWorksheet();
            const usedRange = worksheet.getUsedRange();
            
            usedRange.load(['values', 'rowCount', 'columnCount']);
            await context.sync();
            
            if (usedRange.rowCount === 0) {
                throw new Error('No data found in the active worksheet');
            }
            
            const values = usedRange.values;
            const headers = values[0].map(header => String(header).trim());
            
            // Convert to contact objects
            const contacts = [];
            for (let i = 1; i < values.length; i++) {
                const contact = { id: i };
                headers.forEach((header, index) => {
                    if (header && values[i][index] !== null && values[i][index] !== undefined) {
                        contact[header] = values[i][index];
                    }
                });
                
                // Only add contacts with at least an email or name
                if (contact.email || contact.firstName || contact.name) {
                    contacts.push(contact);
                }
            }
            
            currentContacts = contacts;
            
            // Extract merge fields
            currentMergeFields = mailMergeService.extractMergeFields(contacts);
            
            // Update UI
            updateContactCount(contacts.length);
            updateConnectionStatus(`Loaded ${contacts.length} staff contacts successfully`, 'success');
            
            // Show helpful tip for first-time users
            if (contacts.length > 0) {
                showSuccessTip('Staff contacts loaded! You can now create personalized email campaigns with mail merge fields.');
            }
            
            console.log('Staff contacts loaded:', contacts);
            console.log('Available merge fields:', currentMergeFields);
        });
        
    } catch (error) {
        console.error('Failed to load contacts:', error);
        updateConnectionStatus('Failed to load contacts: ' + error.message, 'error');
        
        // Show helpful error guidance
        showErrorHelp('contact_loading_failed');
    }
}

function showSuccessTip(message) {
    const tip = document.createElement('div');
    tip.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #d4edda;
        color: #155724;
        padding: 15px 20px;
        border-radius: 8px;
        border: 1px solid #c3e6cb;
        max-width: 300px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    tip.innerHTML = `
        <div style="display: flex; align-items: start; gap: 10px;">
            <span style="font-size: 18px;">✅</span>
            <div style="flex: 1;">
                <strong>Success!</strong><br>
                ${message}
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 16px; cursor: pointer;">×</button>
        </div>
    `;
    
    document.body.appendChild(tip);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (tip.parentElement) {
            tip.remove();
        }
    }, 5000);
}

function showErrorHelp(errorType) {
    const helpContent = {
        'contact_loading_failed': `
            <div class="help-content">
                <h4>📊 Excel Data Loading Tips</h4>
                <p>If contacts failed to load, check these common issues:</p>
                <ul>
                    <li><strong>Empty worksheet:</strong> Make sure your Excel sheet has data</li>
                    <li><strong>Missing headers:</strong> First row should contain column names</li>
                    <li><strong>Required fields:</strong> Include at least Email and First Name columns</li>
                    <li><strong>Data format:</strong> Avoid merged cells or complex formatting</li>
                </ul>
                <p><strong>💡 Tip:</strong> Try selecting a specific range of data before loading.</p>
            </div>
        `
    };
    
    if (helpContent[errorType]) {
        helpSystem.showHelpPanel(errorType);
        helpSystem.helpContent.set(errorType, {
            title: 'Troubleshooting',
            content: helpContent[errorType],
            category: 'troubleshooting'
        });
    }
}

async function syncWithSharePoint() {
    try {
        updateConnectionStatus('Syncing with SharePoint...', 'loading');
        
        // Mock SharePoint sync for now
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        updateConnectionStatus('SharePoint sync completed', 'success');
        
    } catch (error) {
        console.error('SharePoint sync failed:', error);
        updateConnectionStatus('SharePoint sync failed: ' + error.message, 'error');
    }
}

function openTemplateEditor() {
    // Create modal for template editor with enhanced help
    const modal = createModal('Email Template Editor', '90%', '90%');
    
    // Add template editor interface with embedded help
    modal.querySelector('.modal-body').innerHTML = `
        <div style="display: flex; height: 100%; gap: 20px;">
            <div style="width: 300px; background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                    <h4 style="margin: 0;">📧 Mail Merge Fields</h4>
                    <button class="help-toggle" onclick="helpSystem.showHelpPanel('mail_merge_basics')">📚 Help</button>
                </div>
                <div id="merge-fields-list" style="max-height: 300px; overflow-y: auto;">
                    ${renderMergeFieldsList()}
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 6px; font-size: 13px;">
                    <strong>💡 Quick Tips:</strong>
                    <ul style="margin: 8px 0; padding-left: 16px;">
                        <li>Click fields to insert them</li>
                        <li>Use {{#if field}} for conditions</li>
                        <li>Format with {{field|upper}}</li>
                    </ul>
                    <button onclick="helpSystem.showHelpPanel('conditional_content')" style="background: none; border: none; color: #1976d2; text-decoration: underline; cursor: pointer; font-size: 12px;">
                        Learn about conditional content →
                    </button>
                </div>
                
                <h4 style="margin-top: 30px;">🔍 Preview</h4>
                <select id="preview-contact" style="width: 100%; padding: 8px; margin-bottom: 10px;">
                    <option value="">Select staff member...</option>
                    ${currentContacts.map(contact => 
                        `<option value="${contact.id}">${contact.firstName || 'Unknown'} ${contact.lastName || ''} (${contact.email || 'No email'})</option>`
                    ).join('')}
                </select>
                <button id="preview-btn" style="width: 100%; padding: 10px; background: #28a745; color: white; border: none; border-radius: 4px;">
                    👁️ Preview Template
                </button>
            </div>
            
            <div style="flex: 1; background: white; border-radius: 8px; overflow: hidden;">
                <div style="padding: 15px; background: #f8f9fa; border-bottom: 1px solid #dee2e6; display: flex; gap: 10px; align-items: center;">
                    <input type="text" id="template-name" placeholder="Template Name" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <select id="template-category" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        ${templateService.getCategories().map(cat => 
                            `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
                        ).join('')}
                    </select>
                    <button onclick="helpSystem.showHelpPanel('template_categories')" style="padding: 8px; background: #6c757d; color: white; border: none; border-radius: 4px;">
                        📚 Help
                    </button>
                    <button id="save-template-btn" style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px;">
                        💾 Save Template
                    </button>
                </div>
                
                <div style="padding: 20px;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Subject Line:</label>
                        <input type="text" id="template-subject" placeholder="Enter email subject..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <label style="font-weight: 500;">Email Content:</label>
                            <button onclick="helpSystem.showHelpPanel('field_formatting')" style="background: none; border: none; color: #667eea; text-decoration: underline; cursor: pointer; font-size: 12px;">
                                Field formatting help
                            </button>
                        </div>
                        <textarea id="template-content" rows="18" style="width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; font-size: 14px;" placeholder="Enter your email template here...

📧 STAFF COMMUNICATION TEMPLATE

Dear {{firstName}},

Use merge fields to personalize your message:
- {{firstName}} {{lastName}} - Staff member's name
- {{jobTitle}} - Their position
- {{department}} - Their department
- {{manager}} - Their manager's name
- {{startDate}} - When they started

💡 CONDITIONAL CONTENT:
{{#if manager}}Your manager {{manager}} will be in touch.{{/if}}
{{#unless department}}Please update your department information.{{/unless}}

✨ FORMATTING OPTIONS:
- {{firstName|upper}} - UPPERCASE
- {{firstName|title}} - Title Case
- {{startDate|date:long}} - January 15, 2024

Best regards,
The {{senderDepartment}} Team"></textarea>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Setup event handlers for template editor
    setupTemplateEditorHandlers(modal);
    
    // Add contextual help to the form
    helpSystem.enhanceFormWithHelp(modal);
}

// Continue with existing functions but add help integration...
function setupTemplateEditorHandlers(modal) {
    // Merge field insertion
    modal.querySelectorAll('.merge-field-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.dataset.field;
            const textarea = modal.querySelector('#template-content');
            const cursorPos = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, cursorPos);
            const textAfter = textarea.value.substring(textarea.selectionEnd);
            textarea.value = textBefore + field + textAfter;
            textarea.focus();
            textarea.setSelectionRange(cursorPos + field.length, cursorPos + field.length);
            
            // Show helpful tip for first-time users
            if (!localStorage.getItem('merge_field_tip_shown')) {
                showSuccessTip('Merge field inserted! Use conditional blocks like {{#if fieldName}} for dynamic content.');
                localStorage.setItem('merge_field_tip_shown', 'true');
            }
        });
    });
    
    // Preview functionality with enhanced error handling
    modal.querySelector('#preview-btn').addEventListener('click', async () => {
        const contactId = modal.querySelector('#preview-contact').value;
        const template = modal.querySelector('#template-content').value;
        const subject = modal.querySelector('#template-subject').value;
        
        if (!contactId || !template) {
            alert('Please select a staff member and enter template content');
            return;
        }
        
        const contact = currentContacts.find(c => c.id == contactId);
        if (!contact) {
            alert('Staff member not found');
            return;
        }
        
        try {
            const processedContent = await mailMergeService.processTemplate(template, contact);
            const processedSubject = await mailMergeService.processTemplate(subject, contact);
            
            // Show preview in new window with better styling
            const previewWindow = window.open('', '_blank', 'width=800,height=600');
            previewWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Email Preview - Staff Communication</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                        .email-preview { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                        .email-header { background: #667eea; color: white; padding: 20px; }
                        .email-meta { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #ddd; font-size: 14px; }
                        .email-body { padding: 30px; line-height: 1.6; }
                        .subject { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                        .recipient { opacity: 0.9; }
                        .preview-note { background: #fff3cd; color: #856404; padding: 10px; margin: 20px; border-radius: 4px; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="preview-note">
                        📧 <strong>Email Preview</strong> - This is how the email will appear to ${contact.firstName} ${contact.lastName}
                    </div>
                    <div class="email-preview">
                        <div class="email-header">
                            <div class="subject">${processedSubject}</div>
                            <div class="recipient">To: ${contact.email}</div>
                        </div>
                        <div class="email-meta">
                            <strong>From:</strong> Staff Communications<br>
                            <strong>Date:</strong> ${new Date().toLocaleDateString()}
                        </div>
                        <div class="email-body">
                            ${processedContent.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                </body>
                </html>
            `);
            previewWindow.document.close();
            
        } catch (error) {
            alert('Preview failed: ' + error.message + '\n\nCheck your merge field syntax and try again.');
            console.error('Preview error:', error);
        }
    });
    
    // Save template with validation
    modal.querySelector('#save-template-btn').addEventListener('click', async () => {
        const name = modal.querySelector('#template-name').value;
        const category = modal.querySelector('#template-category').value;
        const subject = modal.querySelector('#template-subject').value;
        const content = modal.querySelector('#template-content').value;
        
        if (!name || !content) {
            alert('Please enter template name and content');
            return;
        }
        
        try {
            const template = await templateService.createTemplate({
                name,
                category,
                subject,
                html: content,
                description: `Staff communication template for ${category}`,
                tags: [category, 'staff-communication']
            });
            
            showSuccessTip('Template saved successfully! You can now use it in campaigns.');
            modal.remove();
            
        } catch (error) {
            alert('Failed to save template: ' + error.message);
        }
    });
}

function showCampaignAnalytics() {
    const modal = createModal('📊 Campaign Analytics & Reports', '85%', '80%');
    
    modal.querySelector('.modal-body').innerHTML = `
        <div style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 30px;">
                <h3 style="margin: 0;">📈 Staff Communication Analytics</h3>
                <button onclick="helpSystem.showHelpPanel('campaign_analytics')" style="padding: 6px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; font-size: 12px;">
                    📚 Help
                </button>
            </div>
            
            <!-- Summary Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold;">12</div>
                    <div style="opacity: 0.9;">Total Campaigns</div>
                </div>
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold;">1,847</div>
                    <div style="opacity: 0.9;">Staff Reached</div>
                </div>
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold;">78%</div>
                    <div style="opacity: 0.9;">Average Open Rate</div>
                </div>
                <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 20px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold;">23%</div>
                    <div style="opacity: 0.9;">Average Click Rate</div>
                </div>
            </div>
            
            <!-- Recent Campaigns -->
            <div style="background: white; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;">
                <div style="padding: 20px; background: #f8f9fa; border-bottom: 1px solid #e9ecef;">
                    <h4 style="margin: 0;">📋 Recent Staff Communications</h4>
                </div>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e9ecef;">Campaign</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e9ecef;">Type</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e9ecef;">Recipients</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e9ecef;">Open Rate</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e9ecef;">Status</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e9ecef;">Sent</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">Q1 Performance Review Reminder</td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">👥 HR</td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">150</td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">
                                    <div style="background: #e8f5e8; color: #2e7d32; padding: 4px 8px; border-radius: 12px; display: inline-block; font-size: 12px;">
                                        85%
                                    </div>
                                </td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">
                                    <span style="background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 12px; font-size: 12px;">✓ Sent</span>
                                </td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">2 hours ago</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">New Safety Protocols Update</td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">📋 Policy</td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">200</td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">
                                    <div style="background: #e8f5e8; color: #2e7d32; padding: 4px 8px; border-radius: 12px; display: inline-block; font-size: 12px;">
                                        92%
                                    </div>
                                </td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">
                                    <span style="background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 12px; font-size: 12px;">✓ Sent</span>
                                </td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">1 day ago</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">Welcome New Team Members</td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">📢 Announcement</td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">180</td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">
                                    <div style="background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 12px; display: inline-block; font-size: 12px;">
                                        67%
                                    </div>
                                </td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">
                                    <span style="background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 12px; font-size: 12px;">✓ Sent</span>
                                </td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f3f4;">3 days ago</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 6px;">
                <strong>💡 Analytics Insights:</strong>
                <ul style="margin: 8px 0; padding-left: 20px;">
                    <li>HR communications have the highest engagement rates (85%+ open rate)</li>
                    <li>Policy updates perform well when marked as high priority</li>
                    <li>Best sending times: Tuesday-Thursday, 9-11 AM</li>
                    <li>Personalized subject lines increase open rates by 26%</li>
                </ul>
            </div>
        </div>
    `;
    
    // Add analytics help content
    helpSystem.helpContent.set('campaign_analytics', {
        title: 'Understanding Analytics',
        content: `
            <div class="help-content">
                <h4>📊 Campaign Analytics Guide</h4>
                
                <h5>Key Metrics:</h5>
                <ul>
                    <li><strong>Open Rate:</strong> Percentage of recipients who opened the email</li>
                    <li><strong>Click Rate:</strong> Percentage who clicked links in the email</li>
                    <li><strong>Delivery Rate:</strong> Successfully delivered emails</li>
                    <li><strong>Bounce Rate:</strong> Emails that couldn't be delivered</li>
                </ul>
                
                <h5>Benchmarks for Staff Communications:</h5>
                <ul>
                    <li><strong>Excellent:</strong> 80%+ open rate, 20%+ click rate</li>
                    <li><strong>Good:</strong> 60-80% open rate, 10-20% click rate</li>
                    <li><strong>Needs Improvement:</strong> Below 60% open rate</li>
                </ul>
                
                <h5>Improving Performance:</h5>
                <ul>
                    <li>Use clear, action-oriented subject lines</li>
                    <li>Personalize with merge fields</li>
                    <li>Send at optimal times (Tuesday-Thursday, 9-11 AM)</li>
                    <li>Keep content concise and relevant</li>
                    <li>Include clear calls-to-action</li>
                </ul>
            </div>
        `,
        category: 'analytics'
    });
}

// Continue with existing utility functions...
function renderMergeFieldsList() {
    if (currentMergeFields.length === 0) {
        return `
            <div style="text-align: center; padding: 20px; color: #666;">
                <div style="font-size: 48px; margin-bottom: 10px;">📊</div>
                <p>Load staff contacts first to see available merge fields</p>
                <button onclick="document.getElementById('load-contacts-btn').click()" style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Load Contacts Now
                </button>
            </div>
        `;
    }
    
    return currentMergeFields.map(field => `
        <div class="merge-field-btn" data-field="${field.placeholder}" style="
            padding: 8px 12px; 
            margin-bottom: 5px; 
            background: #e9ecef; 
            border-radius: 4px; 
            cursor: pointer;
            transition: background-color 0.2s;
        " onmouseover="this.style.backgroundColor='#dee2e6'" onmouseout="this.style.backgroundColor='#e9ecef'">
            <div style="font-weight: 500; color: #495057;">${field.displayName}</div>
            <div style="font-size: 12px; color: #6c757d; font-family: monospace;">${field.placeholder}</div>
        </div>
    `).join('');
}

// Rest of the existing functions remain the same but with help integration...
function showTemplateManager() {
    const modal = createModal('Template Manager', '80%', '80%');
    
    modal.querySelector('.modal-body').innerHTML = `
        <div style="margin-bottom: 20px; display: flex; gap: 10px; align-items: center;">
            <input type="text" id="template-search" placeholder="Search templates..." style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <select id="category-filter" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="">All Categories</option>
                ${templateService.getCategories().map(cat => 
                    `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
                ).join('')}
            </select>
            <button onclick="helpSystem.showHelpPanel('template_categories')" style="padding: 8px 12px; background: #6c757d; color: white; border: none; border-radius: 4px;">
                📚 Help
            </button>
            <button onclick="refreshTemplateList()" style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px;">
                🔄 Refresh
            </button>
        </div>
        
        <div id="templates-list" style="max-height: 500px; overflow-y: auto;">
            Loading templates...
        </div>
    `;
    
    // Load and display templates
    loadTemplatesList();
}

// Additional functions for campaign management, etc.
function createCampaign() {
    if (currentContacts.length === 0) {
        alert('Please load staff contacts first before creating a campaign.');
        showErrorHelp('no_contacts_loaded');
        return;
    }
    campaignManager.showCampaignCreator();
}

function viewAnalytics() {
    showCampaignAnalytics();
}

function importContacts() {
    alert('Import contacts feature coming soon!');
}

function exportContacts() {
    alert('Export contacts feature coming soon!');
}

function manageSegments() {
    alert('Segment management feature coming soon!');
}

function cleanupData() {
    alert('Data cleanup feature coming soon!');
}

function browseTemplates() {
    showTemplateManager();
}

function scheduleCampaign() {
    campaignManager.showCampaignCreator();
}

// Utility functions
function updateConnectionStatus(message, type = 'info') {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status-${type}`;
    }
}

function updateContactCount(count) {
    const countElement = document.getElementById('contact-count');
    if (countElement) {
        countElement.textContent = count;
    }
}

function updateUI() {
    // Update UI based on current state
    updateConnectionStatus('Initializing staff communication system...', 'loading');
}

function createModal(title, width = '60%', height = '70%') {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            width: ${width};
            height: ${height};
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            max-width: 95vw;
            max-height: 95vh;
        ">
            <div style="
                padding: 15px 20px;
                border-bottom: 1px solid #dee2e6;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #f8f9fa;
                border-radius: 8px 8px 0 0;
            ">
                <h3 style="margin: 0; color: #495057;">${title}</h3>
                <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #6c757d;
                ">×</button>
            </div>
            <div class="modal-body" style="flex: 1; overflow: auto;"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

// Make functions globally available
window.refreshTemplateList = loadTemplatesList;
window.editTemplate = (id) => alert('Edit template: ' + id);
window.duplicateTemplate = (id) => alert('Duplicate template: ' + id);
window.deleteTemplate = (id) => alert('Delete template: ' + id);
window.helpSystem = helpSystem;

