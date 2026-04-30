import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import InternshipCard from '../components/InternshipCard';
import AuthContext from '../contexts/AuthContext';
import { Sparkles, Target, ArrowLeft } from 'lucide-react';
import TypingHeadline from '../components/TypingHeadline';
import { useNavigate } from 'react-router-dom';

const AiMatch = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchMatches = async () => {
            setLoading(true);
            try {
                // Fetch a good amount of internships to find matches
                const { data } = await api.get('/internships?limit=50');

                // The backend already calculates matchScore for students
                // We just need to sort them by score descending
                const sortedMatches = data.data
                    .filter(i => i.matchScore !== undefined)
                    .sort((a, b) => b.matchScore - a.matchScore);

                setInternships(sortedMatches);
            } catch (err) {
                setError('Failed to analyze matches. Please ensure your profile is complete.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [isAuthenticated, navigate]);

    if (loading) {
        return (
            <div style={styles.loaderContainer}>
                <div style={styles.aiLoader}>
                    <Sparkles size={48} className="ai-spin" color="var(--primary-color)" />
                    <h2 style={styles.loaderText}>Propella is analyzing your career path...</h2>
                </div>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes spin {
                        0% { transform: rotate(0deg) scale(1); }
                        50% { transform: rotate(180deg) scale(1.2); }
                        100% { transform: rotate(360deg) scale(1); }
                    }
                    .ai-spin { animation: spin 2s infinite ease-in-out; }
                `}} />
            </div>
        );
    }

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <button onClick={() => navigate('/')} style={styles.backBtn}>
                    <ArrowLeft size={20} /> Back to Home
                </button>

                <div style={styles.header}>
                    <div style={styles.titleGroup}>
                        <TypingHeadline
                            text="AI Recommended for You"
                            style={styles.title}
                            highlightText="Recommended"
                            startTyping={true}
                        />
                    </div>
                    <p style={styles.subtitle}>
                        We've analyzed your skills, projects, and badges to find your perfect professional match.
                    </p>
                </div>

                {error && <div style={styles.error}>{error}</div>}

                {internships.length === 0 ? (
                    <div style={styles.empty}>
                        <Target size={48} style={{ opacity: 0.3 }} />
                        <h3>Boost your match score!</h3>
                        <p>Complete your profile, add projects, and earn skill badges to see AI recommendations.</p>
                        <button onClick={() => navigate('/profile')} className="btn-primary" style={{ marginTop: '1rem' }}>
                            Update Profile
                        </button>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {internships.map((internship) => (
                            <InternshipCard key={internship._id} internship={internship} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    pageWrapper: {
        width: '100%',
        minHeight: '100vh',
        background: 'var(--background-color)',
    },
    container: {
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '5rem 2rem 5rem 2rem',
        position: 'relative',
    },
    backBtn: {
        position: 'absolute',
        top: '1.5rem',
        left: '2rem',
        background: 'transparent',
        border: 'none',
        color: 'var(--text-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        opacity: 0.6,
        fontSize: '1rem',
        fontWeight: '500',
        zIndex: 10,
    },
    header: {
        marginBottom: '4rem',
        textAlign: 'center',
    },
    titleGroup: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '1rem',
    },
    title: {
        fontSize: '3rem',
        fontWeight: '800',
        color: 'var(--text-color)',
        fontFamily: "'Outfit', sans-serif",
    },
    subtitle: {
        fontSize: '1.2rem',
        color: 'var(--text-color)',
        opacity: 0.7,
        maxWidth: '700px',
        margin: '0 auto',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '2.5rem',
    },
    loaderContainer: {
        height: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    },
    aiLoader: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
    },
    loaderText: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: 'var(--text-color)',
        opacity: 0.8,
    },
    empty: {
        textAlign: 'center',
        padding: '6rem 2rem',
        background: 'var(--card-bg)',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        color: 'var(--text-color)',
    },
    error: {
        background: 'rgba(239, 68, 68, 0.1)',
        color: 'var(--error)',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '3rem',
        border: '1px solid var(--error)',
        textAlign: 'center',
    },
};

export default AiMatch;
