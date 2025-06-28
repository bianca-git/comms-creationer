/**
 * Excel Service for interacting with Excel data
 */

export class ExcelService {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * Initialize Excel service
     */
    async initialize() {
        try {
            if (typeof Office === 'undefined') {
                throw new Error('Office JavaScript API not available');
            }

            this.isInitialized = true;
            console.log('Excel service initialized successfully');
            return true;
            
        } catch (error) {
            console.error('Excel service initialization failed:', error);
            throw new Error('Excel service initialization failed');
        }
    }

    /**
     * Get contacts from the active Excel sheet
     */
    async getContactsFromActiveSheet() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            return new Promise((resolve, reject) => {
                Excel.run(async (context) => {
                    try {
                        // Get the active worksheet
                        const worksheet = context.workbook.worksheets.getActiveWorksheet();
                        
                        // Try to find a table first
                        const tables = worksheet.tables;
                        tables.load('items');
                        
                        await context.sync();
                        
                        let contacts = [];
                        
                        if (tables.items.length > 0) {
                            // Use the first table found
                            const table = tables.items[0];
                            const range = table.getDataBodyRange();
                            const headerRange = table.getHeaderRowRange();
                            
                            range.load('values');
                            headerRange.load('values');
                            
                            await context.sync();
                            
                            const headers = headerRange.values[0];
                            const data = range.values;
                            
                            contacts = this.parseContactData(headers, data);
                            
                        } else {
                            // No table found, try to detect data range
                            const usedRange = worksheet.getUsedRange();
                            usedRange.load('values');
                            
                            await context.sync();
                            
                            if (usedRange.values && usedRange.values.length > 1) {
                                const headers = usedRange.values[0];
                                const data = usedRange.values.slice(1);
                                
                                contacts = this.parseContactData(headers, data);
                            }
                        }
                        
                        console.log(`Loaded ${contacts.length} contacts from Excel`);
                        resolve(contacts);
                        
                    } catch (error) {
                        console.error('Error reading Excel data:', error);
                        reject(error);
                    }
                });
            });
            
        } catch (error) {
            console.error('Failed to get contacts from Excel:', error);
            
            // For development/demo, return mock data
            console.warn('Using mock contact data for development');
            return this.getMockContacts();
        }
    }

    /**
     * Parse contact data from Excel rows
     */
    parseContactData(headers, data) {
        const contacts = [];
        
        // Map common header variations to standard fields
        const headerMap = this.createHeaderMap(headers);
        
        data.forEach((row, index) => {
            if (this.isValidContactRow(row, headerMap)) {
                const contact = {
                    id: index + 1,
                    email: this.getFieldValue(row, headerMap, 'email'),
                    firstName: this.getFieldValue(row, headerMap, 'firstName'),
                    lastName: this.getFieldValue(row, headerMap, 'lastName'),
                    company: this.getFieldValue(row, headerMap, 'company'),
                    jobTitle: this.getFieldValue(row, headerMap, 'jobTitle'),
                    phone: this.getFieldValue(row, headerMap, 'phone'),
                    source: 'Excel',
                    imported: new Date(),
                    status: 'Active'
                };
                
                // Add any additional fields
                headers.forEach((header, colIndex) => {
                    if (header && !this.isStandardField(header) && row[colIndex]) {
                        contact[this.sanitizeFieldName(header)] = row[colIndex];
                    }
                });
                
                contacts.push(contact);
            }
        });
        
        return contacts;
    }

    /**
     * Create header mapping for common field variations
     */
    createHeaderMap(headers) {
        const map = {};
        
        headers.forEach((header, index) => {
            if (!header) return;
            
            const normalizedHeader = header.toLowerCase().trim();
            
            // Email field variations
            if (normalizedHeader.includes('email') || normalizedHeader.includes('e-mail')) {
                map.email = index;
            }
            // First name variations
            else if (normalizedHeader.includes('first') && normalizedHeader.includes('name')) {
                map.firstName = index;
            }
            // Last name variations
            else if (normalizedHeader.includes('last') && normalizedHeader.includes('name')) {
                map.lastName = index;
            }
            // Full name
            else if (normalizedHeader === 'name' || normalizedHeader === 'full name') {
                map.fullName = index;
            }
            // Company variations
            else if (normalizedHeader.includes('company') || normalizedHeader.includes('organization')) {
                map.company = index;
            }
            // Job title variations
            else if (normalizedHeader.includes('title') || normalizedHeader.includes('position') || normalizedHeader.includes('job')) {
                map.jobTitle = index;
            }
            // Phone variations
            else if (normalizedHeader.includes('phone') || normalizedHeader.includes('tel')) {
                map.phone = index;
            }
        });
        
        return map;
    }

    /**
     * Get field value from row using header map
     */
    getFieldValue(row, headerMap, fieldName) {
        const index = headerMap[fieldName];
        if (index !== undefined && row[index] !== undefined) {
            return String(row[index]).trim();
        }
        
        // Handle special cases
        if (fieldName === 'firstName' && headerMap.fullName !== undefined) {
            const fullName = String(row[headerMap.fullName]).trim();
            return fullName.split(' ')[0] || '';
        }
        
        if (fieldName === 'lastName' && headerMap.fullName !== undefined) {
            const fullName = String(row[headerMap.fullName]).trim();
            const parts = fullName.split(' ');
            return parts.length > 1 ? parts.slice(1).join(' ') : '';
        }
        
        return '';
    }

    /**
     * Check if a row contains valid contact data
     */
    isValidContactRow(row, headerMap) {
        // Must have an email address
        const email = this.getFieldValue(row, headerMap, 'email');
        return email && email.includes('@');
    }

    /**
     * Check if field is a standard contact field
     */
    isStandardField(header) {
        const standardFields = [
            'email', 'e-mail', 'first name', 'last name', 'name', 'full name',
            'company', 'organization', 'title', 'position', 'job title',
            'phone', 'telephone'
        ];
        
        const normalizedHeader = header.toLowerCase().trim();
        return standardFields.some(field => normalizedHeader.includes(field));
    }

    /**
     * Sanitize field name for object property
     */
    sanitizeFieldName(fieldName) {
        return fieldName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }

    /**
     * Create a new table in Excel for contacts
     */
    async createContactTable(contacts) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            return new Promise((resolve, reject) => {
                Excel.run(async (context) => {
                    try {
                        const worksheet = context.workbook.worksheets.getActiveWorksheet();
                        
                        // Prepare data for table
                        const headers = ['Email', 'First Name', 'Last Name', 'Company', 'Job Title', 'Phone', 'Status'];
                        const data = contacts.map(contact => [
                            contact.email || '',
                            contact.firstName || '',
                            contact.lastName || '',
                            contact.company || '',
                            contact.jobTitle || '',
                            contact.phone || '',
                            contact.status || 'Active'
                        ]);
                        
                        // Create range for table
                        const tableData = [headers, ...data];
                        const range = worksheet.getRange(`A1:${String.fromCharCode(65 + headers.length - 1)}${tableData.length}`);
                        range.values = tableData;
                        
                        // Create table
                        const table = worksheet.tables.add(range, true);
                        table.name = 'ContactsTable';
                        table.getHeaderRowRange().format.fill.color = '#667eea';
                        table.getHeaderRowRange().format.font.color = 'white';
                        
                        await context.sync();
                        
                        console.log('Contact table created successfully');
                        resolve(table);
                        
                    } catch (error) {
                        console.error('Error creating contact table:', error);
                        reject(error);
                    }
                });
            });
            
        } catch (error) {
            console.error('Failed to create contact table:', error);
            throw new Error('Failed to create contact table in Excel');
        }
    }

    /**
     * Get mock contacts for development
     */
    getMockContacts() {
        return [
            {
                id: 1,
                email: 'john.doe@example.com',
                firstName: 'John',
                lastName: 'Doe',
                company: 'Acme Corp',
                jobTitle: 'Marketing Manager',
                phone: '+1-555-0123',
                source: 'Excel',
                imported: new Date(),
                status: 'Active'
            },
            {
                id: 2,
                email: 'jane.smith@example.com',
                firstName: 'Jane',
                lastName: 'Smith',
                company: 'Tech Solutions',
                jobTitle: 'CEO',
                phone: '+1-555-0124',
                source: 'Excel',
                imported: new Date(),
                status: 'Active'
            },
            {
                id: 3,
                email: 'bob.johnson@example.com',
                firstName: 'Bob',
                lastName: 'Johnson',
                company: 'Design Studio',
                jobTitle: 'Creative Director',
                phone: '+1-555-0125',
                source: 'Excel',
                imported: new Date(),
                status: 'Active'
            },
            {
                id: 4,
                email: 'alice.brown@example.com',
                firstName: 'Alice',
                lastName: 'Brown',
                company: 'Consulting Group',
                jobTitle: 'Senior Consultant',
                phone: '+1-555-0126',
                source: 'Excel',
                imported: new Date(),
                status: 'Active'
            },
            {
                id: 5,
                email: 'charlie.wilson@example.com',
                firstName: 'Charlie',
                lastName: 'Wilson',
                company: 'Startup Inc',
                jobTitle: 'Product Manager',
                phone: '+1-555-0127',
                source: 'Excel',
                imported: new Date(),
                status: 'Active'
            }
        ];
    }

    /**
     * Check if service is initialized
     */
    isReady() {
        return this.isInitialized;
    }
}

