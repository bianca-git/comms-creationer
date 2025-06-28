/**
 * Campaign Management Service for staff communication campaigns
 */

export class CampaignService {
    constructor() {
        this.campaigns = new Map();
        this.segments = new Map();
        this.deliveryQueue = [];
        this.isInitialized = false;
    }

    /**
     * Initialize campaign service
     */
    async initialize() {
        try {
            this.isInitialized = true;
            
            // Initialize default segments for staff communications
            this.initializeDefaultSegments();
            
            console.log('Campaign service initialized successfully');
            return true;
        } catch (error) {
            console.error('Campaign service initialization failed:', error);
            throw new Error('Campaign service initialization failed');
        }
    }

    /**
     * Initialize default staff segments
     */
    initializeDefaultSegments() {
        const defaultSegments = [
            {
                id: 'all_staff',
                name: 'All Staff',
                description: 'All employees in the organization',
                icon: '👥',
                criteria: {},
                isDefault: true
            },
            {
                id: 'management',
                name: 'Management Team',
                description: 'Managers and supervisors',
                icon: '👔',
                criteria: {
                    jobTitle: { contains: ['manager', 'supervisor', 'director', 'head', 'lead'] }
                }
            },
            {
                id: 'new_hires',
                name: 'New Hires',
                description: 'Employees hired in the last 90 days',
                icon: '🆕',
                criteria: {
                    startDate: { daysAgo: 90 }
                }
            },
            {
                id: 'remote_workers',
                name: 'Remote Workers',
                description: 'Staff working remotely',
                icon: '🏠',
                criteria: {
                    location: { contains: ['remote', 'home', 'virtual'] }
                }
            },
            {
                id: 'department_hr',
                name: 'HR Department',
                description: 'Human Resources staff',
                icon: '👥',
                criteria: {
                    department: { equals: ['HR', 'Human Resources', 'People'] }
                }
            },
            {
                id: 'department_it',
                name: 'IT Department',
                description: 'Information Technology staff',
                icon: '💻',
                criteria: {
                    department: { equals: ['IT', 'Information Technology', 'Tech'] }
                }
            }
        ];

        defaultSegments.forEach(segment => {
            this.segments.set(segment.id, segment);
        });
    }

    /**
     * Create a new campaign
     */
    async createCampaign(campaignData) {
        try {
            const campaign = {
                id: this.generateCampaignId(),
                name: campaignData.name || 'Untitled Campaign',
                description: campaignData.description || '',
                type: campaignData.type || 'announcement', // announcement, training, hr, emergency, etc.
                templateId: campaignData.templateId,
                segmentIds: campaignData.segmentIds || ['all_staff'],
                
                // Scheduling
                scheduledAt: campaignData.scheduledAt || null,
                isScheduled: !!campaignData.scheduledAt,
                isRecurring: campaignData.isRecurring || false,
                recurringPattern: campaignData.recurringPattern || null,
                
                // Status and workflow
                status: 'draft', // draft, pending_approval, approved, scheduled, sending, sent, failed
                priority: campaignData.priority || 'normal', // low, normal, high, urgent
                requiresApproval: campaignData.requiresApproval || false,
                approvedBy: null,
                approvedAt: null,
                
                // Metadata
                createdBy: campaignData.createdBy || 'current-user',
                createdAt: new Date(),
                modifiedBy: campaignData.createdBy || 'current-user',
                modifiedAt: new Date(),
                
                // Delivery settings
                deliverySettings: {
                    sendFrom: campaignData.sendFrom || 'noreply@company.com',
                    replyTo: campaignData.replyTo || null,
                    trackOpens: campaignData.trackOpens !== false,
                    trackClicks: campaignData.trackClicks !== false,
                    allowUnsubscribe: campaignData.allowUnsubscribe !== false
                },
                
                // Analytics
                analytics: {
                    totalRecipients: 0,
                    delivered: 0,
                    opened: 0,
                    clicked: 0,
                    bounced: 0,
                    unsubscribed: 0,
                    openRate: 0,
                    clickRate: 0,
                    deliveryRate: 0
                },
                
                // Recipients (populated when campaign is prepared)
                recipients: [],
                
                // Delivery log
                deliveryLog: []
            };

            this.campaigns.set(campaign.id, campaign);
            
            console.log('Campaign created:', campaign);
            return campaign;
            
        } catch (error) {
            console.error('Failed to create campaign:', error);
            throw new Error('Failed to create campaign');
        }
    }

    /**
     * Get campaign by ID
     */
    async getCampaign(campaignId) {
        try {
            const campaign = this.campaigns.get(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }
            return campaign;
        } catch (error) {
            console.error('Failed to get campaign:', error);
            throw new Error('Failed to get campaign');
        }
    }

    /**
     * Get all campaigns with filtering
     */
    async getCampaigns(filters = {}) {
        try {
            let campaigns = Array.from(this.campaigns.values());

            // Apply filters
            if (filters.status) {
                campaigns = campaigns.filter(c => c.status === filters.status);
            }

            if (filters.type) {
                campaigns = campaigns.filter(c => c.type === filters.type);
            }

            if (filters.createdBy) {
                campaigns = campaigns.filter(c => c.createdBy === filters.createdBy);
            }

            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                campaigns = campaigns.filter(c => 
                    c.name.toLowerCase().includes(searchTerm) ||
                    c.description.toLowerCase().includes(searchTerm)
                );
            }

            // Sort campaigns
            const sortBy = filters.sortBy || 'modifiedAt';
            const sortOrder = filters.sortOrder || 'desc';
            
            campaigns.sort((a, b) => {
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

            return campaigns;
            
        } catch (error) {
            console.error('Failed to get campaigns:', error);
            throw new Error('Failed to get campaigns');
        }
    }

    /**
     * Prepare campaign for sending (calculate recipients)
     */
    async prepareCampaign(campaignId, contacts) {
        try {
            const campaign = await this.getCampaign(campaignId);
            
            // Calculate recipients based on segments
            const recipients = [];
            
            for (const segmentId of campaign.segmentIds) {
                const segment = this.segments.get(segmentId);
                if (!segment) continue;
                
                const segmentContacts = this.filterContactsBySegment(contacts, segment);
                
                // Add contacts to recipients (avoid duplicates)
                segmentContacts.forEach(contact => {
                    if (!recipients.find(r => r.id === contact.id)) {
                        recipients.push({
                            contactId: contact.id,
                            email: contact.email,
                            firstName: contact.firstName,
                            lastName: contact.lastName,
                            segmentId: segmentId,
                            status: 'pending' // pending, sent, delivered, opened, clicked, bounced, failed
                        });
                    }
                });
            }
            
            // Update campaign with recipients
            campaign.recipients = recipients;
            campaign.analytics.totalRecipients = recipients.length;
            campaign.modifiedAt = new Date();
            
            this.campaigns.set(campaignId, campaign);
            
            console.log(`Campaign prepared with ${recipients.length} recipients`);
            return campaign;
            
        } catch (error) {
            console.error('Failed to prepare campaign:', error);
            throw new Error('Failed to prepare campaign');
        }
    }

    /**
     * Filter contacts by segment criteria
     */
    filterContactsBySegment(contacts, segment) {
        if (segment.id === 'all_staff') {
            return contacts;
        }
        
        return contacts.filter(contact => {
            return this.matchesSegmentCriteria(contact, segment.criteria);
        });
    }

    /**
     * Check if contact matches segment criteria
     */
    matchesSegmentCriteria(contact, criteria) {
        for (const [field, conditions] of Object.entries(criteria)) {
            const contactValue = contact[field];
            
            if (!contactValue) continue;
            
            // String contains check
            if (conditions.contains) {
                const matches = conditions.contains.some(term => 
                    String(contactValue).toLowerCase().includes(term.toLowerCase())
                );
                if (!matches) return false;
            }
            
            // Exact match check
            if (conditions.equals) {
                const matches = conditions.equals.some(value => 
                    String(contactValue).toLowerCase() === value.toLowerCase()
                );
                if (!matches) return false;
            }
            
            // Date-based checks
            if (conditions.daysAgo && field.toLowerCase().includes('date')) {
                const contactDate = new Date(contactValue);
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - conditions.daysAgo);
                
                if (contactDate < cutoffDate) return false;
            }
        }
        
        return true;
    }

    /**
     * Send campaign (mock implementation)
     */
    async sendCampaign(campaignId) {
        try {
            const campaign = await this.getCampaign(campaignId);
            
            if (campaign.status !== 'approved' && campaign.requiresApproval) {
                throw new Error('Campaign requires approval before sending');
            }
            
            if (campaign.recipients.length === 0) {
                throw new Error('No recipients found for campaign');
            }
            
            // Update status
            campaign.status = 'sending';
            campaign.modifiedAt = new Date();
            
            // Mock sending process
            console.log(`Sending campaign "${campaign.name}" to ${campaign.recipients.length} recipients`);
            
            // Simulate delivery
            await this.simulateDelivery(campaign);
            
            // Update final status
            campaign.status = 'sent';
            campaign.modifiedAt = new Date();
            
            this.campaigns.set(campaignId, campaign);
            
            console.log('Campaign sent successfully');
            return campaign;
            
        } catch (error) {
            console.error('Failed to send campaign:', error);
            
            // Update campaign status to failed
            const campaign = this.campaigns.get(campaignId);
            if (campaign) {
                campaign.status = 'failed';
                campaign.modifiedAt = new Date();
                this.campaigns.set(campaignId, campaign);
            }
            
            throw new Error('Failed to send campaign');
        }
    }

    /**
     * Simulate email delivery for development
     */
    async simulateDelivery(campaign) {
        const deliveryRate = 0.95; // 95% delivery rate
        const openRate = 0.25; // 25% open rate
        const clickRate = 0.05; // 5% click rate
        
        let delivered = 0;
        let opened = 0;
        let clicked = 0;
        let bounced = 0;
        
        for (const recipient of campaign.recipients) {
            // Simulate delivery
            if (Math.random() < deliveryRate) {
                recipient.status = 'delivered';
                delivered++;
                
                // Simulate opens
                if (Math.random() < openRate) {
                    recipient.status = 'opened';
                    opened++;
                    
                    // Simulate clicks
                    if (Math.random() < clickRate) {
                        recipient.status = 'clicked';
                        clicked++;
                    }
                }
            } else {
                recipient.status = 'bounced';
                bounced++;
            }
            
            // Add to delivery log
            campaign.deliveryLog.push({
                contactId: recipient.contactId,
                email: recipient.email,
                status: recipient.status,
                timestamp: new Date(),
                details: `Simulated delivery: ${recipient.status}`
            });
        }
        
        // Update analytics
        campaign.analytics.delivered = delivered;
        campaign.analytics.opened = opened;
        campaign.analytics.clicked = clicked;
        campaign.analytics.bounced = bounced;
        campaign.analytics.deliveryRate = (delivered / campaign.analytics.totalRecipients) * 100;
        campaign.analytics.openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
        campaign.analytics.clickRate = opened > 0 ? (clicked / opened) * 100 : 0;
    }

    /**
     * Get campaign analytics
     */
    async getCampaignAnalytics(campaignId) {
        try {
            const campaign = await this.getCampaign(campaignId);
            
            return {
                campaignId: campaign.id,
                campaignName: campaign.name,
                status: campaign.status,
                sentAt: campaign.deliveryLog.length > 0 ? campaign.deliveryLog[0].timestamp : null,
                analytics: campaign.analytics,
                recipients: campaign.recipients,
                deliveryLog: campaign.deliveryLog
            };
            
        } catch (error) {
            console.error('Failed to get campaign analytics:', error);
            throw new Error('Failed to get campaign analytics');
        }
    }

    /**
     * Get available segments
     */
    getSegments() {
        return Array.from(this.segments.values());
    }

    /**
     * Create custom segment
     */
    async createSegment(segmentData) {
        try {
            const segment = {
                id: this.generateSegmentId(),
                name: segmentData.name,
                description: segmentData.description || '',
                icon: segmentData.icon || '🎯',
                criteria: segmentData.criteria || {},
                isDefault: false,
                createdBy: segmentData.createdBy || 'current-user',
                createdAt: new Date()
            };

            this.segments.set(segment.id, segment);
            
            console.log('Segment created:', segment);
            return segment;
            
        } catch (error) {
            console.error('Failed to create segment:', error);
            throw new Error('Failed to create segment');
        }
    }

    /**
     * Generate unique campaign ID
     */
    generateCampaignId() {
        return 'camp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate unique segment ID
     */
    generateSegmentId() {
        return 'seg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Check if service is ready
     */
    isReady() {
        return this.isInitialized;
    }
}

