import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Trash2, Save, FileText, LayoutList } from 'lucide-react';

const CreateTest = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const [testData, setTestData] = useState({
        title: '',
        description: '',
        company: '',
        duration: 30,
        questions: [
            { questionText: '', options: ['', '', '', ''], correctOption: 0 }
        ]
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTestData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...testData.questions];
        newQuestions[index][field] = value;
        setTestData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...testData.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setTestData(prev => ({ ...prev, questions: newQuestions }));
    };

    const addQuestion = () => {
        setTestData(prev => ({
            ...prev,
            questions: [...prev.questions, { questionText: '', options: ['', '', '', ''], correctOption: 0 }]
        }));
    };

    const removeQuestion = (index) => {
        if (testData.questions.length === 1) return;
        const newQuestions = testData.questions.filter((_, i) => i !== index);
        setTestData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/tests', testData);
            setMessage({ type: 'success', text: 'Test created successfully!' });
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create test' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Create New Assessment</h1>
                <p style={styles.subtitle}>Design a custom test for students to evaluate their fit for your company.</p>
            </div>

            {message && (
                <div style={{
                    ...styles.alert,
                    backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                    border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}><FileText size={20} /> Basic Information</h2>
                    <div style={styles.grid}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Test Title</label>
                            <input
                                type="text"
                                name="title"
                                value={testData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Frontend Engineering Quiz"
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Company Name (Optional)</label>
                            <input
                                type="text"
                                name="company"
                                value={testData.company}
                                onChange={handleInputChange}
                                placeholder="Leave blank for general mock test"
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Duration (Minutes)</label>
                            <input
                                type="number"
                                name="duration"
                                value={testData.duration}
                                onChange={handleInputChange}
                                style={styles.input}
                                required
                                min="1"
                            />
                        </div>
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            name="description"
                            value={testData.description}
                            onChange={handleInputChange}
                            placeholder="Provide a brief overview of what the test covers..."
                            style={{ ...styles.input, height: '100px', resize: 'vertical' }}
                            required
                        />
                    </div>
                </div>

                <div style={styles.questionsSection}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.cardTitle}><LayoutList size={20} /> Questions</h2>
                        <button type="button" onClick={addQuestion} className="btn-outline-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}>
                            <Plus size={18} /> Add Question
                        </button>
                    </div>

                    {testData.questions.map((q, qIndex) => (
                        <div key={qIndex} style={styles.questionCard}>
                            <div style={styles.qHeader}>
                                <span style={styles.qNumber}>Question {qIndex + 1}</span>
                                <button type="button" onClick={() => removeQuestion(qIndex)} className="btn-danger" style={{ background: 'none', border: 'none', padding: '0.25rem' }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div style={styles.inputGroup}>
                                <textarea
                                    value={q.questionText}
                                    onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                                    placeholder="Enter your question here..."
                                    style={{ ...styles.input, height: '80px', marginBottom: '1.5rem' }}
                                    required
                                />
                            </div>

                            <div style={styles.optionsGrid}>
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} style={styles.optionItem}>
                                        <input
                                            type="radio"
                                            name={`correct-${qIndex}`}
                                            checked={q.correctOption === oIndex}
                                            onChange={() => handleQuestionChange(qIndex, 'correctOption', oIndex)}
                                            style={styles.radio}
                                        />
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                            placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                            style={{ ...styles.input, padding: '0.5rem 0.75rem' }}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                            <p style={styles.helpText}>Select the radio button next to the correct answer.</p>
                        </div>
                    ))}
                </div>

                <div style={styles.formFooter}>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                        {loading ? 'Creating...' : (
                            <><Save size={20} /> Create Assessment</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '900px',
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
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    card: {
        background: 'var(--card-bg)',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid var(--border-color)',
    },
    cardTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '1.25rem',
        fontWeight: '700',
        color: 'var(--text-color)',
        marginBottom: '1.5rem',
        marginTop: 0,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1rem',
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: 'var(--text-color)',
        opacity: 0.8,
    },
    input: {
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        fontSize: '1rem',
        background: 'var(--input-bg)',
        color: 'var(--text-color)',
        transition: 'border-color 0.2s',
        outline: 'none',
    },
    questionsSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1rem',
        borderRadius: '8px',
        background: 'rgba(37, 99, 235, 0.1)',
        color: 'var(--primary-color)',
        border: '1px solid var(--primary-color)',
        fontWeight: '600',
        cursor: 'pointer',
    },
    questionCard: {
        background: 'var(--card-bg)',
        padding: '1.5rem',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        position: 'relative',
    },
    qHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    qNumber: {
        fontSize: '0.9rem',
        fontWeight: '700',
        color: 'var(--primary-color)',
        textTransform: 'uppercase',
    },
    removeBtn: {
        background: 'none',
        border: 'none',
        color: '#ef4444',
        cursor: 'pointer',
        padding: '0.25rem',
    },
    optionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem',
    },
    optionItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    radio: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
    },
    helpText: {
        fontSize: '0.75rem',
        color: 'var(--text-color)',
        opacity: 0.5,
        marginTop: '1rem',
    },
    formFooter: {
        marginTop: '1.5rem',
        marginBottom: '4rem',
    },
    saveBtn: {
        width: '100%',
        padding: '1rem',
        borderRadius: '12px',
        background: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        fontSize: '1.125rem',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
    },
    alert: {
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        textAlign: 'center',
        fontWeight: '600',
    }
};

export default CreateTest;
