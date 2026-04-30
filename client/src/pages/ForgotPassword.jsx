import { useState, useContext } from 'react';
import { Rocket, Cpu, Globe, Zap, Briefcase, Target, Shield, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import TypingHeadline from '../components/TypingHeadline';

const ForgotPassword = () => {
    const [headlineComplete, setHeadlineComplete] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { forgotPassword } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            await forgotPassword(email);
            setMessage('Password reset link sent to your email.');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong.');
        }
    };

    const GoogleIcon = ({ size, style }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );

    const MetaIcon = ({ size, style }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="currentColor">
            <path d="M18.82 5.09c-1.32 0-2.6.59-3.4 1.58-.8-.99-2.08-1.58-3.4-1.58-2.52 0-4.58 2.37-4.58 5.28s2.06 5.28 4.58 5.28c1.32 0 2.6-.59 3.4-1.58l.01.01.01-.01c.8.99 2.08 1.58 3.4 1.58 2.52 0 4.58-2.37 4.58-5.28s-2.06-5.28-4.58-5.28zm-6.8 8.6c-.63.85-1.59 1.4-2.68 1.4-1.93 0-3.5-1.63-3.5-3.64 0-2.01 1.57-3.64 3.5-3.64 1.09 0 2.05.55 2.68 1.4-.43 1-.43 2.14 0 3.14-.01.37-.01.74 0 1.14zm9.48-1.5c0 2.01-1.57 3.64-3.5 3.64-1.09 0-2.05-.55-2.68-1.4.43-1 .43-2.14 0-3.14.63-.85 1.59-1.4 2.68-1.4 1.93 0 3.5 1.63 3.5 3.64z" />
        </svg>
    );

    const BackgroundIcons = () => (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: -1,
            opacity: 0.04
        }}>
            {/* Row 1 */}
            <Cpu size={120} style={{ position: 'absolute', top: '5%', left: '5%', transform: 'rotate(-15deg)' }} />
            <GoogleIcon size={140} style={{ position: 'absolute', top: '15%', left: '60%', transform: 'rotate(10deg)' }} />
            <Briefcase size={100} style={{ position: 'absolute', top: '25%', left: '15%', transform: 'rotate(-20deg)' }} />

            {/* Row 2 */}
            <Globe size={110} style={{ position: 'absolute', top: '40%', left: '40%', transform: 'rotate(5deg)' }} />
            <MetaIcon size={130} style={{ position: 'absolute', top: '45%', left: '-5%', transform: 'rotate(-15deg)' }} />
            <Zap size={90} style={{ position: 'absolute', top: '35%', left: '85%', transform: 'rotate(25deg)' }} />

            {/* Row 3 */}
            <Target size={110} style={{ position: 'absolute', top: '60%', left: '20%', transform: 'rotate(-10deg)' }} />
            <Shield size={140} style={{ position: 'absolute', top: '70%', left: '75%', transform: 'rotate(15deg)' }} />
            <Award size={100} style={{ position: 'absolute', top: '85%', left: '5%', transform: 'rotate(-25deg)' }} />

            {/* Row 4 */}
            <Rocket size={150} style={{ position: 'absolute', top: '80%', left: '45%', transform: 'rotate(10deg)' }} />
            <Cpu size={110} style={{ position: 'absolute', top: '90%', left: '80%', transform: 'rotate(-15deg)' }} />
            <Globe size={130} style={{ position: 'absolute', top: '10%', left: '85%', transform: 'rotate(30deg)' }} />
            <GoogleIcon size={110} style={{ position: 'absolute', top: '65%', left: '-8%', transform: 'rotate(-20deg)' }} />
            <MetaIcon size={120} style={{ position: 'absolute', top: '55%', left: '65%', transform: 'rotate(25deg)' }} />
        </div>
    );

    return (
        <div style={styles.container} className="auth-container">
            <style>
                {`
                    .auth-link {
                        color: var(--text-color);
                        text-decoration: none;
                        font-weight: 500;
                        transition: all 0.2s;
                    }
                    .auth-link:hover {
                        color: var(--secondary-color);
                        text-decoration: underline;
                    }
                    @media (max-width: 968px) {
                        .auth-container {
                            flex-direction: column !important;
                            gap: 2rem !important;
                            height: auto !important;
                            padding: 4rem 1rem !important;
                        }
                        .branding-section, .form-section {
                            flex: none !important;
                            width: 100% !important;
                            min-height: auto !important;
                        }
                        .auth-headline {
                            max-width: 100% !important;
                            text-align: center !important;
                            margin-top: 0 !important;
                        }
                        .auth-divider {
                            display: none !important;
                        }
                    }
                `}
            </style>
            <div style={styles.brandingSection} className="branding-section">
                <BackgroundIcons />
                <div style={styles.headline} className="auth-headline">
                    <div style={styles.logoWrapper}>
                        <div style={styles.logoSymbolLogin}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 19L19 12L13 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 19L11 12L5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                            </svg>
                        </div>
                        <h1 style={styles.logoTextLogin}>PROPEL</h1>
                    </div>
                    <TypingHeadline onComplete={() => setHeadlineComplete(true)} />
                    <p style={{ ...styles.subHeadline, ...(headlineComplete ? styles.subHeadlineVisible : {}) }}>
                        Propel your career to new heights with exclusive opportunities tailored for your growth.
                    </p>
                </div>
                <div style={styles.divider} className="auth-divider"></div>
            </div>

            <div style={styles.formSection} className="form-section">
                <div style={styles.card}>
                    <div style={styles.header}>
                        <h1 style={styles.welcomeTitle}>FORGOT PASSWORD?</h1>
                        <p style={styles.welcomeSubtitle}>No worries! We got you</p>
                        <p style={styles.welcomeSubtitle}>Enter your email to receive a reset link</p>
                    </div>

                    {message && <div style={styles.success}>{message}</div>}
                    {error && <div style={styles.error}>{error}</div>}
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                            Send Reset Link
                        </button>
                    </form>
                    <div style={styles.footer}>
                        <p>
                            Back to <Link to="/login" className="auth-link">Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
};

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        margin: 0,
        padding: 0,
        overflowX: 'hidden',
    },
    brandingSection: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: 'var(--bg-color)',
        overflow: 'hidden',
    },
    formSection: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: 'var(--bg-color)',
    },
    headline: {
        maxWidth: '500px',
        textAlign: 'left',
        marginTop: '-10vh',
        position: 'relative',
        zIndex: 1,
    },
    logoWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2.5rem',
    },
    logoSymbolLogin: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6366f1',
        background: 'rgba(99, 102, 241, 0.1)',
        width: '90px',
        height: '90px',
        borderRadius: '24px',
        border: '1px solid rgba(99, 102, 241, 0.2)',
    },
    logoTextLogin: {
        fontSize: '4.5rem',
        fontWeight: '900',
        color: 'var(--text-color)',
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '0.1em',
    },
    divider: {
        position: 'absolute',
        right: 0,
        top: 0,
        width: '2px',
        height: '100vh',
        background: 'var(--text-color)',
        opacity: 0.15,
        zIndex: 2,
    },
    subHeadline: {
        fontSize: '1.2rem',
        color: 'var(--text-color)',
        opacity: 0,
        lineHeight: '1.6',
        transition: 'all 0.8s ease-out',
        transform: 'translateY(10px)',
    },
    subHeadlineVisible: {
        opacity: 0.7,
        transform: 'translateY(0)',
    },
    card: {
        background: 'var(--card-bg)',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid var(--border-color)',
        zIndex: 1,
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    welcomeTitle: {
        fontSize: '1.75rem',
        fontWeight: '700',
        letterSpacing: '0.05em',
        color: 'var(--text-color)',
        marginBottom: '0.5rem',
        fontFamily: "'Outfit', sans-serif",
    },
    welcomeSubtitle: {
        fontSize: '1rem',
        color: 'var(--text-color)',
        opacity: 0.6,
        fontWeight: '400',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
    },
    input: {
        padding: '0.875rem',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        fontSize: '1rem',
        background: 'var(--input-bg)',
        color: 'var(--text-color)',
        transition: 'border-color 0.2s',
    },
    success: {
        color: 'var(--success)',
        background: 'rgba(34, 197, 94, 0.1)',
        padding: '0.75rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        textAlign: 'center',
        border: '1px solid var(--success)',
    },
    error: {
        color: 'var(--error)',
        background: 'rgba(239, 68, 68, 0.1)',
        padding: '0.75rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        textAlign: 'center',
        border: '1px solid var(--error)',
    },
    footer: {
        marginTop: '2rem',
        textAlign: 'center',
        fontSize: '0.95rem',
        color: 'var(--text-color)',
        opacity: 0.8,
    },
};

export default ForgotPassword;
