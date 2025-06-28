/**
 * Template Editor Component using Unlayer
 */

import React, { useRef, useState, useEffect } from 'react';
import EmailEditor from 'react-email-editor';

const TemplateEditor = ({ 
    onSave, 
    onLoad, 
    initialDesign = null, 
    mergeFields = [], 
    readOnly = false 
}) => {
    const emailEditorRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDesign, setCurrentDesign] = useState(null);

    useEffect(() => {
        // Load initial design when component mounts
        if (initialDesign && emailEditorRef.current) {
            emailEditorRef.current.editor.loadDesign(initialDesign);
        }
    }, [initialDesign]);

    const onReady = (unlayer) => {
        console.log('Unlayer editor is ready');
        setIsLoading(false);

        // Configure editor for staff communications
        unlayer.setMergeTags(mergeFields.map(field => ({
            name: field.displayName,
            value: field.placeholder,
            sample: field.description
        })));

        // Set up custom tools for staff communications
        setupCustomTools(unlayer);

        // Load initial design if provided
        if (initialDesign) {
            unlayer.loadDesign(initialDesign);
        }

        // Notify parent component
        if (onLoad) {
            onLoad(unlayer);
        }
    };

    const setupCustomTools = (unlayer) => {
        // Add custom merge field tool
        unlayer.registerTool({
            name: 'merge_field',
            label: 'Merge Field',
            icon: 'fa-user',
            supportedDisplayModes: ['web', 'email'],
            options: {
                field: {
                    title: 'Merge Field',
                    position: 1,
                    options: {
                        type: 'select',
                        label: 'Select Field',
                        defaultValue: '',
                        options: mergeFields.map(field => ({
                            label: field.displayName,
                            value: field.placeholder
                        }))
                    }
                }
            },
            values: {},
            renderer: {
                Viewer: React.forwardRef((props, ref) => {
                    const { values } = props;
                    return (
                        <div ref={ref} style={{ 
                            padding: '10px', 
                            backgroundColor: '#f0f0f0', 
                            border: '1px dashed #ccc',
                            borderRadius: '4px',
                            display: 'inline-block'
                        }}>
                            {values.field || 'Select a merge field'}
                        </div>
                    );
                }),
                exporterForHtml: (props) => {
                    const { values } = props;
                    return values.field || '';
                }
            }
        });

        // Add conditional content tool
        unlayer.registerTool({
            name: 'conditional_content',
            label: 'Conditional Content',
            icon: 'fa-code-branch',
            supportedDisplayModes: ['web', 'email'],
            options: {
                condition: {
                    title: 'Condition',
                    position: 1,
                    options: {
                        type: 'select',
                        label: 'Show if field has value',
                        defaultValue: '',
                        options: mergeFields.map(field => ({
                            label: field.displayName,
                            value: field.name
                        }))
                    }
                },
                content: {
                    title: 'Content',
                    position: 2,
                    options: {
                        type: 'textarea',
                        label: 'Content to show',
                        defaultValue: 'Content goes here...'
                    }
                }
            },
            values: {},
            renderer: {
                Viewer: React.forwardRef((props, ref) => {
                    const { values } = props;
                    return (
                        <div ref={ref} style={{ 
                            padding: '10px', 
                            backgroundColor: '#e8f4fd', 
                            border: '1px dashed #2196F3',
                            borderRadius: '4px'
                        }}>
                            <strong>Conditional:</strong> {values.condition || 'No condition set'}
                            <div style={{ marginTop: '5px', fontStyle: 'italic' }}>
                                {values.content || 'No content set'}
                            </div>
                        </div>
                    );
                }),
                exporterForHtml: (props) => {
                    const { values } = props;
                    if (!values.condition || !values.content) return '';
                    return `{{#if ${values.condition}}}${values.content}{{/if}}`;
                }
            }
        });
    };

    const exportHtml = () => {
        return new Promise((resolve, reject) => {
            const unlayer = emailEditorRef.current?.editor;
            if (!unlayer) {
                reject(new Error('Editor not ready'));
                return;
            }

            unlayer.exportHtml((data) => {
                const { design, html } = data;
                setCurrentDesign(design);
                resolve({ design, html });
            });
        });
    };

    const saveDesign = () => {
        return new Promise((resolve, reject) => {
            const unlayer = emailEditorRef.current?.editor;
            if (!unlayer) {
                reject(new Error('Editor not ready'));
                return;
            }

            unlayer.saveDesign((design) => {
                setCurrentDesign(design);
                resolve(design);
            });
        });
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const { design, html } = await exportHtml();
            
            if (onSave) {
                await onSave({ design, html });
            }
        } catch (error) {
            console.error('Failed to save template:', error);
            alert('Failed to save template: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const loadTemplate = (design) => {
        const unlayer = emailEditorRef.current?.editor;
        if (unlayer && design) {
            unlayer.loadDesign(design);
            setCurrentDesign(design);
        }
    };

    const previewTemplate = async () => {
        try {
            const { html } = await exportHtml();
            
            // Open preview in new window
            const previewWindow = window.open('', '_blank');
            previewWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Email Template Preview</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 0; 
                            padding: 20px; 
                            background-color: #f5f5f5; 
                        }
                        .preview-container { 
                            max-width: 600px; 
                            margin: 0 auto; 
                            background: white; 
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                        }
                    </style>
                </head>
                <body>
                    <div class="preview-container">
                        ${html}
                    </div>
                </body>
                </html>
            `);
            previewWindow.document.close();
        } catch (error) {
            console.error('Failed to preview template:', error);
            alert('Failed to preview template: ' + error.message);
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <div style={{ 
                padding: '10px', 
                backgroundColor: '#f8f9fa', 
                borderBottom: '1px solid #dee2e6',
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
            }}>
                <button 
                    onClick={handleSave}
                    disabled={isLoading || readOnly}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: readOnly ? 'not-allowed' : 'pointer',
                        opacity: readOnly ? 0.6 : 1
                    }}
                >
                    {isLoading ? 'Saving...' : 'Save Template'}
                </button>
                
                <button 
                    onClick={previewTemplate}
                    disabled={isLoading}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Preview
                </button>

                <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#6c757d' }}>
                    {isLoading ? 'Loading...' : 'Ready'}
                </div>
            </div>

            {/* Editor */}
            <div style={{ flex: 1, minHeight: '500px' }}>
                <EmailEditor
                    ref={emailEditorRef}
                    onReady={onReady}
                    options={{
                        displayMode: 'email',
                        locale: 'en',
                        appearance: {
                            theme: 'light',
                            panels: {
                                tools: {
                                    dock: 'left'
                                }
                            }
                        },
                        features: {
                            preview: true,
                            imageEditor: true,
                            stockImages: false, // Disable for corporate use
                            undoRedo: true,
                            textEditor: {
                                spellChecker: true,
                                cleanPaste: true
                            }
                        },
                        tools: {
                            // Customize available tools for staff communications
                            'text': { enabled: true },
                            'image': { enabled: true },
                            'button': { enabled: true },
                            'divider': { enabled: true },
                            'spacer': { enabled: true },
                            'social': { enabled: false }, // Not needed for internal comms
                            'video': { enabled: false }, // Disable for email compatibility
                            'timer': { enabled: false },
                            'menu': { enabled: false }
                        },
                        mergeTags: mergeFields.map(field => ({
                            name: field.displayName,
                            value: field.placeholder,
                            sample: field.description
                        }))
                    }}
                    style={{ height: '100%' }}
                />
            </div>
        </div>
    );
};

export default TemplateEditor;

