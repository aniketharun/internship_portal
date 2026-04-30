import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { LayoutList, Users, Award, ChevronRight, Plus } from 'lucide-react';

const ManageTests = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyTests = async () => {
            try {
                const { data } = await api.get('/tests');
                // For simplicity, we filter in frontend, but in real app we'd have a specific endpoint
                setTests(data.data.filter(t => t.type === 'COMPANY_SPECIFIC'));
            } catch (err) {
                console.error('Failed to fetch tests', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyTests();
    }, []);

    if (loading) return <div style={styles.loading}>Loading assessments...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Manage Assessments</h1>
                <Link to="/tests/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <Plus size={18} /> Create New Test
                </Link>
            </div>

            {tests.length === 0 ? (
                <div style={styles.empty}>
                    <LayoutList size={48} color="#cbd5e1" style={{ marginBottom: '1.5rem' }} />
                    <p>You haven't created any company-specific tests yet.</p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {tests.map(test => (
                        <div key={test._id} style={styles.card}>
                            <h3 style={styles.testTitle}>{test.title}</h3>
                            <p style={styles.description}>{test.description}</p>

                            <div style={styles.stats}>
                                <div style={styles.statItem}>
                                    <Users size={16} />
                                    <span>{test.questions.length} Questions</span>
                                </div>
                                <div style={styles.statItem}>
                                    <Award size={16} />
                                    <span>{test.duration} mins</span>
                                </div>
                            </div>

                            <Link to={`/tests/${test._id}/results`} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                                View Results <ChevronRight size={18} />
                            </Link>
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
        margin: '3rem auto',
        padding: '0 1.5rem',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2.5rem',
    },
    title: {
        fontSize: '2rem',
        fontWeight: '800',
        color: 'var(--text-color)',
        margin: 0,
    },
    addBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        borderRadius: '10px',
        background: 'var(--primary-color)',
        color: 'white',
        textDecoration: 'none',
        fontWeight: '600',
        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
    },
    card: {
        background: 'var(--card-bg)',
        padding: '1.5rem',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
    },
    testTitle: {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: 'var(--text-color)',
        marginBottom: '0.5rem',
    },
    description: {
        fontSize: '0.9rem',
        color: 'var(--text-color)',
        opacity: 0.7,
        lineHeight: '1.5',
        marginBottom: '1.5rem',
        flex: 1,
    },
    stats: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
    },
    statItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.8rem',
        color: 'var(--text-color)',
        fontWeight: '600',
        background: 'var(--nav-bg)',
        padding: '0.3rem 0.6rem',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
    },
    viewResultsBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.75rem',
        borderRadius: '8px',
        background: 'var(--primary-color)',
        color: 'white',
        textDecoration: 'none',
        fontWeight: '600',
    },
    empty: {
        padding: '5rem 2rem',
        textAlign: 'center',
        background: 'var(--card-bg)',
        borderRadius: '20px',
        border: '2px dashed var(--border-color)',
        color: 'var(--text-color)',
        opacity: 0.6,
    },
    loading: { textAlign: 'center', padding: '5rem', color: 'var(--text-color)', opacity: 0.7 }
};

export default ManageTests;
