/**
 * Mail Merge Panel Component for managing merge fields and previews
 */

import React, { useState, useEffect } from 'react';

const MailMergePanel = ({ 
    mergeFields = [], 
    onFieldInsert, 
    onPreview, 
    selectedContact = null,
    contacts = []
}) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [previewContact, setPreviewContact] = useState(selectedContact);

    // Group fields by category
    const fieldsByCategory = mergeFields.reduce((acc, field) => {
        if (!acc[field.category]) {
            acc[field.category] = [];
        }
        acc[field.category].push(field);
        return acc;
    }, {});

    // Filter fields based on category and search
    const filteredFields = mergeFields.filter(field => {
        const matchesCategory = selectedCategory === 'all' || field.category === selectedCategory;
        const matchesSearch = field.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             field.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleFieldClick = (field) => {
        if (onFieldInsert) {
            onFieldInsert(field.placeholder);
        }
    };

    const handlePreview = () => {
        if (onPreview && previewContact) {
            onPreview(previewContact);
        }
    };

    const categories = [
        { value: 'all', label: 'All Fields' },
        { value: 'personal', label: 'Personal' },
        { value: 'contact', label: 'Contact Info' },
        { value: 'work', label: 'Work Details' },
        { value: 'dates', label: 'Dates' },
        { value: 'custom', label: 'Custom' }
    ];

    return (
        <div style={{ 
            padding: '20px', 
            backgroundColor: 'white', 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h3 style={{ 
                margin: '0 0 20px 0', 
                color: '#667eea',
                fontSize: '18px',
                fontWeight: '500'
            }}>
                📧 Mail Merge Fields
            </h3>

            {/* Search and Filter */}
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Search fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        fontSize: '14px'
                    }}
                />

                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                    }}
                >
                    {categories.map(category => (
                        <option key={category.value} value={category.value}>
                            {category.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Fields List */}
            <div style={{ 
                flex: 1, 
                overflowY: 'auto',
                marginBottom: '20px'
            }}>
                {filteredFields.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        color: '#6c757d',
                        padding: '20px'
                    }}>
                        No fields found
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {filteredFields.map(field => (
                            <div
                                key={field.name}
                                onClick={() => handleFieldClick(field)}
                                style={{
                                    padding: '12px',
                                    border: '1px solid #e9ecef',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    backgroundColor: '#f8f9fa'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#e9ecef';
                                    e.target.style.borderColor = '#667eea';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#f8f9fa';
                                    e.target.style.borderColor = '#e9ecef';
                                }}
                            >
                                <div style={{ 
                                    fontWeight: '500', 
                                    color: '#495057',
                                    marginBottom: '4px'
                                }}>
                                    {field.displayName}
                                </div>
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: '#6c757d',
                                    fontFamily: 'monospace',
                                    marginBottom: '4px'
                                }}>
                                    {field.placeholder}
                                </div>
                                <div style={{ 
                                    fontSize: '11px', 
                                    color: '#868e96'
                                }}>
                                    {field.description}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview Section */}
            <div style={{ 
                borderTop: '1px solid #e9ecef',
                paddingTop: '20px'
            }}>
                <h4 style={{ 
                    margin: '0 0 15px 0', 
                    color: '#495057',
                    fontSize: '16px',
                    fontWeight: '500'
                }}>
                    🔍 Preview with Contact
                </h4>

                <select
                    value={previewContact ? previewContact.id : ''}
                    onChange={(e) => {
                        const contact = contacts.find(c => c.id === parseInt(e.target.value));
                        setPreviewContact(contact);
                    }}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        fontSize: '14px'
                    }}
                >
                    <option value="">Select a contact...</option>
                    {contacts.map(contact => (
                        <option key={contact.id} value={contact.id}>
                            {contact.firstName} {contact.lastName} ({contact.email})
                        </option>
                    ))}
                </select>

                <button
                    onClick={handlePreview}
                    disabled={!previewContact}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: previewContact ? '#28a745' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: previewContact ? 'pointer' : 'not-allowed',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    Preview Template
                </button>
            </div>

            {/* Quick Insert Buttons */}
            <div style={{ 
                marginTop: '15px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '5px'
            }}>
                {['firstName', 'lastName', 'email', 'jobTitle'].map(fieldName => {
                    const field = mergeFields.find(f => f.name === fieldName);
                    if (!field) return null;
                    
                    return (
                        <button
                            key={fieldName}
                            onClick={() => handleFieldClick(field)}
                            style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                backgroundColor: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}
                        >
                            {field.displayName}
                        </button>
                    );
                })}
            </div>

            {/* Help Text */}
            <div style={{ 
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#6c757d'
            }}>
                <strong>💡 Tips:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
                    <li>Click any field to insert it into your template</li>
                    <li>Use conditional content: <code>{'{{#if fieldName}}content{{/if}}'}</code></li>
                    <li>Format fields: <code>{'{{fieldName|upper}}'}</code></li>
                </ul>
            </div>
        </div>
    );
};

export default MailMergePanel;

