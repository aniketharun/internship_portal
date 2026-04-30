import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Mail, ExternalLink, Check, X, Award, Code, User, Github, MessageSquare } from 'lucide-react';

const JobApplications = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [internship, setInternship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setBy] = useState('newest'); // 'newest', 'ats-desc', 'ats-asc'

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch internship details for context
                const internshipRes = await api.get(`/internships/${id}`);
                setInternship(internshipRes.data.data);

                // Fetch applications
                const appsRes = await api.get(`/applications/internship/${id}`);
                setApplications(appsRes.data.data);
            } catch (err) {
                setError('Failed to load applications. You might not be authorized.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const sortedApplications = [...applications].sort((a, b) => {
        if (sortBy === 'ats-desc') return (b.student?.atsScore || 0) - (a.student?.atsScore || 0);
        if (sortBy === 'ats-asc') return (a.student?.atsScore || 0) - (b.student?.atsScore || 0);
        return new Date(b.appliedAt) - new Date(a.appliedAt);
    });

    const handleStatusUpdate = async (appId, newStatus) => {
        try {
            await api.put(`/applications/${appId}/status`, { status: newStatus });

            // Update local state
            setApplications(applications.map(app =>
                app._id === appId ? { ...app, status: newStatus } : app
            ));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    if (loading) return <div style={styles.loading}>Loading applications...</div>;

    return (
        <div style={styles.container}>
            <style>
                {`
                    .jobs-preview-link-icon {
                        color: var(--text-color);
                        opacity: 0.6;
                        display: flex;
                        transition: all 0.2s;
                    }
                    .jobs-preview-link-icon:hover {
                        color: var(--primary-color);
                        opacity: 1;
                    }
                `}
            </style>
            <Link to="/dashboard" className="btn-link" style={{ marginBottom: '2rem' }}>
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>

            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Applications</h1>
                    <p style={styles.subtitle}>For: {internship?.title}</p>
                </div>
                <div style={styles.filters}>
                    <label style={styles.filterLabel}>Sort By:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setBy(e.target.value)}
                        style={styles.select}
                    >
                        <option value="newest">Newest First</option>
                        <option value="ats-desc">Highest ATS Score</option>
                        <option value="ats-asc">Lowest ATS Score</option>
                    </select>
                </div>
            </div>

            {error ? (
                <div style={styles.error}>{error}</div>
            ) : applications.length === 0 ? (
                <div style={styles.empty}>
                    <p>No applications received yet.</p>
                </div>
            ) : (
                <div style={styles.list}>
                    {sortedApplications.map((app) => (
                        <div key={app._id} style={styles.card}>
                            <div style={styles.applicantInfo}>
                                <div style={styles.nameRow}>
                                    <h3 style={styles.name}>{app.student?.name}</h3>
                                    {app.student?.atsScore > 0 && (
                                        <div style={{
                                            ...styles.atsBadge,
                                            background: app.student.atsScore > 80 ? 'rgba(16, 185, 129, 0.1)' : app.student.atsScore > 60 ? 'rgba(37, 99, 235, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: app.student.atsScore > 80 ? '#10b981' : app.student.atsScore > 60 ? '#3b82f6' : '#ef4444',
                                            borderColor: app.student.atsScore > 80 ? '#10b981' : app.student.atsScore > 60 ? '#3b82f6' : '#ef4444',
                                        }}>
                                            ATS Score: {app.student.atsScore}
                                        </div>
                                    )}
                                </div>
                                <div style={styles.contact}>
                                    <Mail size={16} />
                                    <a href={`mailto:${app.student?.email}`}>{app.student?.email}</a>
                                </div>
                                <div style={styles.appliedDate}>
                                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                                </div>
                                {app.student?.badges?.length > 0 && (
                                    <div style={styles.badgeRow}>
                                        {app.student.badges.map((badge, idx) => (
                                            <div key={idx} style={styles.miniBadge} title={`Verified: ${badge.title}`}>
                                                <Award size={14} />
                                                <span>{badge.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={styles.applicationContent}>
                                {app.resumeUrl && (
                                    <a
                                        href={app.resumeUrl.startsWith('http') ? app.resumeUrl : `${app.resumeUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={styles.resumeLink}
                                    >
                                        <ExternalLink size={16} /> View Resume
                                    </a>
                                )}
                                {app.coverLetter && (
                                    <div style={styles.coverLetter}>
                                        <strong>Cover Letter:</strong>
                                        <p>{app.coverLetter}</p>
                                    </div>
                                )}

                                {app.student?.projects?.length > 0 && (
                                    <div style={styles.projectsPreview}>
                                        <h4 style={styles.previewTitle}><Code size={14} /> Showcase Projects</h4>
                                        <div style={styles.previewGrid}>
                                            {app.student.projects.slice(0, 2).map((proj, idx) => (
                                                <div key={idx} style={styles.previewCard}>
                                                    <span style={styles.previewProjTitle}>{proj.title}</span>
                                                    <div style={styles.previewProjLinks}>
                                                        {proj.githubLink && (
                                                            <a href={proj.githubLink} target="_blank" rel="noreferrer" className="jobs-preview-link-icon"><Github size={12} /></a>
                                                        )}
                                                        {proj.liveLink && (
                                                            <a href={proj.liveLink} target="_blank" rel="noreferrer" className="jobs-preview-link-icon"><ExternalLink size={12} /></a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {app.student.projects.length > 2 && (
                                                <div style={styles.moreProjects}>+{app.student.projects.length - 2} more</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={styles.statusActions}>
                                <div style={styles.statusGroup}>
                                    <span style={styles.statusLabel}>Current Status:</span>
                                    <select
                                        value={app.status}
                                        onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                                        style={{ ...styles.statusSelect, ...getStatusStyle(app.status) }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="shortlisted">Shortlisted</option>
                                        <option value="interviewing">Interviewing</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>

                                <div style={styles.actionButtons}>
                                    <button
                                        onClick={() => navigate('/chat', { state: { recipientId: app.student._id } })}
                                        className="btn-outline-primary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                    >
                                        <MessageSquare size={16} /> Message Candidate
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Helper for status colors
const getStatusStyle = (status) => {
    switch (status) {
        case 'shortlisted': return { color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid #8b5cf6' };
        case 'interviewing': return { color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6' };
        case 'accepted': return { color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981' };
        case 'rejected': return { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' };
        default: return { color: 'var(--text-color)', background: 'var(--nav-bg)', border: '1px solid var(--border-color)', opacity: 0.8 };
    }
};

const styles = {
    container: {
        maxWidth: '98%',
        margin: '2rem auto',
        padding: '0 2rem',
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
    title: {
        fontSize: '2.25rem',
        fontWeight: '800',
        color: 'var(--text-color)',
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '-0.025em',
    },
    subtitle: {
        fontSize: '1.2rem',
        color: 'var(--text-color)',
        opacity: 0.7,
    },
    loading: {
        textAlign: 'center',
        padding: '4rem',
        color: 'var(--text-color)',
        opacity: 0.6,
    },
    error: {
        padding: '1rem',
        background: 'rgba(239, 68, 68, 0.1)',
        color: 'var(--error)',
        marginBottom: '1rem',
        borderRadius: '6px',
        border: '1px solid var(--error)',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    card: {
        background: 'var(--card-bg)',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        border: '1px solid var(--nav-bg)',
        color: 'var(--text-color)',
    },
    applicantInfo: {
        borderBottom: '1px solid var(--nav-bg)',
        paddingBottom: '1rem',
        marginBottom: '1rem',
    },
    name: {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
    },
    contact: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-color)',
        opacity: 0.8,
        marginBottom: '0.5rem',
    },
    appliedDate: {
        fontSize: '0.9rem',
        color: 'var(--text-color)',
        opacity: 0.5,
    },
    applicationContent: {
        marginBottom: '1.5rem',
    },
    resumeLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--primary-color)',
        textDecoration: 'none',
        fontWeight: '500',
        marginBottom: '1rem',
    },
    coverLetter: {
        background: 'var(--nav-bg)',
        padding: '1rem',
        borderRadius: '6px',
        fontSize: '0.95rem',
        color: 'var(--text-color)',
    },
    statusActions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    currentStatus: {
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '0.9rem',
    },
    actionButtons: {
        display: 'flex',
        gap: '1rem',
    },
    acceptBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: '#059669',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    rejectBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: '#dc2626',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    msgBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'white',
        color: 'var(--primary-color)',
        border: '1px solid var(--primary-color)',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.2s',
    },
    empty: {
        textAlign: 'center',
        padding: '3rem',
        background: 'var(--card-bg)',
        borderRadius: '8px',
        color: 'var(--text-color)',
        border: '1px solid var(--nav-bg)',
    },
    badgeRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '0.75rem',
    },
    miniBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        background: 'rgba(245, 158, 11, 0.1)',
        color: '#f59e0b',
        padding: '0.2rem 0.5rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '700',
        border: '1px solid rgba(245, 158, 11, 0.3)',
    },
    projectsPreview: {
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px dashed var(--border-color)',
    },
    previewTitle: {
        fontSize: '0.85rem',
        fontWeight: '700',
        color: 'var(--text-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        marginBottom: '0.75rem',
        opacity: 0.8,
    },
    previewGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
    },
    previewCard: {
        background: 'var(--nav-bg)',
        border: '1px solid var(--nav-bg)',
        borderRadius: '8px',
        padding: '0.4rem 0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    previewProjTitle: {
        fontSize: '0.8rem',
        fontWeight: '600',
        color: 'var(--text-color)',
    },
    previewProjLinks: {
        display: 'flex',
        gap: '0.4rem',
    },
    previewLinkIcon: {
        color: 'var(--text-color)',
        opacity: 0.6,
        display: 'flex',
    },
    moreProjects: {
        fontSize: '0.75rem',
        color: 'var(--text-color)',
        opacity: 0.5,
        fontWeight: '600',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    filters: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'var(--card-bg)',
        padding: '0.5rem 1rem',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
    },
    filterLabel: {
        fontSize: '0.85rem',
        fontWeight: '700',
        opacity: 0.7,
    },
    select: {
        background: 'none',
        border: 'none',
        color: 'var(--text-color)',
        fontWeight: '600',
        fontSize: '0.85rem',
        cursor: 'pointer',
        padding: '0.2rem',
        outline: 'none',
    },
    nameRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
    },
    atsBadge: {
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '800',
        border: '1px solid currentColor',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
    },
    statusGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    statusLabel: {
        fontSize: '0.85rem',
        fontWeight: '600',
        opacity: 0.6,
    },
    statusSelect: {
        padding: '0.4rem 0.75rem',
        borderRadius: '8px',
        fontWeight: '700',
        fontSize: '0.85rem',
        cursor: 'pointer',
        outline: 'none',
    },
};

export default JobApplications;
