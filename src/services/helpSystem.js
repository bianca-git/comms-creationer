/**
 * Help System Component for embedded contextual help
 */

export class HelpSystem {
    constructor() {
        this.helpContent = new Map();
        this.isInitialized = false;
        this.currentTooltip = null;
    }

    /**
     * Initialize help system with content
     */
    async initialize() {
        try {
            this.loadHelpContent();
            this.setupGlobalStyles();
            this.isInitialized = true;
            
            console.log('Help system initialized successfully');
            return true;
        } catch (error) {
            console.error('Help system initialization failed:', error);
            throw new Error('Help system initialization failed');
        }
    }

    /**
     * Load all help content
     */
    loadHelpContent() {
        // Mail Merge Help Content
        this.helpContent.set('mail_merge_basics', {
            title: 'Mail Merge Basics',
            content: `
                <div class="help-content">
                    <h4>📧 Using Mail Merge Fields</h4>
                    <p>Mail merge fields automatically insert staff information into your emails:</p>
                    <ul>
                        <li><code>{{firstName}}</code> - Staff member's first name</li>
                        <li><code>{{lastName}}</code> - Staff member's last name</li>
                        <li><code>{{email}}</code> - Email address</li>
                        <li><code>{{jobTitle}}</code> - Job title or position</li>
                        <li><code>{{department}}</code> - Department name</li>
                        <li><code>{{manager}}</code> - Manager's name</li>
                    </ul>
                    <p><strong>💡 Tip:</strong> Click any field in the merge fields panel to insert it at your cursor position.</p>
                </div>
            `,
            category: 'mail_merge'
        });

        this.helpContent.set('conditional_content', {
            title: 'Conditional Content',
            content: `
                <div class="help-content">
                    <h4>🔀 Conditional Content</h4>
                    <p>Show different content based on staff data:</p>
                    
                    <h5>Show if field has value:</h5>
                    <code>{{#if manager}}Your manager is {{manager}}.{{/if}}</code>
                    
                    <h5>Show if field is empty:</h5>
                    <code>{{#unless department}}Please update your department info.{{/unless}}</code>
                    
                    <h5>Multiple conditions:</h5>
                    <code>{{#if jobTitle}}{{#if department}}You work as {{jobTitle}} in {{department}}.{{/if}}{{/if}}</code>
                    
                    <p><strong>⚠️ Important:</strong> Always close conditional blocks with the matching end tag.</p>
                </div>
            `,
            category: 'mail_merge'
        });

        this.helpContent.set('field_formatting', {
            title: 'Field Formatting',
            content: `
                <div class="help-content">
                    <h4>✨ Field Formatting</h4>
                    <p>Format merge fields for better presentation:</p>
                    
                    <h5>Text Formatting:</h5>
                    <ul>
                        <li><code>{{firstName|upper}}</code> - UPPERCASE</li>
                        <li><code>{{firstName|lower}}</code> - lowercase</li>
                        <li><code>{{firstName|title}}</code> - Title Case</li>
                        <li><code>{{description|truncate:50}}</code> - Limit to 50 characters</li>
                    </ul>
                    
                    <h5>Date Formatting:</h5>
                    <ul>
                        <li><code>{{startDate|date:long}}</code> - January 15, 2024</li>
                        <li><code>{{startDate|date:short}}</code> - Jan 15, 2024</li>
                        <li><code>{{startDate|date:YYYY-MM-DD}}</code> - 2024-01-15</li>
                    </ul>
                </div>
            `,
            category: 'mail_merge'
        });

        // Template Management Help
        this.helpContent.set('template_categories', {
            title: 'Template Categories',
            content: `
                <div class="help-content">
                    <h4>📂 Template Categories</h4>
                    <p>Organize templates by communication type:</p>
                    
                    <div class="category-grid">
                        <div class="category-item">
                            <span class="category-icon">📢</span>
                            <strong>Announcements</strong><br>
                            Company-wide updates and news
                        </div>
                        <div class="category-item">
                            <span class="category-icon">👥</span>
                            <strong>HR Communications</strong><br>
                            Policy updates and HR matters
                        </div>
                        <div class="category-item">
                            <span class="category-icon">🎓</span>
                            <strong>Training</strong><br>
                            Learning and development programs
                        </div>
                        <div class="category-item">
                            <span class="category-icon">📅</span>
                            <strong>Events</strong><br>
                            Meeting invites and event notifications
                        </div>
                        <div class="category-item">
                            <span class="category-icon">🏆</span>
                            <strong>Recognition</strong><br>
                            Employee achievements and awards
                        </div>
                        <div class="category-item">
                            <span class="category-icon">🚨</span>
                            <strong>Emergency</strong><br>
                            Urgent communications
                        </div>
                    </div>
                </div>
            `,
            category: 'templates'
        });

        // Campaign Management Help
        this.helpContent.set('campaign_workflow', {
            title: 'Campaign Workflow',
            content: `
                <div class="help-content">
                    <h4>🚀 Campaign Workflow</h4>
                    <p>Follow these steps for effective staff communications:</p>
                    
                    <div class="workflow-steps">
                        <div class="step">
                            <span class="step-number">1</span>
                            <div class="step-content">
                                <strong>Load Staff Data</strong><br>
                                Import contact information from Excel
                            </div>
                        </div>
                        <div class="step">
                            <span class="step-number">2</span>
                            <div class="step-content">
                                <strong>Create Template</strong><br>
                                Design your email with merge fields
                            </div>
                        </div>
                        <div class="step">
                            <span class="step-number">3</span>
                            <div class="step-content">
                                <strong>Select Recipients</strong><br>
                                Choose staff segments or individuals
                            </div>
                        </div>
                        <div class="step">
                            <span class="step-number">4</span>
                            <div class="step-content">
                                <strong>Preview & Test</strong><br>
                                Review with sample data
                            </div>
                        </div>
                        <div class="step">
                            <span class="step-number">5</span>
                            <div class="step-content">
                                <strong>Send or Schedule</strong><br>
                                Deliver immediately or schedule for later
                            </div>
                        </div>
                    </div>
                </div>
            `,
            category: 'campaigns'
        });

        // Staff Segmentation Help
        this.helpContent.set('staff_segments', {
            title: 'Staff Segmentation',
            content: `
                <div class="help-content">
                    <h4>🎯 Staff Segmentation</h4>
                    <p>Target specific groups of staff members:</p>
                    
                    <h5>Pre-built Segments:</h5>
                    <ul>
                        <li><strong>👥 All Staff</strong> - Everyone in the organization</li>
                        <li><strong>👔 Management</strong> - Managers and supervisors</li>
                        <li><strong>🆕 New Hires</strong> - Recently joined employees</li>
                        <li><strong>🏠 Remote Workers</strong> - Staff working remotely</li>
                        <li><strong>💻 IT Department</strong> - Technology team members</li>
                        <li><strong>👥 HR Department</strong> - Human resources staff</li>
                    </ul>
                    
                    <h5>Custom Segments:</h5>
                    <p>Create your own segments based on:</p>
                    <ul>
                        <li>Job title or role</li>
                        <li>Department or division</li>
                        <li>Location or office</li>
                        <li>Start date or tenure</li>
                        <li>Any other staff data field</li>
                    </ul>
                </div>
            `,
            category: 'campaigns'
        });

        // Excel Integration Help
        this.helpContent.set('excel_integration', {
            title: 'Excel Integration',
            content: `
                <div class="help-content">
                    <h4>📊 Excel Integration</h4>
                    <p>Best practices for staff data in Excel:</p>
                    
                    <h5>Required Columns:</h5>
                    <ul>
                        <li><strong>Email</strong> - Primary contact method</li>
                        <li><strong>First Name</strong> - For personalization</li>
                        <li><strong>Last Name</strong> - Full name display</li>
                    </ul>
                    
                    <h5>Recommended Columns:</h5>
                    <ul>
                        <li>Job Title</li>
                        <li>Department</li>
                        <li>Manager</li>
                        <li>Start Date</li>
                        <li>Location</li>
                        <li>Employee ID</li>
                    </ul>
                    
                    <h5>Data Format Tips:</h5>
                    <ul>
                        <li>Use consistent column headers</li>
                        <li>Avoid empty rows in your data</li>
                        <li>Format dates consistently (MM/DD/YYYY)</li>
                        <li>Keep the first row as headers</li>
                    </ul>
                    
                    <p><strong>💡 Tip:</strong> The system automatically detects and maps common field variations like "First Name", "FirstName", or "fname".</p>
                </div>
            `,
            category: 'excel'
        });
    }

    /**
     * Setup global CSS styles for help system
     */
    setupGlobalStyles() {
        if (document.getElementById('help-system-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'help-system-styles';
        styles.textContent = `
            .help-tooltip {
                position: absolute;
                background: #2c3e50;
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.4;
                max-width: 300px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                opacity: 0;
                transform: translateY(-10px);
                transition: all 0.2s ease;
                pointer-events: none;
            }
            
            .help-tooltip.show {
                opacity: 1;
                transform: translateY(0);
            }
            
            .help-tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border: 6px solid transparent;
                border-top-color: #2c3e50;
            }
            
            .help-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 18px;
                height: 18px;
                background: #667eea;
                color: white;
                border-radius: 50%;
                font-size: 12px;
                font-weight: bold;
                cursor: help;
                margin-left: 5px;
                vertical-align: middle;
            }
            
            .help-icon:hover {
                background: #5a6fd8;
            }
            
            .help-panel {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 20px;
                margin: 15px 0;
                max-height: 400px;
                overflow-y: auto;
            }
            
            .help-content h4 {
                margin: 0 0 15px 0;
                color: #495057;
                font-size: 16px;
            }
            
            .help-content h5 {
                margin: 15px 0 8px 0;
                color: #6c757d;
                font-size: 14px;
            }
            
            .help-content code {
                background: #e9ecef;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 13px;
                color: #495057;
            }
            
            .help-content ul {
                margin: 8px 0;
                padding-left: 20px;
            }
            
            .help-content li {
                margin: 4px 0;
                line-height: 1.4;
            }
            
            .category-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin: 15px 0;
            }
            
            .category-item {
                padding: 12px;
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                text-align: center;
                font-size: 13px;
            }
            
            .category-icon {
                font-size: 20px;
                display: block;
                margin-bottom: 8px;
            }
            
            .workflow-steps {
                margin: 15px 0;
            }
            
            .step {
                display: flex;
                align-items: flex-start;
                margin: 12px 0;
                padding: 12px;
                background: white;
                border-radius: 6px;
                border-left: 4px solid #667eea;
            }
            
            .step-number {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                background: #667eea;
                color: white;
                border-radius: 50%;
                font-size: 12px;
                font-weight: bold;
                margin-right: 12px;
                flex-shrink: 0;
            }
            
            .step-content {
                flex: 1;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .help-toggle {
                background: none;
                border: none;
                color: #667eea;
                cursor: pointer;
                font-size: 12px;
                text-decoration: underline;
                padding: 0;
                margin-left: 8px;
            }
            
            .help-toggle:hover {
                color: #5a6fd8;
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * Add help icon to an element
     */
    addHelpIcon(element, helpKey, position = 'right') {
        const helpIcon = document.createElement('span');
        helpIcon.className = 'help-icon';
        helpIcon.textContent = '?';
        helpIcon.dataset.helpKey = helpKey;
        
        // Position the icon
        if (position === 'right') {
            element.appendChild(helpIcon);
        } else {
            element.insertBefore(helpIcon, element.firstChild);
        }
        
        // Add event listeners
        helpIcon.addEventListener('mouseenter', (e) => this.showTooltip(e, helpKey));
        helpIcon.addEventListener('mouseleave', () => this.hideTooltip());
        helpIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showHelpPanel(helpKey);
        });
        
        return helpIcon;
    }

    /**
     * Add help toggle link
     */
    addHelpToggle(element, helpKey, text = 'Show help') {
        const helpToggle = document.createElement('button');
        helpToggle.className = 'help-toggle';
        helpToggle.textContent = text;
        helpToggle.dataset.helpKey = helpKey;
        
        element.appendChild(helpToggle);
        
        helpToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleHelpPanel(helpKey, element);
        });
        
        return helpToggle;
    }

    /**
     * Show tooltip on hover
     */
    showTooltip(event, helpKey) {
        const helpData = this.helpContent.get(helpKey);
        if (!helpData) return;
        
        this.hideTooltip(); // Hide any existing tooltip
        
        const tooltip = document.createElement('div');
        tooltip.className = 'help-tooltip';
        tooltip.innerHTML = `<strong>${helpData.title}</strong><br>Click for detailed help`;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        
        // Show with animation
        setTimeout(() => tooltip.classList.add('show'), 10);
        
        this.currentTooltip = tooltip;
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    /**
     * Show help panel
     */
    showHelpPanel(helpKey) {
        const helpData = this.helpContent.get(helpKey);
        if (!helpData) return;
        
        // Create modal for help content
        const modal = this.createHelpModal(helpData.title, helpData.content);
        document.body.appendChild(modal);
    }

    /**
     * Toggle help panel inline
     */
    toggleHelpPanel(helpKey, parentElement) {
        const existingPanel = parentElement.querySelector('.help-panel');
        
        if (existingPanel) {
            existingPanel.remove();
            return;
        }
        
        const helpData = this.helpContent.get(helpKey);
        if (!helpData) return;
        
        const helpPanel = document.createElement('div');
        helpPanel.className = 'help-panel';
        helpPanel.innerHTML = helpData.content;
        
        parentElement.appendChild(helpPanel);
    }

    /**
     * Create help modal
     */
    createHelpModal(title, content) {
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
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            ">
                <div style="
                    padding: 20px;
                    border-bottom: 1px solid #dee2e6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8f9fa;
                ">
                    <h3 style="margin: 0; color: #495057;">📚 ${title}</h3>
                    <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #6c757d;
                        padding: 0;
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">×</button>
                </div>
                <div style="flex: 1; overflow: auto; padding: 20px;">
                    ${content}
                </div>
            </div>
        `;
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }

    /**
     * Add contextual help to form fields
     */
    enhanceFormWithHelp(formElement) {
        // Add help to mail merge related fields
        const mergeFieldInputs = formElement.querySelectorAll('textarea, input[type="text"]');
        mergeFieldInputs.forEach(input => {
            if (input.placeholder && input.placeholder.includes('{{')) {
                this.addHelpIcon(input.parentElement, 'mail_merge_basics');
            }
        });
        
        // Add help to template category selects
        const categorySelects = formElement.querySelectorAll('select[id*="category"]');
        categorySelects.forEach(select => {
            this.addHelpIcon(select.parentElement, 'template_categories');
        });
    }

    /**
     * Add help to specific sections
     */
    addSectionHelp(sectionElement, helpKey, title) {
        const header = sectionElement.querySelector('h3, h4, h5');
        if (header) {
            this.addHelpToggle(header, helpKey, '📚 Help');
        }
    }

    /**
     * Check if help system is ready
     */
    isReady() {
        return this.isInitialized;
    }
}

