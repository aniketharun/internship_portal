import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Building, MapPin, Calendar, Clock } from 'lucide-react';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const { data } = await api.get('/applications/my-applications');
                setApplications(data.data);
            } catch (err) {
                setError('Failed to load your applications');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    if (loading) return <div style={styles.loading}>Loading applications...</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>My Applications</h1>

            {error && <div style={styles.error}>{error}</div>}

            {applications.length === 0 ? (
                <div style={styles.empty}>
                    <p>You haven't applied to any internships yet.</p>
                    <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>Browse Internships</Link>
                </div>
            ) : (
                <div style={styles.grid}>
                    {applications.map((app) => (
                        <div key={app._id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h3 style={styles.internshipTitle}>{app.internship?.title || 'Unknown Role'}</h3>
                                <span style={{ ...styles.status, ...getStatusStyle(app.status) }}>
                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </span>
                            </div>

                            <div style={styles.companyInfo}>
                                <Building size={16} />
                                <span>{app.internship?.company || 'Unknown Company'}</span>
                            </div>

                            <div style={styles.meta}>
                                <div style={styles.metaItem}>
                                    <MapPin size={14} />
                                    <span>{app.internship?.location || 'Unknown Location'}</span>
                                </div>
                                <div style={styles.metaItem}>
                                    <Clock size={14} />
                                    <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {app.internship && (
                                <Link to={`/internships/${app.internship._id}`} className="btn-link">
                                    View Internship
                                </Link>
                            )}
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
        case 'accepted': return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981' };
        case 'rejected': return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' };
        case 'reviewed': return { background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' };
        default: return { background: 'var(--nav-bg)', color: 'var(--text-color)', border: '1px solid var(--border-color)', opacity: 0.8 };
    }
};

const styles = {
    container: {
        width: '100%',
        margin: '2rem 0',
        padding: '0 4%',
    },
    title: {
        fontSize: '2.25rem',
        fontWeight: '800',
        color: 'var(--text-color)',
        marginBottom: '2rem',
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '-0.025em',
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
    empty: {
        textAlign: 'center',
        padding: '4rem',
        background: 'var(--card-bg)',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-color)',
        opacity: 0.7,
    },
    browseBtn: {
        display: 'inline-block',
        marginTop: '1rem',
        padding: '0.75rem 1.5rem',
        background: 'var(--primary-color)',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '6px',
        fontWeight: '500',
    },
    grid: {
        display: 'grid',
        gap: '1.5rem',
        width: '100%',
    },
    card: {
        background: 'var(--card-bg)',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: '1px solid var(--border-color)',
        width: '100%',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '0.5rem',
    },
    internshipTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--text-color)',
        margin: 0,
    },
    status: {
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: '500',
    },
    companyInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-color)',
        opacity: 0.8,
        marginBottom: '1rem',
        fontWeight: '500',
    },
    meta: {
        display: 'flex',
        gap: '1.5rem',
        color: 'var(--text-color)',
        opacity: 0.7,
        fontSize: '0.9rem',
        marginBottom: '1rem',
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
    },
    viewLink: {
        display: 'inline-block',
        color: 'var(--primary-color)',
        textDecoration: 'none',
        fontWeight: '500',
        fontSize: '0.9rem',
    },
};

export default MyApplications;
