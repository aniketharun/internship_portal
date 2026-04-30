import { useState, useEffect } from 'react';
import { X, Save, Github, Link as LinkIcon, Code } from 'lucide-react';

const ProjectModal = ({ isOpen, onClose, onSave, project }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        technologies: '',
        githubLink: '',
        liveLink: '',
        thumbnail: ''
    });

    useEffect(() => {
        if (project) {
            setFormData({
                ...project,
                technologies: project.technologies.join(', ')
            });
        } else {
            setFormData({
                title: '',
                description: '',
                technologies: '',
                githubLink: '',
                liveLink: '',
                thumbnail: ''
            });
        }
    }, [project, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedData = {
            ...formData,
            technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(tech => tech !== '')
        };
        onSave(formattedData);
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <style>
                {`
                      .proj-modal-close-btn {
                          background: none;
                          border: none;
                          color: var(--text-color);
                          opacity: 0.6;
                          cursor: pointer;
                          padding: 0.25rem;
                          border-radius: 8px;
                          display: flex;
                          transition: background 0.2s;
                      }
                      .proj-modal-close-btn:hover {
                          background: var(--nav-bg);
                          opacity: 1;
                      }
 
                      .proj-modal-input {
                          padding: 0.75rem 1rem;
                          border-radius: 10px;
                          border: 1px solid var(--border-color);
                          background: var(--input-bg);
                          color: var(--text-color);
                          font-size: 1rem;
                          transition: all 0.2s;
                          outline: none;
                          width: 100%;
                      }
                     .proj-modal-input:focus {
                         border-color: #3b82f6;
                         box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                     }
 
                      .proj-modal-save-btn {
                          padding: 0.75rem 1.5rem;
                          border-radius: 10px;
                          background: var(--primary-color);
                          color: white;
                          border: none;
                          font-weight: 700;
                          cursor: pointer;
                          display: flex;
                          align-items: center;
                          transition: all 0.2s;
                      }
                      .proj-modal-save-btn:hover {
                          opacity: 0.9;
                          transform: translateY(-1px);
                          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                      }
                     .proj-modal-save-btn:active {
                         transform: translateY(0);
                         transform: scale(0.98);
                     }
                 `}
            </style>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}>{project ? 'Edit Project' : 'Add New Project'}</h2>
                    <button onClick={onClose} className="proj-modal-close-btn"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Project Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="proj-modal-input"
                            placeholder="e.g., AI Resume Parser"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="proj-modal-input"
                            style={{ height: '80px', resize: 'vertical' }}
                            placeholder="Describe what you built and how it works..."
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Technologies (comma separated)</label>
                        <input
                            type="text"
                            name="technologies"
                            value={formData.technologies}
                            onChange={handleChange}
                            className="proj-modal-input"
                            placeholder="React, Node.js, MongoDB"
                            required
                        />
                    </div>

                    <div style={styles.grid}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}><Github size={14} style={{ marginRight: '4px' }} /> GitHub Link</label>
                            <input
                                type="url"
                                name="githubLink"
                                value={formData.githubLink}
                                onChange={handleChange}
                                className="proj-modal-input"
                                placeholder="https://github.com/username/project"
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}><LinkIcon size={14} style={{ marginRight: '4px' }} /> Live Demo Link</label>
                            <input
                                type="url"
                                name="liveLink"
                                value={formData.liveLink}
                                onChange={handleChange}
                                className="proj-modal-input"
                                placeholder="https://project-demo.com"
                            />
                        </div>
                    </div>

                    <div style={styles.footer}>
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="proj-modal-save-btn">
                            <Save size={18} style={{ marginRight: '8px' }} />
                            {project ? 'Update Project' : 'Add Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
    },
    modal: {
        backgroundColor: 'var(--card-bg)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '600px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
    },
    header: {
        padding: '1.5rem 2rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--nav-bg)',
    },
    title: {
        fontSize: '1.25rem',
        fontWeight: '800',
        color: 'var(--text-color)',
        margin: 0,
    },
    closeBtn: {
        // Moved hover to .proj-modal-close-btn
    },
    form: {
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: 'var(--text-color)',
        opacity: 0.8,
        display: 'flex',
        alignItems: 'center',
    },
    input: {
        // Moved hover/focus to .proj-modal-input
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    },
    footer: {
        marginTop: '1rem',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
    },
    cancelBtn: {
        // Use btn-secondary instead of this
    },
    saveBtn: {
        // Moved hover to .proj-modal-save-btn
    }
};

export default ProjectModal;
