import { useState, useEffect, useRef, useContext } from 'react';
import { Upload, FileCheck, CheckCircle, AlertCircle, TrendingUp, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';
import AuthContext from '../contexts/AuthContext';
import TypingHeadline from '../components/TypingHeadline';

const ResumeChecker = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [displayScore, setDisplayScore] = useState(0);
    const [internships, setInternships] = useState([]);
    const [selectedInternship, setSelectedInternship] = useState('');

    useEffect(() => {
        const fetchInternships = async () => {
            try {
                const { data } = await api.get('/internships');
                setInternships(data.data);
            } catch (err) {
                console.error('Failed to fetch internships:', err);
            }
        };
        fetchInternships();
    }, []);

    // Animate score counting up from 0
    useEffect(() => {
        if (!result) {
            setDisplayScore(0);
            return;
        }
        const target = result.score;
        const duration = 1500;
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayScore(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [result]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('resume', file);
        if (selectedInternship) {
            formData.append('internshipId', selectedInternship);
        }

        try {
            const { data } = await api.post('/students/resume-strength', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to analyze resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <button onClick={() => navigate('/')} style={styles.backBtn}>
                <ArrowLeft size={20} /> Back to Home
            </button>
            <div style={styles.header}>
                <TypingHeadline
                    text="How Strong is Your Resume?"
                    className="auth-headline"
                    style={styles.headline}
                />
                <p style={styles.subText}>Find out your ATS score and get instant tips to improve your job prospects.</p>
            </div>

            {!result ? (
                <div style={styles.uploadCard}>
                    <div style={styles.selectWrapper}>
                        <label style={styles.selectLabel}>Match against a specific role:</label>
                        <select
                            value={selectedInternship}
                            onChange={(e) => setSelectedInternship(e.target.value)}
                            style={styles.select}
                        >
                            <option value="">General Score (All Roles)</option>
                            {internships.map(internship => (
                                <option key={internship._id} value={internship._id}>
                                    {internship.title} at {internship.company}
                                </option>
                            ))}
                        </select>
                    </div>

                    <form
                        onDragEnter={handleDrag}
                        onSubmit={handleSubmit}
                        style={{ ...styles.dropZone, ...(dragActive ? styles.dropZoneActive : {}) }}
                    >
                        <input
                            type="file"
                            id="resume-upload"
                            style={styles.fileHidden}
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx"
                        />
                        <label htmlFor="resume-upload" style={styles.label}>
                            <div style={styles.iconCircle}>
                                <Upload size={32} color="var(--primary-color)" />
                            </div>
                            <h3>{file ? file.name : "Click to upload or drag & drop"}</h3>
                            <p>Support PDF, DOCX (Max 5MB)</p>
                        </label>

                        {error && <div style={styles.error}>{error}</div>}

                        <button
                            type="submit"
                            disabled={!file || loading}
                            style={{ ...styles.submitBtn, opacity: (!file || loading) ? 0.6 : 1 }}
                        >
                            {loading ? "Analyzing..." : "Calculate ATS Score"}
                            {!loading && <Sparkles size={18} style={{ marginLeft: '8px' }} />}
                        </button>
                    </form>
                </div>
            ) : (
                <div style={styles.resultView}>
                    <div style={styles.scoreSection}>
                        <div style={styles.scoreCircle}>
                            <svg viewBox="0 0 36 36" style={styles.svg}>
                                <path
                                    style={styles.bgCircle}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="score-circle-fill"
                                    style={{
                                        ...styles.scorePath,
                                        strokeDasharray: `${result.score}, 100`,
                                        '--target-score': result.score
                                    }}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <div style={styles.scoreContent}>
                                <span style={styles.scoreNum}>{displayScore}</span>
                                <span style={styles.scoreLabel}>ATS SCORE</span>
                            </div>
                        </div>

                        <div style={styles.statsGrid}>
                            <div style={styles.statCard}>
                                <TrendingUp size={20} color="#10b981" />
                                <div>
                                    <h4>{result.isJobSpecific ? 'Job Match' : 'Rank'}</h4>
                                    <p>{result.score > 80 ? 'Excellent' : result.score > 60 ? 'Good' : 'Needs Improvement'}</p>
                                </div>
                            </div>
                            <div style={styles.statCard}>
                                <CheckCircle size={20} color="#3b82f6" />
                                <div>
                                    <h4>Skills</h4>
                                    <p>{result.matchedSkills.length} Identified</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.feedbackSection}>
                        <h3 style={styles.feedbackTitle}>Analysis Feedback</h3>
                        <div style={styles.feedbackGrid}>
                            {result.feedback.map((tip, i) => (
                                <div key={i} style={styles.tipCard}>
                                    <AlertCircle size={20} color="var(--primary-color)" style={{ flexShrink: 0 }} />
                                    <p>{tip}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setResult(null)} style={styles.resetBtn}>
                            Analyze Another Resume
                        </button>
                    </div>
                </div>
            )}

            {/* Score circle animation styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes circleGrow {
                    from { stroke-dasharray: 0, 100; }
                }
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .score-circle-fill {
                    animation: circleGrow 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
            `}} />
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '5rem 2rem 2rem 2rem',
        minHeight: '80vh',
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
        textAlign: 'center',
        marginBottom: '3rem',
    },
    headline: {
        fontSize: '3rem',
        fontWeight: '900',
        marginBottom: '1rem',
    },
    subText: {
        fontSize: '1.2rem',
        color: 'var(--text-color)',
        opacity: 0.7,
        maxWidth: '600px',
        margin: '0 auto',
    },
    selectWrapper: {
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    selectLabel: {
        fontSize: '0.95rem',
        fontWeight: '600',
        color: 'var(--text-color)',
    },
    select: {
        padding: '0.8rem 1rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        background: 'var(--input-bg)',
        color: 'var(--text-color)',
        fontSize: '1rem',
        outline: 'none',
        fontFamily: 'inherit',
        cursor: 'pointer',
    },
    uploadCard: {
        background: 'var(--card-bg)',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
        border: '1px solid var(--border-color)',
        maxWidth: '600px',
        margin: '0 auto',
    },
    dropZone: {
        border: '2px dashed var(--border-color)',
        borderRadius: '20px',
        padding: '3rem 2rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    dropZoneActive: {
        borderColor: 'var(--primary-color)',
        background: 'rgba(37, 99, 235, 0.05)',
        transform: 'scale(1.02)',
    },
    fileHidden: {
        display: 'none',
    },
    label: {
        cursor: 'pointer',
        width: '100%',
    },
    iconCircle: {
        width: '64px',
        height: '64px',
        borderRadius: '32px',
        background: 'rgba(37, 99, 235, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem',
    },
    error: {
        color: '#ef4444',
        fontSize: '0.9rem',
        marginTop: '1rem',
        fontWeight: '600',
    },
    submitBtn: {
        marginTop: '2rem',
        background: 'var(--primary-color)',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '12px',
        border: 'none',
        fontWeight: '700',
        fontSize: '1rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.3s ease',
    },
    resultView: {
        display: 'grid',
        gridTemplateColumns: '1fr 1.5fr',
        gap: '3rem',
        animation: 'fadeSlideUp 0.6s ease-out',
        '@media (max-width: 800px)': {
            gridTemplateColumns: '1fr',
        }
    },
    scoreSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
    },
    scoreCircle: {
        width: '240px',
        height: '240px',
        position: 'relative',
    },
    svg: {
        transform: 'rotate(-90deg)',
    },
    bgCircle: {
        fill: 'none',
        stroke: 'var(--border-color)',
        strokeWidth: '2.8',
    },
    scorePath: {
        fill: 'none',
        stroke: '#10b981',
        strokeWidth: '2.8',
        strokeLinecap: 'round',
        transition: 'stroke-dasharray 1.5s ease-in-out',
    },
    scoreContent: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
    },
    scoreNum: {
        display: 'block',
        fontSize: '4rem',
        fontWeight: '900',
        color: 'var(--text-color)',
        lineHeight: '1',
    },
    scoreLabel: {
        fontSize: '0.9rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        opacity: 0.6,
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        width: '100%',
    },
    statCard: {
        background: 'var(--card-bg)',
        padding: '1rem',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        border: '1px solid var(--border-color)',
    },
    feedbackSection: {
        background: 'var(--card-bg)',
        borderRadius: '24px',
        padding: '2.5rem',
        border: '1px solid var(--border-color)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.03)',
    },
    feedbackTitle: {
        fontSize: '1.5rem',
        marginBottom: '1.5rem',
        fontWeight: '800',
    },
    feedbackGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    tipCard: {
        padding: '1.25rem',
        borderRadius: '16px',
        background: 'var(--background-color)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        border: '1px solid var(--border-color)',
        transition: 'all 0.3s ease',
    },
    resetBtn: {
        marginTop: '2rem',
        background: 'none',
        border: 'none',
        color: 'var(--primary-color)',
        fontWeight: '700',
        cursor: 'pointer',
        fontSize: '1rem',
        textDecoration: 'underline',
    }
};

export default ResumeChecker;
