import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../contexts/AuthContext';
import { PlusCircle, Users, Briefcase } from 'lucide-react';
import { DashboardSkeleton } from '../components/Skeleton';

const RecruiterDashboard = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchMyInternships = async () => {
            try {
                // In a real app, we might have a specific endpoint for "my internships"
                // For now, we fetch all and filter client-side or use the existing list if API supports filtering
                // Assuming we can get all internships and filter by postedBy
                // OR better, let's just fetch all and filter in frontend if backend doesn't support yet
                // Ideally, backend should have /internships?postedBy=me

                const { data } = await api.get('/internships');
                // Filtering client side for now as we didn't implement specific "my-internships" endpoint
                // But typically a recruiter only sees their own posts in a dashboard
                const myInternships = data.data.filter(i => i.postedBy._id === user._id || i.postedBy === user._id);
                setInternships(myInternships);
            } catch (err) {
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchMyInternships();
        }
    }, [user]);

    if (loading) return <DashboardSkeleton />;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Recruiter Dashboard</h1>
                <Link to="/internships/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <PlusCircle size={20} /> Post New Internship
                </Link>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.stats}>
                <div style={styles.statCard}>
                    <Briefcase size={24} color="var(--primary-color)" />
                    <div>
                        <h3>{internships.length}</h3>
                        <p>Active Postings</p>
                    </div>
                </div>
                {/* Placeholder for total applications count if we had it easily available */}
            </div>

            <h2 style={styles.subtitle}>Your Internships</h2>

            {internships.length === 0 ? (
                <div style={styles.empty}>
                    <p>You haven't posted any internships yet.</p>
                </div>
            ) : (
                <div style={styles.list}>
                    {internships.map((internship) => (
                        <div key={internship._id} style={styles.card}>
                            <div style={styles.cardInfo}>
                                <h3 style={styles.cardTitle}>{internship.title}</h3>
                                <p style={styles.cardMeta}>
                                    {internship.location} • {internship.stipend}
                                </p>
                            </div>
                            <div style={styles.cardActions}>
                                <Link to={`/internships/${internship._id}`} className="btn-link" style={{ textDecoration: 'none' }}>
                                    View Post
                                </Link>
                                <Link
                                    to={`/internships/${internship._id}/applications`}
                                    className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                >
                                    <Users size={18} />
                                    View Applications
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '2rem auto',
        padding: '0 1rem',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    title: {
        fontSize: '2.25rem',
        fontWeight: '800',
        color: 'var(--text-color)',
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '-0.025em',
    },
    subtitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: 'var(--text-color)',
        marginBottom: '1rem',
    },
    createButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'var(--primary-color)',
        color: 'white',
        padding: '0.75rem 1.5rem',
        borderRadius: '6px',
        fontWeight: '500',
        textDecoration: 'none',
    },
    stats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '3rem',
    },
    statCard: {
        background: 'var(--card-bg)',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        border: '1px solid var(--border-color)',
    },
    loading: {
        textAlign: 'center',
        padding: '4rem',
        color: 'var(--text-color)',
        opacity: 0.7,
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
        gap: '1rem',
    },
    card: {
        background: 'var(--card-bg)',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--text-color)',
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        marginBottom: '0.25rem',
    },
    cardMeta: {
        color: 'var(--text-color)',
        fontSize: '0.9rem',
        opacity: 0.7,
    },
    cardActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    viewLink: {
        color: 'var(--text-color)',
        opacity: 0.6,
        textDecoration: 'none',
        fontWeight: '500',
        fontSize: '0.9rem',
    },
    applicationsLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(37, 99, 235, 0.1)',
        color: 'var(--primary-color)',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: '500',
        fontSize: '0.9rem',
        border: '1px solid var(--primary-color)',
    },
    empty: {
        textAlign: 'center',
        padding: '3rem',
        background: 'var(--card-bg)',
        borderRadius: '8px',
        color: 'var(--text-color)',
        opacity: 0.7,
        border: '1px solid var(--border-color)',
    },
};

export default RecruiterDashboard;
