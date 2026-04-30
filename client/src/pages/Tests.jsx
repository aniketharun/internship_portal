import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Briefcase, BookOpen, Clock, ChevronRight, Award, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const Tests = () => {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);

    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, MOCK, COMPANY_SPECIFIC

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const { data } = await api.get('/tests');
                setTests(data.data);
            } catch (err) {
                console.error('Failed to fetch tests', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, []);

    const filteredTests = tests.filter(test => {
        if (filter === 'ALL') return true;
        return test.type === filter;
    });

    if (loading) return <div style={styles.loading}>Loading tests...</div>;

    return (
        <div style={styles.container}>
            <style>
                {`
                    .tests-card {
                        background: var(--card-bg);
                        border-radius: 16px;
                        padding: 1.75rem;
                        border: 1px solid var(--nav-bg);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                        display: flex;
                        flex-direction: column;
                        transition: transform 0.2s, box-shadow 0.2s;
                        cursor: default;
                    }
                    .tests-card:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 12px 20px -8px rgba(0,0,0,0.08);
                        border-color: var(--primary-color);
                    }
                `}
            </style>
            <button onClick={() => navigate('/')} style={styles.backBtn}>
                <ArrowLeft size={20} /> Back to Home
            </button>
            <div style={styles.header}>
                <h1 style={styles.title}>Practice & Assessments</h1>
                <p style={styles.subtitle}>Prepared for your dream company or sharpen your skills with general mock tests.</p>
                <Link to="/tests/results" className="btn-outline-primary">
                    <Award size={18} /> View My Results
                </Link>
            </div>

            <div style={styles.filterBar}>
                <button
                    onClick={() => setFilter('ALL')}
                    style={{ ...styles.filterBtn, ...(filter === 'ALL' ? styles.activeFilter : {}) }}
                >
                    All Tests
                </button>
                <button
                    onClick={() => setFilter('MOCK')}
                    style={{ ...styles.filterBtn, ...(filter === 'MOCK' ? styles.activeFilter : {}) }}
                >
                    Mock Tests
                </button>
                <button
                    onClick={() => setFilter('COMPANY_SPECIFIC')}
                    style={{ ...styles.filterBtn, ...(filter === 'COMPANY_SPECIFIC' ? styles.activeFilter : {}) }}
                >
                    Company Specific
                </button>
            </div>

            <div style={styles.grid}>
                {filteredTests.length === 0 ? (
                    <div style={styles.empty}>No tests found for the selected category.</div>
                ) : (
                    filteredTests.map(test => (
                        <div key={test._id} className="tests-card">
                            <div style={styles.cardHeader}>
                                {test.type === 'COMPANY_SPECIFIC' ? (
                                    <div style={styles.companyBadge}>
                                        <Briefcase size={14} style={{ marginRight: '4px' }} />
                                        {test.company}
                                    </div>
                                ) : (
                                    <div style={styles.mockBadge}>
                                        <BookOpen size={14} style={{ marginRight: '4px' }} />
                                        MOCK TEST
                                    </div>
                                )}
                            </div>
                            <h3 style={styles.testTitle}>{test.title}</h3>
                            <p style={styles.description}>{test.description}</p>

                            <div style={styles.meta}>
                                <div style={styles.metaItem}>
                                    <Clock size={16} color="var(--text-color)" style={{ opacity: 0.6 }} />
                                    <span>{test.duration} mins</span>
                                </div>
                                <div style={styles.metaItem}>
                                    <Award size={16} color="var(--text-color)" style={{ opacity: 0.6 }} />
                                    <span>{test.questions.length} Questions</span>
                                </div>
                            </div>

                            <Link to={`/tests/${test._id}`} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                                Start Test <ChevronRight size={18} />
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '5rem 1.5rem 2.5rem 1.5rem',
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
        padding: 0,
        zIndex: 10,
    },
    header: {
        marginBottom: '2.5rem',
        textAlign: 'center',
    },
    title: {
        fontSize: '2.25rem',
        fontWeight: '800',
        color: 'var(--text-color)',
        marginBottom: '0.75rem',
        letterSpacing: '-0.025em',
    },
    subtitle: {
        fontSize: '1.125rem',
        color: 'var(--text-color)',
        maxWidth: '600px',
        margin: '0 auto 1.5rem auto',
        opacity: 0.7,
    },
    filterBar: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '3rem',
    },
    filterBtn: {
        padding: '0.625rem 1.25rem',
        borderRadius: '9999px',
        border: '1px solid var(--border-color)',
        background: 'var(--card-bg)',
        color: 'var(--text-color)',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        opacity: 0.7,
    },
    activeFilter: {
        background: 'var(--primary-color)',
        color: 'white',
        borderColor: 'var(--primary-color)',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
        opacity: 1,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '2rem',
    },
    cardHeader: {
        marginBottom: '1.25rem',
        display: 'flex',
    },
    companyBadge: {
        padding: '0.35rem 0.85rem',
        borderRadius: '8px',
        background: 'rgba(37, 99, 235, 0.1)',
        color: 'var(--primary-color)',
        fontSize: '0.75rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        border: '1px solid var(--primary-color)',
    },
    mockBadge: {
        padding: '0.35rem 0.85rem',
        borderRadius: '8px',
        background: 'rgba(16, 185, 129, 0.1)',
        color: 'var(--success)',
        fontSize: '0.75rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        border: '1px solid var(--success)',
    },
    testTitle: {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: 'var(--text-color)',
        marginBottom: '0.75rem',
    },
    description: {
        fontSize: '0.925rem',
        color: 'var(--text-color)',
        lineHeight: '1.6',
        marginBottom: '1.75rem',
        flex: 1,
        opacity: 0.7,
    },
    meta: {
        display: 'flex',
        gap: '1.5rem',
        marginBottom: '1.75rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--border-color)',
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: 'var(--text-color)',
        opacity: 0.8,
        fontWeight: '500',
    },
    startBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.875rem',
        borderRadius: '10px',
        background: '#1e293b',
        color: 'white',
        textDecoration: 'none',
        fontWeight: '600',
        transition: 'background 0.2s',
    },
    loading: {
        textAlign: 'center',
        padding: '5rem',
        fontSize: '1.125rem',
        color: 'var(--text-color)',
        opacity: 0.7,
    },
    empty: {
        gridColumn: '1 / -1',
        textAlign: 'center',
        padding: '4rem',
        background: 'var(--card-bg)',
        borderRadius: '16px',
        color: 'var(--text-color)',
        opacity: 0.7,
        border: '2px dashed var(--border-color)',
    }
};

export default Tests;
