import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Award, Calendar, CheckCircle, XCircle, ChevronRight, BarChart2 } from 'lucide-react';

const TestResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const { data } = await api.get('/tests/my-results');
                setResults(data.data);
            } catch (err) {
                console.error('Failed to fetch results', err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div style={styles.loading}>Loading results...</div>;

    return (
        <div style={styles.container}>
            <style>
                {`
                    .results-card {
                        background: var(--card-bg);
                        padding: 1.5rem 2rem;
                        border-radius: 16px;
                        border: 1px solid var(--nav-bg);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        transition: transform 0.2s, box-shadow 0.2s;
                    }
                    .results-card:hover {
                        transform: translateX(4px);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                        border-color: var(--primary-color);
                    }
                `}
            </style>
            <div style={styles.header}>
                <h1 style={styles.title}>Your Performance</h1>
                <p style={styles.subtitle}>Review your assessment history and track your progress over time.</p>
            </div>

            {results.length === 0 ? (
                <div style={styles.empty}>
                    <BarChart2 size={48} color="var(--text-color)" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                    <p>You haven't taken any tests yet.</p>
                    <Link to="/tests" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem', textDecoration: 'none' }}>Browse Tests</Link>
                </div>
            ) : (
                <div style={styles.list}>
                    {results.map(result => (
                        <div key={result._id} className="results-card">
                            <div style={styles.cardInfo}>
                                <div style={styles.typeTag}>
                                    {result.test?.type === 'COMPANY_SPECIFIC' ? result.test?.company : 'Mock Test'}
                                </div>
                                <h3 style={styles.testTitle}>{result.test?.title}</h3>
                                <div style={styles.date}>
                                    <Calendar size={14} style={{ marginRight: '6px' }} />
                                    {formatDate(result.completedAt)}
                                </div>
                            </div>

                            <div style={styles.stats}>
                                <div style={styles.scoreContainer}>
                                    <div style={styles.scoreLabel}>Score</div>
                                    <div style={styles.scoreValue}>
                                        <span style={{ color: result.score / result.totalQuestions >= 0.7 ? 'var(--success)' : '#f59e0b' }}>
                                            {result.score}
                                        </span>
                                        <span style={{ color: 'var(--text-color)', fontSize: '1rem', opacity: 0.5 }}>/{result.totalQuestions}</span>
                                    </div>
                                </div>

                                <div style={styles.percentage}>
                                    {Math.round((result.score / result.totalQuestions) * 100)}%
                                </div>
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
        maxWidth: '800px',
        margin: '3rem auto',
        padding: '0 1.5rem',
    },
    header: {
        marginBottom: '2.5rem',
    },
    title: {
        fontSize: '2rem',
        fontWeight: '800',
        color: 'var(--text-color)',
        marginBottom: '0.5rem',
    },
    subtitle: {
        color: 'var(--text-color)',
        opacity: 0.7,
        fontSize: '1.1rem',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
    },
    card: {
        // Moved hover to .results-card CSS class
    },
    typeTag: {
        fontSize: '0.7rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--primary-color)',
        background: 'rgba(59, 130, 246, 0.1)',
        padding: '0.25rem 0.6rem',
        borderRadius: '6px',
        display: 'inline-block',
        marginBottom: '0.5rem',
        border: '1px solid var(--primary-color)',
    },
    testTitle: {
        fontSize: '1.125rem',
        fontWeight: '700',
        color: 'var(--text-color)',
        marginBottom: '0.5rem',
    },
    date: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-color)',
        opacity: 0.6,
    },
    stats: {
        display: 'flex',
        alignItems: 'center',
        gap: '2.5rem',
    },
    scoreContainer: {
        textAlign: 'right',
    },
    scoreLabel: {
        fontSize: '0.75rem',
        fontWeight: '600',
        color: 'var(--text-color)',
        opacity: 0.6,
        textTransform: 'uppercase',
        marginBottom: '0.25rem',
    },
    scoreValue: {
        fontSize: '1.5rem',
        fontWeight: '800',
    },
    percentage: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        border: '4px solid var(--nav-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1rem',
        fontWeight: '800',
        color: 'var(--text-color)',
    },
    empty: {
        padding: '5rem 2rem',
        textAlign: 'center',
        background: 'var(--card-bg)',
        borderRadius: '20px',
        border: '2px dashed var(--nav-bg)',
        color: 'var(--text-color)'
    },
    browseBtn: {
        display: 'inline-block',
        marginTop: '1.5rem',
        padding: '0.75rem 1.5rem',
        background: '#3b82f6',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '10px',
        fontWeight: '600',
    },
    loading: { textAlign: 'center', padding: '5rem', color: 'var(--text-color)', opacity: 0.6 }
};

export default TestResults;
