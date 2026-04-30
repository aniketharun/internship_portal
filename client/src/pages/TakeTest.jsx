import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle } from 'lucide-react';

const TakeTest = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]); // { questionId, selectedOption }
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testStarted, setTestStarted] = useState(false);

    const fetchTest = useCallback(async () => {
        try {
            const { data } = await api.get(`/tests/${id}`);
            setTest(data.data);
            setTimeLeft(data.data.duration * 60);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load test');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchTest();
    }, [fetchTest]);

    const submitTest = useCallback(async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await api.post(`/tests/${id}/submit`, { answers });
            navigate('/tests/results'); // Redirect to a results list or specific result
        } catch (err) {
            console.error('Submission failed', err);
            alert('Failed to submit test. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [id, answers, navigate, isSubmitting]);

    useEffect(() => {
        if (!testStarted || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    submitTest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [testStarted, timeLeft, submitTest]);

    const handleOptionSelect = (optionIndex) => {
        const questionId = test.questions[currentQuestionIndex]._id;
        setAnswers(prev => {
            const existing = prev.find(a => a.questionId === questionId);
            if (existing) {
                return prev.map(a => a.questionId === questionId ? { ...a, selectedOption: optionIndex } : a);
            }
            return [...prev, { questionId, selectedOption: optionIndex }];
        });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return <div style={styles.loading}>Loading assessment...</div>;
    if (error) return <div style={styles.error}>{error}</div>;

    if (!testStarted) {
        return (
            <div style={styles.instructionsContainer}>
                <h1 style={styles.title}>{test.title}</h1>
                <div style={styles.instructionCard}>
                    <h2 style={styles.subTitle}>Instructions</h2>
                    <ul style={styles.ul}>
                        <li>Duration: <strong>{test.duration} minutes</strong></li>
                        <li>Total Questions: <strong>{test.questions.length}</strong></li>
                        <li>The timer will start as soon as you click "Start Test".</li>
                        <li>Your progress is not saved if you refresh the page.</li>
                        <li>The test will auto-submit when the timer hits zero.</li>
                    </ul>
                    <button onClick={() => setTestStarted(true)} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}>
                        Start Test Now
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = test.questions[currentQuestionIndex];
    const selectedOption = answers.find(a => a.questionId === currentQuestion._id)?.selectedOption;

    return (
        <div style={styles.testPage}>
            <div style={styles.header}>
                <div style={styles.headerTitle}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{test.title}</h2>
                    <span style={styles.questionCount}>Question {currentQuestionIndex + 1} of {test.questions.length}</span>
                </div>
                <div style={{ ...styles.timer, color: timeLeft < 60 ? 'var(--error)' : 'var(--text-color)' }}>
                    <Clock size={20} />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            </div>

            <div style={styles.mainContent}>
                <div style={styles.questionCard}>
                    <h3 style={styles.questionText}>{currentQuestion.questionText}</h3>
                    <div style={styles.optionsList}>
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleOptionSelect(index)}
                                style={{
                                    ...styles.optionBtn,
                                    borderColor: selectedOption === index ? 'var(--primary-color)' : 'var(--border-color)',
                                    backgroundColor: selectedOption === index ? 'var(--input-bg)' : 'var(--card-bg)',
                                    color: selectedOption === index ? 'var(--primary-color)' : 'var(--text-color)'
                                }}
                            >
                                <span style={{
                                    ...styles.optionLabel,
                                    backgroundColor: selectedOption === index ? 'var(--primary-color)' : 'var(--nav-bg)',
                                    color: selectedOption === index ? 'white' : 'var(--text-color)'
                                }}>
                                    {String.fromCharCode(65 + index)}
                                </span>
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={styles.navigation}>
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        disabled={currentQuestionIndex === 0}
                        style={{ ...styles.navBtn, opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
                    >
                        <ChevronLeft size={20} /> Previous
                    </button>

                    {currentQuestionIndex === test.questions.length - 1 ? (
                        <button onClick={submitTest} disabled={isSubmitting} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem' }}>
                            {isSubmitting ? 'Submitting...' : 'Submit Assessment'} <Send size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            style={styles.navBtn}
                        >
                            Next <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </div>

            <div style={styles.sidebar}>
                <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Progress</h4>
                <div style={styles.questionGrid}>
                    {test.questions.map((_, index) => {
                        const isAnswered = answers.find(a => a.questionId === test.questions[index]._id);
                        return (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestionIndex(index)}
                                style={{
                                    ...styles.gridItem,
                                    background: currentQuestionIndex === index ? 'var(--text-color)' : isAnswered ? 'var(--primary-color)' : 'var(--card-bg)',
                                    color: (currentQuestionIndex === index || isAnswered) ? 'var(--card-bg)' : 'var(--text-color)',
                                    borderColor: currentQuestionIndex === index ? 'var(--text-color)' : isAnswered ? 'var(--primary-color)' : 'var(--border-color)'
                                }}
                            >
                                {index + 1}
                            </button>
                        );
                    })}
                </div>
                <div style={styles.legend}>
                    <div style={styles.legendItem}><div style={{ ...styles.dot, background: 'var(--text-color)' }}></div> Current</div>
                    <div style={styles.legendItem}><div style={{ ...styles.dot, background: 'var(--primary-color)' }}></div> Answered</div>
                    <div style={styles.legendItem}><div style={{ ...styles.dot, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}></div> Unanswered</div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    testPage: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '2rem',
    },
    header: {
        gridColumn: '1 / -1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 2rem',
        background: 'var(--card-bg)',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '1rem',
        border: '1px solid var(--border-color)',
    },
    headerTitle: {
        display: 'flex',
        flexDirection: 'column',
    },
    questionCount: {
        fontSize: '0.875rem',
        color: 'var(--text-color)',
        opacity: 0.7,
        fontWeight: '500',
    },
    timer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '1.25rem',
        fontWeight: '700',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        backgroundColor: 'var(--nav-bg)',
        color: 'var(--text-color)',
        border: '1px solid var(--border-color)',
    },
    mainContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    questionCard: {
        background: 'var(--card-bg)',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        border: '1px solid var(--border-color)',
    },
    questionText: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--text-color)',
        lineHeight: '1.6',
        marginBottom: '2rem',
    },
    optionsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    optionBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.25rem',
        borderRadius: '12px',
        border: '2px solid',
        textAlign: 'left',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    optionLabel: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.875rem',
        fontWeight: '700',
        flexShrink: 0,
    },
    navigation: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    navBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        borderRadius: '10px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-color)',
        fontWeight: '600',
        cursor: 'pointer',
    },
    submitBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1.5rem',
        borderRadius: '10px',
        background: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
    },
    sidebar: {
        background: 'var(--card-bg)',
        padding: '1.5rem',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        height: 'fit-content',
        border: '1px solid var(--border-color)',
        color: 'var(--text-color)',
    },
    questionGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '0.75rem',
        marginBottom: '1.5rem',
    },
    gridItem: {
        aspectRatio: '1 / 1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        border: '1px solid',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer',
    },
    legend: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-color)',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.75rem',
        color: 'var(--text-color)',
        opacity: 0.7,
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
    },
    instructionsContainer: {
        maxWidth: '700px',
        margin: '4rem auto',
        padding: '0 1.5rem',
        textAlign: 'center',
    },
    title: {
        fontSize: '2rem',
        fontWeight: '800',
        color: 'var(--text-color)',
        marginBottom: '2rem',
    },
    instructionCard: {
        background: 'var(--card-bg)',
        padding: '2.5rem',
        borderRadius: '20px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
        textAlign: 'left',
        border: '1px solid var(--border-color)',
        color: 'var(--text-color)',
    },
    subTitle: {
        fontSize: '1.25rem',
        fontWeight: '700',
        marginBottom: '1.25rem',
    },
    ul: {
        paddingLeft: '1.5rem',
        marginBottom: '2.5rem',
        color: 'var(--text-color)',
        opacity: 0.8,
        fontSize: '1rem',
        lineHeight: '2',
    },
    startBtn: {
        width: '100%',
        padding: '1rem',
        borderRadius: '12px',
        background: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        fontSize: '1.125rem',
        fontWeight: '700',
        cursor: 'pointer',
    },
    loading: { textAlign: 'center', padding: '5rem', color: 'var(--text-color)', opacity: 0.7 },
    error: { textAlign: 'center', padding: '5rem', color: '#ef4444', fontWeight: 'bold' }
};

export default TakeTest;
