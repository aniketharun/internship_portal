import { useNavigate, useLocation } from 'react-router-dom';
import { FileCheck } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

const ResumeFloatingBtn = ({ isChatOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useContext(AuthContext);

    // Hide on auth pages
    const authPages = ['/login', '/register', '/forgot-password', '/resetpassword'];
    const isAuthPage = authPages.some(path => location.pathname.startsWith(path));

    // Only show for students and hide when chat is open or on auth pages
    if (!isAuthenticated || user?.role !== 'student' || isChatOpen || isAuthPage) return null;

    return (
        <div style={styles.wrapper}>
            <button
                onClick={() => navigate('/resume-checker')}
                style={styles.btn}
                title="Check Resume ATS Score"
                className="resume-floating-btn"
            >
                <div style={styles.pulse}></div>
                <FileCheck size={24} />
                <span style={styles.tooltip}>Resume Score</span>
            </button>

            <style>
                {`
                .resume-floating-btn {
                    width: 56px;
                    height: 56px;
                    border-radius: 28px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    position: relative;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .resume-floating-btn:hover {
                    transform: translateY(-4px) scale(1.05);
                    box-shadow: 0 12px 40px rgba(16, 185, 129, 0.4);
                }

                .resume-floating-btn:hover span {
                    opacity: 1;
                    transform: translateX(-110%);
                }
                `}
            </style>
        </div>
    );
};

const styles = {
    wrapper: {
        position: 'fixed',
        bottom: '7rem', // Exactly above chatbot toggle
        right: '2rem',
        zIndex: 1000,
    },
    pulse: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        border: '2px solid #10b981',
        animation: 'resume-pulse 2s infinite',
        opacity: 0,
    },
    tooltip: {
        position: 'absolute',
        right: '0',
        background: 'var(--card-bg)',
        color: 'var(--text-color)',
        padding: '0.4rem 0.8rem',
        borderRadius: '8px',
        fontSize: '0.75rem',
        fontWeight: '700',
        whiteSpace: 'nowrap',
        opacity: 0,
        pointerEvents: 'none',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid var(--border-color)',
        transform: 'translateX(-90%)',
    }
};

// Global keyframe handled in ResumeChecker or App
const injectStyles = () => {
    if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes resume-pulse {
                0% { transform: scale(1); opacity: 0.5; }
                100% { transform: scale(1.5); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
};
injectStyles();

export default ResumeFloatingBtn;
