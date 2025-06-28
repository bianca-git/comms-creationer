/**
 * Mail Merge Service for advanced staff communication features
 */

export class MailMergeService {
    constructor() {
        this.mergeFields = new Map();
        this.conditionalRules = [];
        this.isInitialized = false;
    }

    /**
     * Initialize the mail merge service
     */
    async initialize() {
        try {
            this.isInitialized = true;
            console.log('Mail Merge service initialized successfully');
            return true;
        } catch (error) {
            console.error('Mail Merge service initialization failed:', error);
            throw new Error('Mail Merge service initialization failed');
        }
    }

    /**
     * Extract merge fields from Excel contact data
     */
    extractMergeFields(contacts) {
        try {
            if (!contacts || contacts.length === 0) {
                return [];
            }

            // Get all unique field names from contacts
            const fieldSet = new Set();
            
            contacts.forEach(contact => {
                Object.keys(contact).forEach(key => {
                    if (key !== 'id' && contact[key] !== null && contact[key] !== undefined) {
                        fieldSet.add(key);
                    }
                });
            });

            // Convert to merge field objects with metadata
            const mergeFields = Array.from(fieldSet).map(fieldName => ({
                name: fieldName,
                displayName: this.formatDisplayName(fieldName),
                type: this.detectFieldType(contacts, fieldName),
                placeholder: `{{${fieldName}}}`,
                description: this.generateFieldDescription(fieldName),
                category: this.categorizeField(fieldName)
            }));

            // Store for later use
            this.mergeFields.clear();
            mergeFields.forEach(field => {
                this.mergeFields.set(field.name, field);
            });

            console.log(`Extracted ${mergeFields.length} merge fields:`, mergeFields);
            return mergeFields;

        } catch (error) {
            console.error('Failed to extract merge fields:', error);
            throw new Error('Failed to extract merge fields from contact data');
        }
    }

    /**
     * Format field name for display
     */
    formatDisplayName(fieldName) {
        return fieldName
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
            .replace(/_/g, ' ') // Replace underscores with spaces
            .trim();
    }

    /**
     * Detect field type based on data
     */
    detectFieldType(contacts, fieldName) {
        const sampleValues = contacts
            .slice(0, 10) // Check first 10 contacts
            .map(contact => contact[fieldName])
            .filter(value => value !== null && value !== undefined && value !== '');

        if (sampleValues.length === 0) return 'text';

        // Check for email
        if (fieldName.toLowerCase().includes('email') || 
            sampleValues.some(value => String(value).includes('@'))) {
            return 'email';
        }

        // Check for phone
        if (fieldName.toLowerCase().includes('phone') || fieldName.toLowerCase().includes('tel') ||
            sampleValues.some(value => /^\+?[\d\s\-\(\)]+$/.test(String(value)))) {
            return 'phone';
        }

        // Check for date
        if (fieldName.toLowerCase().includes('date') || fieldName.toLowerCase().includes('time') ||
            sampleValues.some(value => !isNaN(Date.parse(String(value))))) {
            return 'date';
        }

        // Check for number
        if (sampleValues.every(value => !isNaN(Number(value)))) {
            return 'number';
        }

        // Check for URL
        if (sampleValues.some(value => String(value).startsWith('http'))) {
            return 'url';
        }

        return 'text';
    }

    /**
     * Generate field description
     */
    generateFieldDescription(fieldName) {
        const descriptions = {
            'firstName': 'Staff member\'s first name',
            'lastName': 'Staff member\'s last name',
            'email': 'Staff member\'s email address',
            'company': 'Company or department name',
            'jobTitle': 'Job title or position',
            'phone': 'Phone number',
            'department': 'Department or division',
            'manager': 'Manager or supervisor name',
            'startDate': 'Employment start date',
            'location': 'Office location or address',
            'employeeId': 'Employee identification number'
        };

        return descriptions[fieldName] || `Staff member's ${this.formatDisplayName(fieldName).toLowerCase()}`;
    }

    /**
     * Categorize field for organization
     */
    categorizeField(fieldName) {
        const categories = {
            personal: ['firstName', 'lastName', 'fullName', 'name'],
            contact: ['email', 'phone', 'address', 'location'],
            work: ['jobTitle', 'department', 'company', 'manager', 'employeeId'],
            dates: ['startDate', 'endDate', 'birthDate', 'hireDate'],
            custom: []
        };

        for (const [category, fields] of Object.entries(categories)) {
            if (fields.some(field => fieldName.toLowerCase().includes(field.toLowerCase()))) {
                return category;
            }
        }

        return 'custom';
    }

    /**
     * Process template with mail merge
     */
    async processTemplate(template, contact, options = {}) {
        try {
            let processedContent = template;

            // Replace merge fields
            this.mergeFields.forEach((field, fieldName) => {
                const placeholder = field.placeholder;
                const value = this.formatFieldValue(contact[fieldName], field.type, options);
                
                // Replace all instances of the placeholder
                processedContent = processedContent.replace(
                    new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                    value
                );
            });

            // Process conditional content
            processedContent = this.processConditionalContent(processedContent, contact);

            // Process advanced formatting
            processedContent = this.processAdvancedFormatting(processedContent, contact, options);

            return processedContent;

        } catch (error) {
            console.error('Failed to process template:', error);
            throw new Error('Failed to process template with mail merge');
        }
    }

    /**
     * Format field value based on type
     */
    formatFieldValue(value, type, options = {}) {
        if (value === null || value === undefined || value === '') {
            return options.defaultValue || '';
        }

        switch (type) {
            case 'email':
                return String(value).toLowerCase();
            
            case 'phone':
                return this.formatPhoneNumber(String(value));
            
            case 'date':
                return this.formatDate(value, options.dateFormat);
            
            case 'number':
                return this.formatNumber(value, options.numberFormat);
            
            case 'text':
            default:
                return String(value);
        }
    }

    /**
     * Format phone number
     */
    formatPhoneNumber(phone) {
        // Remove all non-digit characters
        const digits = phone.replace(/\D/g, '');
        
        // Format based on length
        if (digits.length === 10) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        } else if (digits.length === 11 && digits[0] === '1') {
            return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
        }
        
        return phone; // Return original if can't format
    }

    /**
     * Format date
     */
    formatDate(date, format = 'MM/DD/YYYY') {
        try {
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) return String(date);

            const options = {
                'MM/DD/YYYY': { month: '2-digit', day: '2-digit', year: 'numeric' },
                'DD/MM/YYYY': { day: '2-digit', month: '2-digit', year: 'numeric' },
                'YYYY-MM-DD': { year: 'numeric', month: '2-digit', day: '2-digit' },
                'long': { year: 'numeric', month: 'long', day: 'numeric' },
                'short': { year: 'numeric', month: 'short', day: 'numeric' }
            };

            if (format === 'YYYY-MM-DD') {
                return dateObj.toISOString().split('T')[0];
            }

            return dateObj.toLocaleDateString('en-US', options[format] || options['MM/DD/YYYY']);
        } catch (error) {
            return String(date);
        }
    }

    /**
     * Format number
     */
    formatNumber(number, format = 'default') {
        try {
            const num = Number(number);
            if (isNaN(num)) return String(number);

            switch (format) {
                case 'currency':
                    return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    }).format(num);
                
                case 'percent':
                    return new Intl.NumberFormat('en-US', {
                        style: 'percent',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                    }).format(num / 100);
                
                case 'decimal':
                    return new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format(num);
                
                default:
                    return new Intl.NumberFormat('en-US').format(num);
            }
        } catch (error) {
            return String(number);
        }
    }

    /**
     * Process conditional content
     */
    processConditionalContent(content, contact) {
        // Pattern: {{#if fieldName}}content{{/if}}
        const ifPattern = /\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs;
        
        content = content.replace(ifPattern, (match, fieldName, conditionalContent) => {
            const fieldValue = contact[fieldName];
            return (fieldValue && fieldValue !== '') ? conditionalContent : '';
        });

        // Pattern: {{#unless fieldName}}content{{/unless}}
        const unlessPattern = /\{\{#unless\s+(\w+)\}\}(.*?)\{\{\/unless\}\}/gs;
        
        content = content.replace(unlessPattern, (match, fieldName, conditionalContent) => {
            const fieldValue = contact[fieldName];
            return (!fieldValue || fieldValue === '') ? conditionalContent : '';
        });

        return content;
    }

    /**
     * Process advanced formatting
     */
    processAdvancedFormatting(content, contact, options) {
        // Pattern: {{fieldName|format:options}}
        const formatPattern = /\{\{(\w+)\|(\w+)(?::([^}]+))?\}\}/g;
        
        content = content.replace(formatPattern, (match, fieldName, formatType, formatOptions) => {
            const fieldValue = contact[fieldName];
            if (!fieldValue) return '';

            switch (formatType) {
                case 'upper':
                    return String(fieldValue).toUpperCase();
                
                case 'lower':
                    return String(fieldValue).toLowerCase();
                
                case 'title':
                    return String(fieldValue).replace(/\w\S*/g, (txt) => 
                        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                    );
                
                case 'truncate':
                    const length = parseInt(formatOptions) || 50;
                    return String(fieldValue).length > length 
                        ? String(fieldValue).substring(0, length) + '...'
                        : String(fieldValue);
                
                default:
                    return String(fieldValue);
            }
        });

        return content;
    }

    /**
     * Validate template for merge fields
     */
    validateTemplate(template) {
        const errors = [];
        const warnings = [];

        // Find all merge field placeholders
        const placeholderPattern = /\{\{(\w+)\}\}/g;
        const matches = [...template.matchAll(placeholderPattern)];

        matches.forEach(match => {
            const fieldName = match[1];
            if (!this.mergeFields.has(fieldName)) {
                errors.push(`Unknown merge field: ${fieldName}`);
            }
        });

        // Check for unmatched conditional blocks
        const ifBlocks = (template.match(/\{\{#if/g) || []).length;
        const endIfBlocks = (template.match(/\{\{\/if\}\}/g) || []).length;
        
        if (ifBlocks !== endIfBlocks) {
            errors.push('Unmatched conditional blocks ({{#if}} / {{/if}})');
        }

        const unlessBlocks = (template.match(/\{\{#unless/g) || []).length;
        const endUnlessBlocks = (template.match(/\{\{\/unless\}\}/g) || []).length;
        
        if (unlessBlocks !== endUnlessBlocks) {
            errors.push('Unmatched conditional blocks ({{#unless}} / {{/unless}})');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Get available merge fields
     */
    getAvailableFields() {
        return Array.from(this.mergeFields.values());
    }

    /**
     * Get merge fields by category
     */
    getFieldsByCategory() {
        const categories = {};
        
        this.mergeFields.forEach(field => {
            if (!categories[field.category]) {
                categories[field.category] = [];
            }
            categories[field.category].push(field);
        });

        return categories;
    }

    /**
     * Preview template with sample data
     */
    async previewTemplate(template, sampleContact = null) {
        try {
            // Use provided sample or create default
            const contact = sampleContact || this.createSampleContact();
            
            return await this.processTemplate(template, contact);
        } catch (error) {
            console.error('Failed to preview template:', error);
            throw new Error('Failed to preview template');
        }
    }

    /**
     * Create sample contact for preview
     */
    createSampleContact() {
        return {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@company.com',
            jobTitle: 'Senior Manager',
            department: 'Marketing',
            company: 'Acme Corporation',
            phone: '+1-555-0123',
            manager: 'Jane Smith',
            startDate: '2020-01-15',
            location: 'New York Office',
            employeeId: 'EMP001'
        };
    }

    /**
     * Check if service is ready
     */
    isReady() {
        return this.isInitialized;
    }
}

