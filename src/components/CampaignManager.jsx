/**
 * Campaign Management Component for creating and managing staff communication campaigns
 */

export class CampaignManager {
    constructor(campaignService, templateService, helpSystem) {
        this.campaignService = campaignService;
        this.templateService = templateService;
        this.helpSystem = helpSystem;
        this.currentCampaign = null;
    }

    /**
     * Show campaign creation interface
     */
    showCampaignCreator() {
        const modal = this.createModal('Create Staff Communication Campaign', '85%', '85%');
        
        modal.querySelector('.modal-body').innerHTML = `
            <div style="display: flex; height: 100%; gap: 20px;">
                <!-- Campaign Setup Panel -->
                <div style="width: 350px; background: #f8f9fa; padding: 20px; border-radius: 8px; overflow-y: auto;">
                    <h4>📋 Campaign Setup</h4>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">
                            Campaign Name
                            <span class="help-icon" data-help="campaign_name">?</span>
                        </label>
                        <input type="text" id="campaign-name" placeholder="e.g., Monthly Team Update - March 2024" 
                               style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">
                            Communication Type
                            <span class="help-icon" data-help="communication_types">?</span>
                        </label>
                        <select id="campaign-type" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="announcement">📢 Announcement</option>
                            <option value="hr">👥 HR Communication</option>
                            <option value="training">🎓 Training & Development</option>
                            <option value="event">📅 Event & Meeting</option>
                            <option value="recognition">🏆 Recognition & Awards</option>
                            <option value="policy">📋 Policy Update</option>
                            <option value="emergency">🚨 Emergency</option>
                            <option value="general">📄 General</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">
                            Priority Level
                            <span class="help-icon" data-help="priority_levels">?</span>
                        </label>
                        <select id="campaign-priority" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="low">🟢 Low - General information</option>
                            <option value="normal" selected>🟡 Normal - Standard communication</option>
                            <option value="high">🟠 High - Important update</option>
                            <option value="urgent">🔴 Urgent - Immediate attention required</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">
                            Description
                        </label>
                        <textarea id="campaign-description" rows="3" placeholder="Brief description of this communication..."
                                  style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"></textarea>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: flex; align-items: center; font-weight: 500;">
                            <input type="checkbox" id="requires-approval" style="margin-right: 8px;">
                            Requires approval before sending
                            <span class="help-icon" data-help="approval_workflow">?</span>
                        </label>
                    </div>
                    
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
                    
                    <h4>🎯 Target Recipients</h4>
                    <div id="recipient-segments" style="max-height: 200px; overflow-y: auto;">
                        ${this.renderSegmentSelection()}
                    </div>
                    
                    <div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 4px; font-size: 13px;">
                        <strong>📊 Estimated Recipients:</strong> <span id="recipient-count">0</span>
                    </div>
                </div>
                
                <!-- Template Selection Panel -->
                <div style="flex: 1; background: white; border-radius: 8px; overflow: hidden;">
                    <div style="padding: 15px; background: #f8f9fa; border-bottom: 1px solid #dee2e6; display: flex; gap: 10px; align-items: center;">
                        <h4 style="margin: 0; flex: 1;">📧 Email Template</h4>
                        <button id="create-new-template-btn" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px;">
                            ✨ Create New Template
                        </button>
                        <button id="preview-campaign-btn" style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px;">
                            👁️ Preview
                        </button>
                    </div>
                    
                    <div style="padding: 20px;">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">
                                Select Template
                                <span class="help-icon" data-help="template_selection">?</span>
                            </label>
                            <select id="template-select" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                <option value="">Choose a template...</option>
                                ${this.renderTemplateOptions()}
                            </select>
                        </div>
                        
                        <div id="template-preview" style="border: 1px solid #dee2e6; border-radius: 8px; min-height: 300px; background: #fafafa; display: flex; align-items: center; justify-content: center; color: #6c757d;">
                            Select a template to see preview
                        </div>
                        
                        <div style="margin-top: 20px; display: flex; gap: 10px;">
                            <button id="edit-template-btn" disabled style="flex: 1; padding: 10px; background: #6c757d; color: white; border: none; border-radius: 4px;">
                                ✏️ Edit Template
                            </button>
                            <button id="test-send-btn" disabled style="flex: 1; padding: 10px; background: #fd7e14; color: white; border: none; border-radius: 4px;">
                                🧪 Send Test
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div style="padding: 20px; border-top: 1px solid #dee2e6; background: #f8f9fa; display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
                        style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px;">
                    Cancel
                </button>
                <button id="save-draft-btn" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px;">
                    💾 Save as Draft
                </button>
                <button id="schedule-campaign-btn" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 4px;">
                    📅 Schedule
                </button>
                <button id="send-now-btn" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 4px;">
                    🚀 Send Now
                </button>
            </div>
        `;
        
        // Setup event handlers
        this.setupCampaignCreatorHandlers(modal);
        
        // Add contextual help
        this.addCampaignHelp(modal);
    }

    /**
     * Render segment selection checkboxes
     */
    renderSegmentSelection() {
        const segments = this.campaignService.getSegments();
        
        return segments.map(segment => `
            <label style="display: flex; align-items: center; padding: 8px; margin-bottom: 5px; background: white; border-radius: 4px; cursor: pointer;">
                <input type="checkbox" name="segments" value="${segment.id}" 
                       ${segment.id === 'all_staff' ? 'checked' : ''} 
                       style="margin-right: 10px;">
                <span style="font-size: 16px; margin-right: 8px;">${segment.icon}</span>
                <div style="flex: 1;">
                    <div style="font-weight: 500; color: #495057;">${segment.name}</div>
                    <div style="font-size: 12px; color: #6c757d;">${segment.description}</div>
                </div>
            </label>
        `).join('');
    }

    /**
     * Render template options for select dropdown
     */
    renderTemplateOptions() {
        // This would normally fetch from templateService
        const sampleTemplates = [
            { id: 'welcome_new', name: 'Welcome New Employee', category: 'hr' },
            { id: 'monthly_update', name: 'Monthly Team Update', category: 'announcement' },
            { id: 'training_reminder', name: 'Training Reminder', category: 'training' },
            { id: 'policy_update', name: 'Policy Update Notice', category: 'policy' },
            { id: 'event_invitation', name: 'Event Invitation', category: 'event' }
        ];
        
        return sampleTemplates.map(template => 
            `<option value="${template.id}">${template.name} (${template.category})</option>`
        ).join('');
    }

    /**
     * Setup event handlers for campaign creator
     */
    setupCampaignCreatorHandlers(modal) {
        // Segment selection change
        modal.querySelectorAll('input[name="segments"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateRecipientCount(modal);
            });
        });
        
        // Template selection change
        modal.querySelector('#template-select').addEventListener('change', (e) => {
            this.updateTemplatePreview(modal, e.target.value);
        });
        
        // Action buttons
        modal.querySelector('#create-new-template-btn').addEventListener('click', () => {
            this.openTemplateEditor();
        });
        
        modal.querySelector('#preview-campaign-btn').addEventListener('click', () => {
            this.previewCampaign(modal);
        });
        
        modal.querySelector('#save-draft-btn').addEventListener('click', () => {
            this.saveCampaignDraft(modal);
        });
        
        modal.querySelector('#schedule-campaign-btn').addEventListener('click', () => {
            this.showScheduleDialog(modal);
        });
        
        modal.querySelector('#send-now-btn').addEventListener('click', () => {
            this.sendCampaignNow(modal);
        });
        
        // Initial recipient count update
        this.updateRecipientCount(modal);
    }

    /**
     * Add contextual help to campaign creator
     */
    addCampaignHelp(modal) {
        // Add help content for campaign-specific topics
        this.helpSystem.helpContent.set('campaign_name', {
            title: 'Campaign Naming',
            content: `
                <div class="help-content">
                    <h4>📝 Campaign Naming Best Practices</h4>
                    <p>Use clear, descriptive names that include:</p>
                    <ul>
                        <li><strong>Purpose:</strong> What is this communication about?</li>
                        <li><strong>Date/Period:</strong> When is this relevant?</li>
                        <li><strong>Audience:</strong> Who is this for? (if specific)</li>
                    </ul>
                    <h5>Good Examples:</h5>
                    <ul>
                        <li>"Q1 2024 Performance Review Reminder"</li>
                        <li>"New COVID-19 Safety Protocols - March 2024"</li>
                        <li>"Welcome Package - New Hires March 2024"</li>
                        <li>"Emergency: Office Closure Due to Weather"</li>
                    </ul>
                </div>
            `,
            category: 'campaigns'
        });
        
        this.helpSystem.helpContent.set('communication_types', {
            title: 'Communication Types',
            content: `
                <div class="help-content">
                    <h4>📢 Types of Staff Communications</h4>
                    <div class="category-grid">
                        <div class="category-item">
                            <span class="category-icon">📢</span>
                            <strong>Announcement</strong><br>
                            Company news, updates, achievements
                        </div>
                        <div class="category-item">
                            <span class="category-icon">👥</span>
                            <strong>HR Communication</strong><br>
                            Policies, benefits, personnel matters
                        </div>
                        <div class="category-item">
                            <span class="category-icon">🎓</span>
                            <strong>Training</strong><br>
                            Learning opportunities, skill development
                        </div>
                        <div class="category-item">
                            <span class="category-icon">📅</span>
                            <strong>Events</strong><br>
                            Meetings, social events, deadlines
                        </div>
                        <div class="category-item">
                            <span class="category-icon">🏆</span>
                            <strong>Recognition</strong><br>
                            Employee achievements, awards, milestones
                        </div>
                        <div class="category-item">
                            <span class="category-icon">🚨</span>
                            <strong>Emergency</strong><br>
                            Urgent notifications, safety alerts
                        </div>
                    </div>
                </div>
            `,
            category: 'campaigns'
        });
        
        // Add help icons to form elements
        modal.querySelectorAll('.help-icon').forEach(icon => {
            const helpKey = icon.dataset.help;
            icon.addEventListener('mouseenter', (e) => this.helpSystem.showTooltip(e, helpKey));
            icon.addEventListener('mouseleave', () => this.helpSystem.hideTooltip());
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                this.helpSystem.showHelpPanel(helpKey);
            });
        });
    }

    /**
     * Update recipient count based on selected segments
     */
    updateRecipientCount(modal) {
        const selectedSegments = Array.from(modal.querySelectorAll('input[name="segments"]:checked'))
            .map(cb => cb.value);
        
        // Mock calculation - in real implementation, this would calculate based on actual contact data
        let totalRecipients = 0;
        selectedSegments.forEach(segmentId => {
            switch(segmentId) {
                case 'all_staff': totalRecipients = Math.max(totalRecipients, 150); break;
                case 'management': totalRecipients += 25; break;
                case 'new_hires': totalRecipients += 8; break;
                case 'remote_workers': totalRecipients += 45; break;
                case 'department_hr': totalRecipients += 12; break;
                case 'department_it': totalRecipients += 18; break;
            }
        });
        
        modal.querySelector('#recipient-count').textContent = totalRecipients;
    }

    /**
     * Update template preview
     */
    updateTemplatePreview(modal, templateId) {
        const previewDiv = modal.querySelector('#template-preview');
        const editBtn = modal.querySelector('#edit-template-btn');
        const testBtn = modal.querySelector('#test-send-btn');
        
        if (!templateId) {
            previewDiv.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 40px;">Select a template to see preview</div>';
            editBtn.disabled = true;
            testBtn.disabled = true;
            return;
        }
        
        // Mock template preview
        previewDiv.innerHTML = `
            <div style="padding: 20px; background: white; border-radius: 4px; margin: 10px;">
                <div style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
                    <strong>Subject:</strong> ${this.getMockSubject(templateId)}
                </div>
                <div style="line-height: 1.6;">
                    ${this.getMockContent(templateId)}
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                    <strong>Merge fields detected:</strong> {{firstName}}, {{lastName}}, {{department}}, {{jobTitle}}
                </div>
            </div>
        `;
        
        editBtn.disabled = false;
        testBtn.disabled = false;
    }

    /**
     * Get mock subject for template preview
     */
    getMockSubject(templateId) {
        const subjects = {
            'welcome_new': 'Welcome to the Team, {{firstName}}!',
            'monthly_update': 'Monthly Team Update - {{currentMonth}} {{currentYear}}',
            'training_reminder': 'Reminder: {{trainingName}} Training Session',
            'policy_update': 'Important Policy Update - Please Review',
            'event_invitation': 'You\'re Invited: {{eventName}}'
        };
        return subjects[templateId] || 'Sample Subject Line';
    }

    /**
     * Get mock content for template preview
     */
    getMockContent(templateId) {
        const contents = {
            'welcome_new': `
                <p>Dear {{firstName}},</p>
                <p>Welcome to {{companyName}}! We're excited to have you join our {{department}} team as our new {{jobTitle}}.</p>
                <p>Your first day is scheduled for {{startDate}}. Please report to {{location}} at 9:00 AM.</p>
                <p>Best regards,<br>The HR Team</p>
            `,
            'monthly_update': `
                <p>Hi {{firstName}},</p>
                <p>Here's your monthly update for the {{department}} department:</p>
                <ul>
                    <li>Team achievements this month</li>
                    <li>Upcoming projects and deadlines</li>
                    <li>Important announcements</li>
                </ul>
                <p>Thank you for your continued dedication!</p>
            `,
            'training_reminder': `
                <p>Hello {{firstName}},</p>
                <p>This is a reminder about your upcoming training session:</p>
                <p><strong>Training:</strong> {{trainingName}}<br>
                <strong>Date:</strong> {{trainingDate}}<br>
                <strong>Time:</strong> {{trainingTime}}<br>
                <strong>Location:</strong> {{trainingLocation}}</p>
                <p>Please confirm your attendance by replying to this email.</p>
            `
        };
        return contents[templateId] || '<p>Sample template content with {{firstName}} merge field.</p>';
    }

    /**
     * Create modal utility
     */
    createModal(title, width = '60%', height = '70%') {
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
                overflow: hidden;
            ">
                <div style="
                    padding: 15px 20px;
                    border-bottom: 1px solid #dee2e6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8f9fa;
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
                <div class="modal-body" style="flex: 1; overflow: auto; display: flex; flex-direction: column;"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }

    // Placeholder methods for campaign actions
    openTemplateEditor() {
        alert('Template editor would open here');
    }

    previewCampaign(modal) {
        alert('Campaign preview would show here');
    }

    saveCampaignDraft(modal) {
        alert('Campaign saved as draft');
    }

    showScheduleDialog(modal) {
        alert('Schedule dialog would show here');
    }

    sendCampaignNow(modal) {
        if (confirm('Are you sure you want to send this campaign now?')) {
            alert('Campaign would be sent now');
        }
    }
}

