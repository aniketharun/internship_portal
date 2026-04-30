import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../contexts/AuthContext';
import { MapPin, DollarSign, Calendar, Building, ArrowLeft, X, Target, CheckCircle, AlertCircle, Award, Code, MessageSquare } from 'lucide-react';

const InternshipDetails = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const [internship, setInternship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Application state
    const [showModal, setShowModal] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [applicationData, setApplicationData] = useState({
        resumeUrl: '',
        coverLetter: ''
    });
    const [resumeFile, setResumeFile] = useState(null);
    const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const internshipRes = await api.get(`/internships/${id}`);
                setInternship(internshipRes.data.data);

                // Check if user has already applied (if student)
                if (isAuthenticated && user?.role === 'student') {
                    const appsRes = await api.get('/applications/my-applications');
                    const applied = appsRes.data.data.some(app => app.internship._id === id);
                    setHasApplied(applied);
                }
            } catch (err) {
                setError('Failed to load internship details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isAuthenticated, user]);

    const handleApply = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let data;
            const config = {};

            if (uploadMode === 'file' && resumeFile) {
                // Use FormData for file upload
                const formData = new FormData();
                formData.append('internshipId', id);
                formData.append('coverLetter', applicationData.coverLetter);
                formData.append('resume', resumeFile);
                data = formData;
                config.headers = { 'Content-Type': 'multipart/form-data' };
            } else {
                // Use JSON for URL
                data = {
                    internshipId: id,
                    resumeUrl: applicationData.resumeUrl,
                    coverLetter: applicationData.coverLetter
                };
            }

            await api.post('/applications', data, config);
            setHasApplied(true);
            setShowModal(false);
            setSuccessMsg(`🎉 Application submitted! You'll receive notifications about your application status.`);
            setTimeout(() => setSuccessMsg(''), 6000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to apply');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;
    if (error) return <div style={styles.error}>{error}</div>;
    if (!internship) return <div style={styles.error}>Internship not found</div>;

    const isStudent = user?.role === 'student';
    const isOwner = user?._id === internship.postedBy?._id;
    const isAdmin = user?.role === 'admin';

    return (
        <div style={styles.container}>
            <Link to="/" style={styles.backLink}>
                <ArrowLeft size={20} /> Back to Internships
            </Link>

            {successMsg && (
                <div style={styles.successBanner}>
                    <CheckCircle size={20} color="#10b981" />
                    <span>{successMsg}</span>
                </div>
            )}

            <div style={styles.header}>
                <h1 style={styles.title}>{internship.title}</h1>
                <div style={styles.company}>
                    <Building size={20} />
                    <span>{internship.company}</span>
                </div>
            </div>

            <div style={styles.meta}>
                <div style={styles.metaItem}>
                    <MapPin size={18} />
                    <span>{internship.location}</span>
                </div>
                <div style={styles.metaItem}>
                    <DollarSign size={18} />
                    <span>{internship.stipend}</span>
                </div>
                <div style={styles.metaItem}>
                    <Calendar size={18} />
                    <span>Apply by {new Date(internship.deadline).toLocaleDateString()}</span>
                </div>
            </div>

            <div style={styles.content}>
                <h3 style={styles.sectionTitle}>About the Internship</h3>
                <p style={styles.description}>{internship.description}</p>
            </div>

            {internship.requirements?.length > 0 && (
                <div style={styles.content}>
                    <h3 style={styles.sectionTitle}><Code size={20} /> Required Skills</h3>
                    <div style={styles.skillGrid}>
                        {internship.requirements.map((req, idx) => (
                            <span key={idx} style={styles.skillBadge}>{req}</span>
                        ))}
                    </div>
                </div>
            )}

            {isStudent && internship.matchScore !== undefined && (
                <div style={styles.matchCard}>
                    <div style={styles.matchHeader}>
                        <div style={styles.matchTitleGroup}>
                            <Target size={24} color="var(--primary-color)" />
                            <h3 style={styles.matchTitle}>AI Match Score</h3>
                        </div>
                        <div style={{
                            ...styles.scoreBadge,
                            background: internship.matchScore >= 80 ? 'rgba(16, 185, 129, 0.15)' : internship.matchScore >= 50 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: internship.matchScore >= 80 ? '#10b981' : internship.matchScore >= 50 ? '#f59e0b' : '#ef4444',
                            border: `1px solid ${internship.matchScore >= 80 ? '#10b981' : internship.matchScore >= 50 ? '#f59e0b' : '#ef4444'}`
                        }}>
                            {internship.matchScore}%
                        </div>
                    </div>

                    <p style={styles.matchHint}>
                        This score is calculated based on your projects, certifications, and verified badges.
                    </p>

                    {internship.missingSkills?.length > 0 ? (
                        <div style={styles.missingSection}>
                            <h4 style={styles.missingTitle}><AlertCircle size={16} /> Skills to improve for a better match:</h4>
                            <div style={styles.missingGrid}>
                                {internship.missingSkills.map((skill, idx) => (
                                    <span key={idx} style={styles.missingBadge}>{skill}</span>
                                ))}
                            </div>
                            <p style={styles.missingAction}>
                                Tip: Add a project or earn a badge in these technologies to boost your score!
                            </p>
                        </div>
                    ) : (
                        <div style={styles.perfectMatch}>
                            <CheckCircle size={20} color="#10b981" />
                            <span>You have all the required skills! You're a great candidate.</span>
                        </div>
                    )}
                </div>
            )}

            <div style={styles.contact}>
                <h3 style={styles.sectionTitle}>Contact Recruiter</h3>
                <p>Posted by: {internship.postedBy?.name || 'Recruiter'}</p>
                <p>Email: <a href={`mailto:${internship.postedBy?.email}`}>{internship.postedBy?.email}</a></p>
            </div>

            <div style={styles.actions}>
                {!isAuthenticated ? (
                    <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                        Login to Apply
                    </button>
                ) : isStudent ? (
                    hasApplied ? (
                        <button style={styles.appliedBtn} disabled>
                            Applied
                        </button>
                    ) : (
                        <div style={styles.actionGroup}>
                            <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                                Apply Now
                            </button>
                            <button
                                onClick={() => navigate('/chat', { state: { recipientId: internship.postedBy._id } })}
                                className="btn-outline-primary"
                                style={{ padding: '1rem 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                            >
                                <MessageSquare size={20} /> Message Recruiter
                            </button>
                        </div>
                    )
                ) : null}
            </div>

            {/* Apply Modal */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3>Apply to {internship.company}</h3>
                            <button onClick={() => setShowModal(false)} style={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleApply} style={styles.form}>
                            <div style={styles.formGroup}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Resume Method</label>
                                    <div style={styles.radioGroup}>
                                        <label style={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                checked={uploadMode === 'url'}
                                                onChange={() => setUploadMode('url')}
                                            /> Link (GDrive, etc.)
                                        </label>
                                        <label style={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                checked={uploadMode === 'file'}
                                                onChange={() => setUploadMode('file')}
                                            /> Upload File (PDF/Doc)
                                        </label>
                                    </div>
                                </div>

                                {uploadMode === 'url' ? (
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Resume URL</label>
                                        <input
                                            type="url"
                                            required={uploadMode === 'url'}
                                            placeholder="https://..."
                                            value={applicationData.resumeUrl}
                                            onChange={(e) => setApplicationData({ ...applicationData, resumeUrl: e.target.value })}
                                            style={styles.input}
                                        />
                                    </div>
                                ) : (
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Upload Resume</label>
                                        <input
                                            type="file"
                                            required={uploadMode === 'file'}
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => setResumeFile(e.target.files[0])}
                                            style={styles.input}
                                        />
                                    </div>
                                )}
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Cover Letter (Optional)</label>
                                <textarea
                                    placeholder="Why are you a good fit?"
                                    value={applicationData.coverLetter}
                                    onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                                    style={styles.textarea}
                                    rows="4"
                                />
                            </div>
                            <div style={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="btn-primary">
                                    {submitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '900px',
        margin: '2rem auto',
        padding: '0 1rem',
    },
    backLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-color)',
        opacity: 0.6,
        marginBottom: '2rem',
        textDecoration: 'none',
        fontWeight: '500',
    },
    header: { marginBottom: '1.5rem' },
    title: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: 'var(--text-color)',
        marginBottom: '0.5rem',
    },
    company: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '1.25rem',
        color: 'var(--text-color)',
        opacity: 0.7,
    },
    meta: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        background: 'var(--card-bg)',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        marginBottom: '2rem',
        border: '1px solid var(--nav-bg)',
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-color)',
        fontSize: '1rem',
        fontWeight: '500',
        opacity: 0.9,
    },
    content: {
        background: 'var(--card-bg)',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        marginBottom: '2rem',
        border: '1px solid var(--nav-bg)',
    },
    sectionTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: 'var(--text-color)',
    },
    description: {
        lineHeight: '1.8',
        color: 'var(--text-color)',
        whiteSpace: 'pre-wrap',
        opacity: 0.85,
    },
    contact: {
        background: 'var(--card-bg)',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        border: '1px solid var(--border-color)',
        color: 'var(--text-color)',
    },
    actions: {
        textAlign: 'center',
        padding: '2rem',
    },
    applyBtn: {
        background: 'var(--primary-color)',
        color: 'white',
        padding: '1rem 3rem',
        borderRadius: '6px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        border: 'none',
        transition: 'transform 0.1s',
    },
    actionGroup: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
    },
    messageBtn: {
        background: 'white',
        color: 'var(--primary-color)',
        padding: '1rem 2rem',
        borderRadius: '6px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        border: '2px solid var(--primary-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        transition: 'all 0.2s',
    },
    skillGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginTop: '1rem',
    },
    skillBadge: {
        background: 'var(--nav-bg)',
        color: 'var(--text-color)',
        padding: '0.4rem 0.8rem',
        borderRadius: '6px',
        fontSize: '0.9rem',
        fontWeight: '600',
        border: '1px solid var(--border-color)',
    },
    matchCard: {
        background: 'var(--card-bg)',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        marginBottom: '2rem',
        border: '1px solid var(--border-color)',
    },
    matchHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    matchTitleGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    matchTitle: {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: 'var(--text-color)',
        margin: 0,
    },
    scoreBadge: {
        fontSize: '1.5rem',
        fontWeight: '800',
        padding: '0.5rem 1rem',
        borderRadius: '12px',
    },
    matchHint: {
        fontSize: '0.9rem',
        color: 'var(--text-color)',
        opacity: 0.6,
        marginBottom: '1.5rem',
    },
    missingSection: {
        background: 'var(--nav-bg)',
        padding: '1.25rem',
        borderRadius: '8px',
        border: '1px solid var(--nav-bg)',
    },
    missingTitle: {
        fontSize: '0.95rem',
        fontWeight: '700',
        color: 'var(--text-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
        opacity: 0.9,
    },
    missingGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1rem',
    },
    missingBadge: {
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
        padding: '0.25rem 0.6rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: '600',
        border: '1px solid #ef4444',
    },
    missingAction: {
        fontSize: '0.85rem',
        color: 'var(--text-color)',
        opacity: 0.6,
        fontStyle: 'italic',
    },
    perfectMatch: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: 'var(--success)',
        fontWeight: '600',
        padding: '1rem',
        background: 'rgba(16, 185, 129, 0.1)',
        borderRadius: '8px',
        border: '1px solid var(--success)',
    },
    appliedBtn: {
        background: 'var(--success)',
        color: 'white',
        padding: '1rem 3rem',
        borderRadius: '6px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'default',
        border: 'none',
        opacity: 0.8,
    },
    loginBtn: {
        background: 'var(--secondary-color)',
        color: 'white',
        padding: '1rem 3rem',
        borderRadius: '6px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        border: 'none',
    },
    loading: { textAlign: 'center', padding: '4rem', fontSize: '1.2rem', color: 'var(--text-color)', opacity: 0.6 },
    error: { textAlign: 'center', padding: '2rem', color: 'var(--error)', fontSize: '1.2rem' },
    successBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'rgba(16, 185, 129, 0.12)',
        border: '1px solid #10b981',
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        color: '#10b981',
        fontWeight: '600',
        fontSize: '0.95rem',
    },

    // Modal Styles
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        background: 'var(--card-bg)',
        padding: '2rem',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        color: 'var(--text-color)',
        border: '1px solid var(--nav-bg)',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        fontSize: '1.25rem',
        fontWeight: 'bold',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-color)',
        opacity: 0.6,
    },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    radioGroup: { display: 'flex', gap: '1rem' },
    radioLabel: { display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', cursor: 'pointer' },
    label: { fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-color)', opacity: 0.8 },
    input: {
        padding: '0.75rem',
        border: '1px solid var(--nav-bg)',
        borderRadius: '4px',
        fontSize: '1rem',
        background: 'var(--card-bg)',
        color: 'var(--text-color)',
    },
    textarea: {
        padding: '0.75rem',
        border: '1px solid var(--nav-bg)',
        borderRadius: '4px',
        fontSize: '1rem',
        fontFamily: 'inherit',
        resize: 'vertical',
        background: 'var(--card-bg)',
        color: 'var(--text-color)',
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        marginTop: '1rem',
    },
    cancelBtn: {
        padding: '0.75rem 1.5rem',
        background: 'transparent',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        cursor: 'pointer',
        color: 'var(--text-color)',
        opacity: 0.8,
    },
    submitBtn: {
        padding: '0.75rem 1.5rem',
        background: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: '500',
    },
};

export default InternshipDetails;
