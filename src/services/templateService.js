/**
 * Template Management Service for staff communication templates
 */

export class TemplateService {
    constructor() {
        this.templates = new Map();
        this.categories = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize template service
     */
    async initialize() {
        try {
            this.isInitialized = true;
            
            // Initialize default categories for staff communications
            this.initializeDefaultCategories();
            
            console.log('Template service initialized successfully');
            return true;
        } catch (error) {
            console.error('Template service initialization failed:', error);
            throw new Error('Template service initialization failed');
        }
    }

    /**
     * Initialize default template categories for staff communications
     */
    initializeDefaultCategories() {
        const defaultCategories = [
            {
                id: 'announcements',
                name: 'Announcements',
                description: 'Company-wide announcements and updates',
                icon: '📢',
                color: '#667eea'
            },
            {
                id: 'hr',
                name: 'HR Communications',
                description: 'Human resources and policy communications',
                icon: '👥',
                color: '#28a745'
            },
            {
                id: 'training',
                name: 'Training & Development',
                description: 'Training notifications and development programs',
                icon: '🎓',
                color: '#ffc107'
            },
            {
                id: 'events',
                name: 'Events & Meetings',
                description: 'Event invitations and meeting notifications',
                icon: '📅',
                color: '#17a2b8'
            },
            {
                id: 'recognition',
                name: 'Recognition & Awards',
                description: 'Employee recognition and achievement announcements',
                icon: '🏆',
                color: '#fd7e14'
            },
            {
                id: 'policy',
                name: 'Policy Updates',
                description: 'Policy changes and compliance communications',
                icon: '📋',
                color: '#6f42c1'
            },
            {
                id: 'emergency',
                name: 'Emergency Communications',
                description: 'Urgent and emergency notifications',
                icon: '🚨',
                color: '#dc3545'
            },
            {
                id: 'general',
                name: 'General',
                description: 'General purpose templates',
                icon: '📄',
                color: '#6c757d'
            }
        ];

        defaultCategories.forEach(category => {
            this.categories.set(category.id, category);
        });
    }

    /**
     * Create a new template
     */
    async createTemplate(templateData) {
        try {
            const template = {
                id: this.generateTemplateId(),
                name: templateData.name || 'Untitled Template',
                description: templateData.description || '',
                category: templateData.category || 'general',
                design: templateData.design || null,
                html: templateData.html || '',
                subject: templateData.subject || '',
                preheader: templateData.preheader || '',
                tags: templateData.tags || [],
                isActive: true,
                isApproved: false,
                approvedBy: null,
                approvedAt: null,
                createdBy: templateData.createdBy || 'current-user',
                createdAt: new Date(),
                modifiedBy: templateData.createdBy || 'current-user',
                modifiedAt: new Date(),
                version: 1,
                usage: {
                    timesUsed: 0,
                    lastUsed: null,
                    campaigns: []
                },
                settings: {
                    requiresApproval: templateData.requiresApproval || false,
                    allowEditing: templateData.allowEditing !== false,
                    trackOpens: templateData.trackOpens !== false,
                    trackClicks: templateData.trackClicks !== false
                }
            };

            this.templates.set(template.id, template);
            
            console.log('Template created:', template);
            return template;
            
        } catch (error) {
            console.error('Failed to create template:', error);
            throw new Error('Failed to create template');
        }
    }

    /**
     * Update existing template
     */
    async updateTemplate(templateId, updates) {
        try {
            const template = this.templates.get(templateId);
            if (!template) {
                throw new Error('Template not found');
            }

            // Create new version if significant changes
            const isSignificantChange = updates.design || updates.html || updates.subject;
            if (isSignificantChange) {
                template.version += 1;
                template.isApproved = false;
                template.approvedBy = null;
                template.approvedAt = null;
            }

            // Update template
            Object.assign(template, updates, {
                modifiedBy: updates.modifiedBy || 'current-user',
                modifiedAt: new Date()
            });

            this.templates.set(templateId, template);
            
            console.log('Template updated:', template);
            return template;
            
        } catch (error) {
            console.error('Failed to update template:', error);
            throw new Error('Failed to update template');
        }
    }

    /**
     * Get template by ID
     */
    async getTemplate(templateId) {
        try {
            const template = this.templates.get(templateId);
            if (!template) {
                throw new Error('Template not found');
            }
            return template;
        } catch (error) {
            console.error('Failed to get template:', error);
            throw new Error('Failed to get template');
        }
    }

    /**
     * Get all templates with optional filtering
     */
    async getTemplates(filters = {}) {
        try {
            let templates = Array.from(this.templates.values());

            // Apply filters
            if (filters.category) {
                templates = templates.filter(t => t.category === filters.category);
            }

            if (filters.isActive !== undefined) {
                templates = templates.filter(t => t.isActive === filters.isActive);
            }

            if (filters.isApproved !== undefined) {
                templates = templates.filter(t => t.isApproved === filters.isApproved);
            }

            if (filters.createdBy) {
                templates = templates.filter(t => t.createdBy === filters.createdBy);
            }

            if (filters.tags && filters.tags.length > 0) {
                templates = templates.filter(t => 
                    filters.tags.some(tag => t.tags.includes(tag))
                );
            }

            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                templates = templates.filter(t => 
                    t.name.toLowerCase().includes(searchTerm) ||
                    t.description.toLowerCase().includes(searchTerm) ||
                    t.tags.some(tag => tag.toLowerCase().includes(searchTerm))
                );
            }

            // Sort templates
            const sortBy = filters.sortBy || 'modifiedAt';
            const sortOrder = filters.sortOrder || 'desc';
            
            templates.sort((a, b) => {
                let aVal = a[sortBy];
                let bVal = b[sortBy];
                
                if (aVal instanceof Date) aVal = aVal.getTime();
                if (bVal instanceof Date) bVal = bVal.getTime();
                
                if (sortOrder === 'desc') {
                    return bVal > aVal ? 1 : -1;
                } else {
                    return aVal > bVal ? 1 : -1;
                }
            });

            return templates;
            
        } catch (error) {
            console.error('Failed to get templates:', error);
            throw new Error('Failed to get templates');
        }
    }

    /**
     * Delete template
     */
    async deleteTemplate(templateId) {
        try {
            const template = this.templates.get(templateId);
            if (!template) {
                throw new Error('Template not found');
            }

            // Soft delete - mark as inactive
            template.isActive = false;
            template.modifiedAt = new Date();
            
            this.templates.set(templateId, template);
            
            console.log('Template deleted (soft):', templateId);
            return true;
            
        } catch (error) {
            console.error('Failed to delete template:', error);
            throw new Error('Failed to delete template');
        }
    }

    /**
     * Duplicate template
     */
    async duplicateTemplate(templateId, newName = null) {
        try {
            const originalTemplate = await this.getTemplate(templateId);
            
            const duplicatedTemplate = {
                ...originalTemplate,
                id: this.generateTemplateId(),
                name: newName || `${originalTemplate.name} (Copy)`,
                isApproved: false,
                approvedBy: null,
                approvedAt: null,
                createdAt: new Date(),
                modifiedAt: new Date(),
                version: 1,
                usage: {
                    timesUsed: 0,
                    lastUsed: null,
                    campaigns: []
                }
            };

            this.templates.set(duplicatedTemplate.id, duplicatedTemplate);
            
            console.log('Template duplicated:', duplicatedTemplate);
            return duplicatedTemplate;
            
        } catch (error) {
            console.error('Failed to duplicate template:', error);
            throw new Error('Failed to duplicate template');
        }
    }

    /**
     * Approve template
     */
    async approveTemplate(templateId, approvedBy) {
        try {
            const template = this.templates.get(templateId);
            if (!template) {
                throw new Error('Template not found');
            }

            template.isApproved = true;
            template.approvedBy = approvedBy;
            template.approvedAt = new Date();
            template.modifiedAt = new Date();

            this.templates.set(templateId, template);
            
            console.log('Template approved:', templateId);
            return template;
            
        } catch (error) {
            console.error('Failed to approve template:', error);
            throw new Error('Failed to approve template');
        }
    }

    /**
     * Get template categories
     */
    getCategories() {
        return Array.from(this.categories.values());
    }

    /**
     * Get templates by category
     */
    async getTemplatesByCategory() {
        try {
            const templates = await this.getTemplates({ isActive: true });
            const categorized = {};

            // Initialize categories
            this.categories.forEach((category, id) => {
                categorized[id] = {
                    ...category,
                    templates: []
                };
            });

            // Group templates by category
            templates.forEach(template => {
                if (categorized[template.category]) {
                    categorized[template.category].templates.push(template);
                }
            });

            return categorized;
            
        } catch (error) {
            console.error('Failed to get templates by category:', error);
            throw new Error('Failed to get templates by category');
        }
    }

    /**
     * Record template usage
     */
    async recordUsage(templateId, campaignId = null) {
        try {
            const template = this.templates.get(templateId);
            if (!template) {
                throw new Error('Template not found');
            }

            template.usage.timesUsed += 1;
            template.usage.lastUsed = new Date();
            
            if (campaignId) {
                template.usage.campaigns.push({
                    campaignId,
                    usedAt: new Date()
                });
            }

            this.templates.set(templateId, template);
            
            console.log('Template usage recorded:', templateId);
            return template;
            
        } catch (error) {
            console.error('Failed to record template usage:', error);
            throw new Error('Failed to record template usage');
        }
    }

    /**
     * Get template analytics
     */
    async getTemplateAnalytics(templateId) {
        try {
            const template = await this.getTemplate(templateId);
            
            return {
                id: template.id,
                name: template.name,
                category: template.category,
                usage: template.usage,
                performance: {
                    // This would be populated from actual campaign data
                    averageOpenRate: 0,
                    averageClickRate: 0,
                    totalRecipients: 0,
                    totalOpens: 0,
                    totalClicks: 0
                },
                created: template.createdAt,
                lastModified: template.modifiedAt,
                version: template.version,
                isApproved: template.isApproved
            };
            
        } catch (error) {
            console.error('Failed to get template analytics:', error);
            throw new Error('Failed to get template analytics');
        }
    }

    /**
     * Generate unique template ID
     */
    generateTemplateId() {
        return 'tpl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Load sample templates for development
     */
    async loadSampleTemplates() {
        try {
            const sampleTemplates = [
                {
                    name: 'Welcome New Employee',
                    description: 'Welcome message for new team members',
                    category: 'hr',
                    subject: 'Welcome to {{company}}, {{firstName}}!',
                    tags: ['welcome', 'onboarding', 'new-hire'],
                    html: `
                        <h1>Welcome to {{company}}, {{firstName}}!</h1>
                        <p>We're excited to have you join our team as {{jobTitle}} in the {{department}} department.</p>
                        <p>Your start date is {{startDate|date:long}} and you'll be reporting to {{manager}}.</p>
                        <p>{{#if location}}You'll be working from our {{location}} office.{{/if}}</p>
                        <p>We look forward to working with you!</p>
                    `,
                    requiresApproval: true
                },
                {
                    name: 'Monthly Team Update',
                    description: 'Monthly update template for team communications',
                    category: 'announcements',
                    subject: 'Team Update - {{month}} {{year}}',
                    tags: ['monthly', 'update', 'team'],
                    html: `
                        <h1>Monthly Team Update</h1>
                        <p>Hi {{firstName}},</p>
                        <p>Here's what's happening in {{department}} this month:</p>
                        <ul>
                            <li>Team achievements</li>
                            <li>Upcoming projects</li>
                            <li>Important dates</li>
                        </ul>
                        <p>Best regards,<br>{{manager}}</p>
                    `
                },
                {
                    name: 'Training Reminder',
                    description: 'Reminder for mandatory training sessions',
                    category: 'training',
                    subject: 'Reminder: {{trainingName}} - {{trainingDate}}',
                    tags: ['training', 'reminder', 'mandatory'],
                    html: `
                        <h1>Training Reminder</h1>
                        <p>Hi {{firstName}},</p>
                        <p>This is a reminder about the upcoming training session:</p>
                        <p><strong>{{trainingName}}</strong><br>
                        Date: {{trainingDate|date:long}}<br>
                        Time: {{trainingTime}}<br>
                        Location: {{trainingLocation}}</p>
                        <p>{{#if trainingRequired}}This training is mandatory for all {{department}} staff.{{/if}}</p>
                        <p>Please confirm your attendance.</p>
                    `,
                    requiresApproval: true
                }
            ];

            for (const templateData of sampleTemplates) {
                await this.createTemplate(templateData);
            }

            console.log('Sample templates loaded successfully');
            
        } catch (error) {
            console.error('Failed to load sample templates:', error);
        }
    }

    /**
     * Check if service is ready
     */
    isReady() {
        return this.isInitialized;
    }
}

