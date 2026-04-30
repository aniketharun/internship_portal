import { useState, useContext, useEffect } from 'react';
import AuthContext from '../contexts/AuthContext';
import api from '../services/api';
import { User, Mail, Calendar, Linkedin, Github, Award, BookOpen, GraduationCap, School, Save, Edit2, X, FileText, Upload, Camera, Check, Plus, ExternalLink, Briefcase, Code } from 'lucide-react';
import CropModal from '../components/CropModal';
import ProjectModal from '../components/ProjectModal';

const Profile = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [cropImage, setCropImage] = useState(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        profilePicture: '',
        dob: '',
        linkedin: '',
        github: '',
        certificates: [],
        projects: [],
        badges: [],
        education: {
            tenth: { school: '', percentage: '', year: '' },
            twelfth: { school: '', percentage: '', year: '' },
            degree: { college: '', major: '', cgpa: '', year: '' }
        }
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                profilePicture: user.profilePicture || '',
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                linkedin: user.linkedin || '',
                github: user.github || '',
                certificates: user.certificates || [],
                projects: user.projects || [],
                badges: user.badges || [],
                education: {
                    tenth: {
                        school: user.education?.tenth?.school || '',
                        percentage: user.education?.tenth?.percentage || '',
                        year: user.education?.tenth?.year || ''
                    },
                    twelfth: {
                        school: user.education?.twelfth?.school || '',
                        percentage: user.education?.twelfth?.percentage || '',
                        year: user.education?.twelfth?.year || ''
                    },
                    degree: {
                        college: user.education?.degree?.college || '',
                        major: user.education?.degree?.major || '',
                        cgpa: user.education?.degree?.cgpa || '',
                        year: user.education?.degree?.year || ''
                    }
                }
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEducationChange = (level, field, value) => {
        setFormData(prev => ({
            ...prev,
            education: {
                ...prev.education,
                [level]: { ...prev.education[level], [field]: value }
            }
        }));
    };

    const handleAddCertificate = () => {
        setFormData(prev => ({
            ...prev,
            certificates: [...prev.certificates, { title: '', link: '', file: '' }]
        }));
    };

    const handleCertificateChange = (index, field, value) => {
        const newCertificates = [...formData.certificates];
        newCertificates[index][field] = value;
        setFormData(prev => ({ ...prev, certificates: newCertificates }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setCropImage(reader.result);
        });
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedBlob) => {
        setCropImage(null);
        if (!croppedBlob) return;

        // Create a file from the blob
        const file = new File([croppedBlob], 'profile-pic.jpg', { type: 'image/jpeg' });
        await handleProfilePicUpload(file);
    };

    const handleProfilePicUpload = async (file) => {
        if (!file) return;
        setUploading('profile');
        const uploadFormData = new FormData();
        uploadFormData.append('profilePic', file);

        try {
            const { data } = await api.post('/auth/uploadprofilepic', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, profilePicture: data.data }));
            setMessage({ type: 'success', text: 'Profile picture uploaded and saved successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Upload failed' });
        } finally {
            setUploading(null);
        }
    };

    const handleFileUpload = async (index, file) => {
        if (!file) return;
        setUploading(index);
        const uploadFormData = new FormData();
        uploadFormData.append('certificate', file);

        try {
            const { data } = await api.post('/auth/uploadcertificate', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            handleCertificateChange(index, 'file', data.data);
            setMessage({ type: 'success', text: 'Certificate uploaded successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Upload failed' });
        } finally {
            setUploading(null);
        }
    };

    const handleRemoveCertificate = (index) => {
        setFormData(prev => ({
            ...prev,
            certificates: prev.certificates.filter((_, i) => i !== index)
        }));
    };

    const handleSaveProject = async (projectData) => {
        setLoading(true);
        try {
            let res;
            if (editingProject) {
                res = await api.put(`/projects/${editingProject._id}`, projectData);
            } else {
                res = await api.post('/projects', projectData);
            }

            if (res.data.success) {
                setFormData(prev => ({ ...prev, projects: res.data.data }));
                setIsProjectModalOpen(false);
                setEditingProject(null);
                setMessage({ type: 'success', text: `Project ${editingProject ? 'updated' : 'added'} successfully!` });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save project' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        setLoading(true);
        try {
            const { data } = await api.delete(`/projects/${projectId}`);
            if (data.success) {
                setFormData(prev => ({ ...prev, projects: data.data }));
                setMessage({ type: 'success', text: 'Project deleted successfully!' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to delete project' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await updateProfile(formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div style={styles.loading}>Loading...</div>;

    const isStudent = user.role === 'student';

    return (
        <div style={styles.container}>
            <style>
                {`
                    .prof-project-card {
                        background: var(--card-bg);
                        border-radius: 16px;
                        border: 1px solid var(--border-color);
                        overflow: hidden;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        display: flex;
                        flex-direction: column;
                        position: relative;
                    }
                    .prof-project-card:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.1);
                        border-color: var(--primary-color);
                    }

                    .prof-proj-link {
                        display: flex;
                        align-items: center;
                        gap: 0.4rem;
                        font-size: 0.8rem;
                        font-weight: 600;
                        color: var(--primary-color);
                        text-decoration: none;
                        transition: all 0.2s;
                    }
                    .prof-proj-link:hover {
                        opacity: 0.8;
                        text-decoration: underline;
                    }

                    .prof-proj-edit-btn {
                        padding: 0.4rem;
                        background: none;
                        border: none;
                        color: #64748b;
                        cursor: pointer;
                        border-radius: 6px;
                        display: flex;
                    }
                    .prof-proj-edit-btn:hover {
                        background: var(--background-color);
                        color: var(--text-color);
                    }

                    .prof-proj-delete-btn {
                        padding: 0.4rem;
                        background: none;
                        border: none;
                        color: var(--error);
                        cursor: pointer;
                        border-radius: 6px;
                        display: flex;
                    }
                    .prof-proj-delete-btn:hover {
                        background: rgba(239, 68, 68, 0.1);
                    }

                    .prof-badge-card {
                        background: var(--card-bg);
                        border-radius: 16px;
                        padding: 1.25rem;
                        border: 1px solid var(--border-color);
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        transition: all 0.2s;
                    }
                    .prof-badge-card:hover {
                        transform: scale(1.02);
                        box-shadow: 0 8px 15px -3px rgba(245, 158, 11, 0.15);
                    }

                    .prof-profile-pic-label:hover {
                        transform: scale(1.1);
                        background: var(--secondary-color);
                    }
                `}
            </style>
            <div style={styles.profileCard}>
                <div style={styles.header}>
                    <div style={styles.titleSection}>
                        <h1 style={styles.title}>My Profile</h1>
                        <p style={styles.roleTag}>{user.role === 'student' ? 'STUDENT/FRESHER' : user.role.toUpperCase()}</p>
                    </div>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Edit2 size={18} /> Edit Profile
                        </button>
                    ) : (
                        <div style={styles.actionGroup}>
                            <button onClick={() => setIsEditing(false)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <X size={18} /> Cancel
                            </button>
                            <button onClick={handleSubmit} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={loading}>
                                <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>

                {message.text && (
                    <div style={message.type === 'success' ? styles.successMsg : styles.errorMsg}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Profile Picture Section */}
                    <div style={styles.profilePicContainer}>
                        <div style={styles.avatarWrapper}>
                            {formData.profilePicture ? (
                                <img
                                    src={`${import.meta.env.VITE_API_BASE_URL || ''}${formData.profilePicture}`}
                                    alt="Profile"
                                    style={styles.avatar}
                                />
                            ) : (
                                <div style={styles.avatarPlaceholder}>
                                    <User size={60} color="var(--text-color)" style={{ opacity: 0.3 }} />
                                </div>
                            )}

                            {isEditing && (
                                <div style={styles.avatarOverlay}>
                                    <label htmlFor="profile-pic-input" style={styles.cameraBtn} className="prof-profile-pic-label">
                                        <Camera size={20} />
                                        <input
                                            type="file"
                                            id="profile-pic-input"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                        {uploading === 'profile' && <p style={styles.uploadingText}>Uploading...</p>}
                    </div>

                    {/* Basic Info */}
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}><User size={20} /> Personal Details</h2>
                        <div style={styles.grid}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Full Name</label>
                                <div style={styles.inputWrapper}>
                                    <User style={styles.icon} size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Email Address</label>
                                <div style={styles.inputWrapper}>
                                    <Mail style={styles.icon} size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Date of Birth</label>
                                <div style={styles.inputWrapper}>
                                    <Calendar style={styles.icon} size={18} />
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Social Links */}
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}><Linkedin size={20} /> Professional Links</h2>
                        <div style={styles.grid}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>LinkedIn Profile</label>
                                <div style={styles.inputWrapper}>
                                    <Linkedin style={styles.icon} size={18} />
                                    <input
                                        type="url"
                                        name="linkedin"
                                        placeholder="https://linkedin.com/in/username"
                                        value={formData.linkedin}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>GitHub Profile</label>
                                <div style={styles.inputWrapper}>
                                    <Github style={styles.icon} size={18} />
                                    <input
                                        type="url"
                                        name="github"
                                        placeholder="https://github.com/username"
                                        value={formData.github}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Academic Details - Students Only */}
                    {isStudent && (
                        <section style={styles.section}>
                            <h2 style={styles.sectionTitle}><GraduationCap size={20} /> Academic Details</h2>

                            <div style={styles.eduBlock}>
                                <h3 style={styles.eduLabel}><School size={18} /> 10th Grade</h3>
                                <div style={styles.grid}>
                                    <input
                                        placeholder="School Name"
                                        value={formData.education.tenth.school}
                                        onChange={(e) => handleEducationChange('tenth', 'school', e.target.value)}
                                        disabled={!isEditing}
                                        style={styles.input}
                                    />
                                    <input
                                        placeholder="Percentage"
                                        value={formData.education.tenth.percentage}
                                        onChange={(e) => handleEducationChange('tenth', 'percentage', e.target.value)}
                                        disabled={!isEditing}
                                        style={styles.input}
                                    />
                                    <input
                                        placeholder="Passing Year"
                                        value={formData.education.tenth.year}
                                        onChange={(e) => handleEducationChange('tenth', 'year', e.target.value)}
                                        disabled={!isEditing}
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.eduBlock}>
                                <h3 style={styles.eduLabel}><School size={18} /> 12th Grade / Diploma</h3>
                                <div style={styles.grid}>
                                    <input
                                        placeholder="School/College Name"
                                        value={formData.education.twelfth.school}
                                        onChange={(e) => handleEducationChange('twelfth', 'school', e.target.value)}
                                        disabled={!isEditing}
                                        style={styles.input}
                                    />
                                    <input
                                        placeholder="Percentage"
                                        value={formData.education.twelfth.percentage}
                                        onChange={(e) => handleEducationChange('twelfth', 'percentage', e.target.value)}
                                        disabled={!isEditing}
                                        style={styles.input}
                                    />
                                    <input
                                        placeholder="Passing Year"
                                        value={formData.education.twelfth.year}
                                        onChange={(e) => handleEducationChange('twelfth', 'year', e.target.value)}
                                        disabled={!isEditing}
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.eduBlock}>
                                <h3 style={styles.eduLabel}><GraduationCap size={18} /> Degree / Graduation</h3>
                                <div style={styles.grid4}>
                                    <input
                                        placeholder="College Name"
                                        value={formData.education.degree.college}
                                        onChange={(e) => handleEducationChange('degree', 'college', e.target.value)}
                                        disabled={!isEditing}
                                        style={styles.input}
                                    />
                                    <input
                                        placeholder="Major/Stream"
                                        value={formData.education.degree.major}
                                        onChange={(e) => handleEducationChange('degree', 'major', e.target.value)}
                                        disabled={!isEditing}
                                        style={styles.input}
                                    />
                                    <input
                                        placeholder="CGPA"
                                        value={formData.education.degree.cgpa}
                                        onChange={(e) => handleEducationChange('degree', 'cgpa', e.target.value)}
                                        disabled={!isEditing}
                                        style={styles.input}
                                    />
                                    <input
                                        placeholder="Passing Year"
                                        value={formData.education.degree.year}
                                        onChange={(e) => handleEducationChange('degree', 'year', e.target.value)}
                                        disabled={!isEditing}
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Certificates - Students Only */}
                    {isStudent && (
                        <section style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <h2 style={styles.sectionTitle}><Award size={20} /> Certificates</h2>
                                {isEditing && (
                                    <button type="button" onClick={handleAddCertificate} className="btn-link" style={{ fontSize: '0.85rem' }}>
                                        + Add New
                                    </button>
                                )}
                            </div>
                            {formData.certificates.map((cert, index) => (
                                <div key={index} style={styles.certCard}>
                                    <div style={styles.certInputs}>
                                        <input
                                            placeholder="Certificate Title"
                                            value={cert.title}
                                            onChange={(e) => handleCertificateChange(index, 'title', e.target.value)}
                                            disabled={!isEditing}
                                            style={styles.input}
                                        />
                                        <input
                                            placeholder="External Link (URL)"
                                            value={cert.link}
                                            onChange={(e) => handleCertificateChange(index, 'link', e.target.value)}
                                            disabled={!isEditing}
                                            style={styles.input}
                                        />
                                    </div>
                                    <div style={styles.uploadSection}>
                                        {isEditing ? (
                                            <div style={styles.fileInputWrapper}>
                                                <input
                                                    type="file"
                                                    id={`cert-file-${index}`}
                                                    onChange={(e) => handleFileUpload(index, e.target.files[0])}
                                                    style={{ display: 'none' }}
                                                />
                                                <label htmlFor={`cert-file-${index}`} style={styles.uploadBtn}>
                                                    <Upload size={16} />
                                                    {uploading === index ? 'Uploading...' : cert.file ? 'Change file' : 'Upload PDF/Image'}
                                                </label>
                                            </div>
                                        ) : null}

                                        {cert.file && (
                                            <a
                                                href={`${import.meta.env.VITE_API_BASE_URL || ''}${cert.file}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={styles.fileLink}
                                            >
                                                <FileText size={16} /> View Attached File
                                            </a>
                                        )}

                                        {isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCertificate(index)}
                                                className="btn-danger"
                                                style={{ width: '36px', height: '36px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {formData.certificates.length === 0 && !isEditing && (
                                <p style={styles.emptyText}>No certificates added.</p>
                            )}
                        </section>
                    )}

                    {/* Projects Section - Students Only */}
                    {isStudent && (
                        <section style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <h2 style={styles.sectionTitle}><Code size={20} /> Projects Showcase</h2>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => { setEditingProject(null); setIsProjectModalOpen(true); }}
                                        className="btn-link" style={{ fontSize: '0.85rem' }}
                                    >
                                        <Plus size={16} /> Add Project
                                    </button>
                                )}
                            </div>

                            <div style={styles.projectGrid}>
                                {formData.projects?.map((project, index) => (
                                    <div key={index} className="prof-project-card">
                                        <div style={styles.projectContent}>
                                            <h3 style={styles.projTitle}>{project.title}</h3>
                                            <p style={styles.projDesc}>{project.description}</p>
                                            <div style={styles.techStack}>
                                                {project.technologies.map((tech, tIdx) => (
                                                    <span key={tIdx} style={styles.techBadge}>{tech}</span>
                                                ))}
                                            </div>
                                            <div style={styles.projLinks}>
                                                {project.githubLink && (
                                                    <a href={project.githubLink} target="_blank" rel="noreferrer" className="prof-proj-link">
                                                        <Github size={16} /> GitHub
                                                    </a>
                                                )}
                                                {project.liveLink && (
                                                    <a href={project.liveLink} target="_blank" rel="noreferrer" className="prof-proj-link">
                                                        <ExternalLink size={16} /> Live Demo
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        {isEditing && (
                                            <div style={styles.projActions}>
                                                <button
                                                    type="button"
                                                    onClick={() => { setEditingProject(project); setIsProjectModalOpen(true); }}
                                                    className="prof-proj-edit-btn"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteProject(project._id)}
                                                    className="prof-proj-delete-btn"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {formData.projects?.length === 0 && !isEditing && (
                                <p style={styles.emptyText}>No projects added yet. Showcase your work to stand out!</p>
                            )}
                        </section>
                    )}

                    {/* Skill Badges - Students Only */}
                    {isStudent && (
                        <section style={styles.section}>
                            <h2 style={styles.sectionTitle}><Award size={20} color="#f59e0b" /> Verified Skill Badges</h2>
                            <div style={styles.badgeGrid}>
                                {formData.badges?.map((badge, index) => (
                                    <div key={index} className="prof-badge-card">
                                        <div style={styles.badgeIconWrapper}>
                                            <Award size={32} color="#f59e0b" />
                                            <div style={styles.verifiedCheck}>
                                                <Check size={10} color="white" strokeWidth={4} />
                                            </div>
                                        </div>
                                        <div style={styles.badgeInfo}>
                                            <h4 style={styles.badgeTitle}>{badge.title}</h4>
                                            <p style={styles.badgeMeta}>Score: {Math.round(badge.score)}%</p>
                                            <p style={styles.badgeDate}>{new Date(badge.awardedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {formData.badges?.length === 0 && (
                                <div style={styles.emptyBadgeState}>
                                    <Award size={40} color="#e2e8f0" style={{ marginBottom: '0.5rem' }} />
                                    <p style={styles.emptyText}>No verified badges yet. Score 80%+ on a Mock Test to earn one!</p>
                                </div>
                            )}
                        </section>
                    )}
                </form>
            </div>

            <ProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => { setIsProjectModalOpen(false); setEditingProject(null); }}
                onSave={handleSaveProject}
                project={editingProject}
            />

            {cropImage && (
                <CropModal
                    image={cropImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setCropImage(null)}
                />
            )}
        </div>
    );
};

const styles = {
    profilePicContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '2.5rem',
    },
    avatarWrapper: {
        position: 'relative',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        padding: '4px',
        background: 'var(--card-bg)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '2px solid var(--border-color)',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        objectFit: 'cover',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'var(--background-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarOverlay: {
        position: 'absolute',
        bottom: '5px',
        right: '5px',
    },
    cameraBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        background: 'var(--primary-color)',
        color: 'white',
        borderRadius: '50%',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        transition: 'transform 0.2s',
    },
    uploadingText: {
        marginTop: '0.75rem',
        fontSize: '0.875rem',
        color: 'var(--primary-color)',
        fontWeight: '600',
    },
    container: {
        maxWidth: '98%',
        margin: '2rem auto',
        padding: '0 2rem',
    },
    profileCard: {
        background: 'var(--card-bg)',
        borderRadius: '12px',
        padding: '2.5rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        border: '1px solid var(--border-color)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '2px solid var(--border-color)',
        paddingBottom: '1.5rem',
        marginBottom: '2rem',
    },
    titleSection: {
        display: 'flex',
        flexDirection: 'column',
    },
    title: {
        fontSize: '2.25rem',
        fontWeight: '800',
        color: 'var(--text-color)',
        marginBottom: '0.25rem',
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '-0.025em',
    },
    roleTag: {
        display: 'inline-block',
        background: 'rgba(37, 99, 235, 0.1)',
        color: 'var(--primary-color)',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '700',
        width: 'fit-content',
        border: '1px solid var(--primary-color)',
    },
    actionGroup: {
        display: 'flex',
        gap: '0.75rem',
    },
    editBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'white',
        color: '#475569',
        border: '1px solid #e2e8f0',
        padding: '0.625rem 1.25rem',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    saveBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        padding: '0.625rem 1.25rem',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    cancelBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'var(--nav-bg)',
        color: 'var(--text-color)',
        border: '1px solid var(--border-color)',
        padding: '0.625rem 1.25rem',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        opacity: 0.8,
    },
    section: {
        marginBottom: '2.5rem',
    },
    sectionTitle: {
        fontSize: '1.1rem',
        fontWeight: '700',
        color: 'var(--text-color)',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
    },
    grid4: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
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
        opacity: 0.7,
    },
    inputWrapper: {
        position: 'relative',
    },
    icon: {
        position: 'absolute',
        left: '0.75rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text-color)',
        opacity: 0.4,
    },
    input: {
        width: '100%',
        padding: '0.75rem 1rem 0.75rem 2.5rem',
        border: '1.5px solid var(--border-color)',
        borderRadius: '8px',
        fontSize: '0.95rem',
        color: 'var(--text-color)',
        background: 'var(--input-bg)',
        transition: 'border-color 0.2s',
        outline: 'none',
    },
    eduBlock: {
        marginBottom: '1.5rem',
        padding: '1.25rem',
        background: 'var(--background-color)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
    },
    eduLabel: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: 'var(--text-color)',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        opacity: 0.9,
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem',
    },
    addBtn: {
        padding: '0.4rem 0.8rem',
        background: 'rgba(16, 185, 129, 0.1)',
        color: 'var(--success)',
        border: '1px solid var(--success)',
        borderRadius: '6px',
        fontSize: '0.85rem',
        fontWeight: '600',
        cursor: 'pointer',
    },
    certCard: {
        background: 'var(--nav-bg)',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid var(--border-color)',
    },
    certInputs: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '1rem',
    },
    uploadSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    uploadBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(37, 99, 235, 0.1)',
        color: 'var(--primary-color)',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer',
        border: '1px dashed var(--primary-color)',
    },
    fileLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-color)',
        textDecoration: 'none',
        fontSize: '0.875rem',
        fontWeight: '500',
        background: 'var(--card-bg)',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        opacity: 0.8,
    },
    removeBtn: {
        marginLeft: 'auto',
        color: '#ef4444',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0.5rem',
    },
    successMsg: {
        padding: '1rem',
        background: '#f0fdf4',
        color: '#166534',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        fontWeight: '500',
        textAlign: 'center',
    },
    errorMsg: {
        padding: '1rem',
        background: '#fef2f2',
        color: '#991b1b',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        fontWeight: '500',
        textAlign: 'center',
    },
    emptyText: {
        color: 'var(--text-color)',
        opacity: 0.5,
        fontSize: '0.9rem',
        fontStyle: 'italic',
    },
    projectGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginTop: '0.5rem',
    },
    projectCard: {
        // Base styles moved to .prof-project-card if needed, but keeping non-hover styles here
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    projectContent: {
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        flex: 1,
    },
    projTitle: {
        fontSize: '1.1rem',
        fontWeight: '700',
        color: 'var(--text-color)',
        margin: 0,
    },
    projDesc: {
        fontSize: '0.9rem',
        color: 'var(--text-color)',
        lineHeight: '1.5',
        margin: 0,
        display: '-webkit-box',
        WebkitLineClamp: '3',
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        opacity: 0.7,
    },
    techStack: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: 'auto',
    },
    techBadge: {
        padding: '0.2rem 0.6rem',
        background: 'var(--nav-bg)',
        color: 'var(--text-color)',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '600',
        border: '1px solid var(--border-color)',
    },
    projLinks: {
        display: 'flex',
        gap: '1rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid #f1f5f9',
    },
    projLink: {
        // Base styles moved to .prof-proj-link if needed, but keeping non-hover styles here
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.8rem',
        fontWeight: '600',
        color: '#3b82f6',
        textDecoration: 'none',
        transition: 'color 0.2s',
    },
    projActions: {
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        display: 'flex',
        gap: '0.4rem',
        background: 'var(--nav-bg)',
        padding: '0.25rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        border: '1px solid var(--border-color)',
    },
    projEditBtn: {
        // Base styles moved to .prof-proj-edit-btn if needed, but keeping non-hover styles here
        padding: '0.4rem',
        background: 'none',
        border: 'none',
        color: '#64748b',
        cursor: 'pointer',
        borderRadius: '6px',
        display: 'flex',
    },
    projDeleteBtn: {
        // Base styles moved to .prof-proj-delete-btn if needed, but keeping non-hover styles here
        padding: '0.4rem',
        background: 'none',
        border: 'none',
        color: '#ef4444',
        cursor: 'pointer',
        borderRadius: '6px',
        display: 'flex',
    },
    badgeGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginTop: '0.5rem',
    },
    badgeCard: {
        background: 'rgba(245, 158, 11, 0.05)',
        borderRadius: '16px',
        padding: '1.25rem',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'all 0.2s',
    },
    badgeIconWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--white)',
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.1)',
    },
    verifiedCheck: {
        position: 'absolute',
        bottom: '-4px',
        right: '-4px',
        background: 'var(--success)',
        borderRadius: '50%',
        width: '18px',
        height: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid var(--white)',
    },
    badgeInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    badgeTitle: {
        fontSize: '0.9rem',
        fontWeight: '700',
        color: 'var(--text-color)',
        margin: 0,
    },
    badgeMeta: {
        fontSize: '0.75rem',
        fontWeight: '600',
        color: 'var(--text-color)',
        opacity: 0.8,
        margin: '0.1rem 0',
    },
    badgeDate: {
        fontSize: '0.7rem',
        color: 'var(--text-color)',
        opacity: 0.6,
        margin: 0,
    },
    emptyBadgeState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--nav-bg)',
        borderRadius: '12px',
        border: '1.5px dashed var(--border-color)',
    },
    loading: {
        textAlign: 'center',
        padding: '4rem',
        color: '#64748b',
    }
};

export default Profile;
