import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, User, FileText, LayoutDashboard, Bell, Award, PlusCircle, MessageSquare, Users, Sun, Moon, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    const authPages = ['/login', '/register', '/forgot-password', '/resetpassword'];
    const isAuthPage = authPages.some(path => location.pathname.startsWith(path));

    const fetchUnreadCount = async () => {
        if (isAuthenticated && user?.role === 'student') {
            try {
                const { data } = await api.get('/notifications');
                const unread = data.data.filter(n => !n.read).length;
                setUnreadCount(unread);
            } catch (err) {
                console.error('Failed to fetch unread count', err);
            }
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated, user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar-custom" style={styles.nav}>
            <div className="navbar-custom-container" style={styles.container}>
                <Link to={user?.role === 'recruiter' ? "/dashboard" : "/"} style={styles.logo}>
                    <div style={styles.logoSymbol}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 19L19 13L13 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5 19L11 13L5 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
                        </svg>
                    </div>
                    PROPEL
                </Link>

                <div style={styles.linksWrapper}>
                    {isAuthenticated && !isAuthPage ? (
                        <>
                            <div style={styles.mainNav}>
                                <Link to="/" className="nav-icon-link" title="Home">
                                    <Home size={20} />
                                </Link>
                                {user?.role === 'student' && (
                                    <>
                                        <Link to="/notifications" className="nav-icon-link" title="Notifications">
                                            <div style={styles.bellWrapper}>
                                                <Bell size={20} />
                                                {unreadCount > 0 && <span style={styles.unreadBadge}>{unreadCount}</span>}
                                            </div>
                                        </Link>
                                        <Link to="/tests" className="nav-icon-link" title="Mock Tests">
                                            <Award size={20} />
                                        </Link>
                                        <Link to="/my-applications" className="nav-icon-link" title="My Applications">
                                            <FileText size={20} />
                                        </Link>
                                    </>
                                )}

                                {user?.role === 'recruiter' && (
                                    <>
                                        <Link to="/tests/new" className="nav-icon-link" title="Add New Test">
                                            <PlusCircle size={20} />
                                        </Link>
                                        <Link to="/dashboard" className="nav-icon-link" title="Recruiter Dashboard">
                                            <LayoutDashboard size={20} />
                                        </Link>
                                    </>
                                )}

                                <Link to="/community" className="nav-icon-link" title="Experience Feed">
                                    <Users size={20} />
                                </Link>
                                <Link to="/chat" className="nav-icon-link" title="Messages">
                                    <MessageSquare size={20} />
                                </Link>
                            </div>

                            <div style={styles.authNav}>
                                <Link to="/profile" className="nav-profile-link" title="My Profile">
                                    <div style={styles.avatarWrapper}>
                                        {user?.profilePicture ? (
                                            <img
                                                src={`${import.meta.env.VITE_API_BASE_URL || ''}${user.profilePicture}`}
                                                alt="Profile"
                                                style={styles.navAvatar}
                                            />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <span style={styles.userName}>{user?.name}</span>
                                </Link>

                                <button
                                    onClick={toggleTheme}
                                    className="nav-theme-btn"
                                    title={theme === 'light' ? 'Dark Theme' : 'Light Theme'}
                                >
                                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                                </button>

                                <button onClick={handleLogout} className="nav-logout-btn" title="Logout">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </>
                    ) : (isAuthPage ? (
                        <div style={styles.authNav}>
                            <button
                                onClick={toggleTheme}
                                className="nav-theme-btn"
                                title={theme === 'light' ? 'Dark Theme' : 'Light Theme'}
                            >
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                        </div>
                    ) : (
                        <div style={styles.authNav}>
                            <button
                                onClick={toggleTheme}
                                className="nav-theme-btn"
                                title={theme === 'light' ? 'Dark Theme' : 'Light Theme'}
                            >
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                            <Link to="/login" className="btn-link">
                                Login
                            </Link>
                            <Link to="/register" className="btn-primary" style={{ borderRadius: '12px' }}>
                                Register
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </nav>
    );
};

const styles = {
    nav: {
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.75rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
    container: {
        maxWidth: '100%',
        margin: '0',
        padding: '0 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minHeight: '48px',
    },
    logo: {
        fontSize: '1.3rem',
        fontWeight: '900',
        color: 'var(--text-color)',
        textDecoration: 'none',
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '0.15em',
        position: 'absolute',
        left: '2.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    logoSymbol: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6366f1',
        background: '#f5f3ff',
        width: '38px',
        height: '38px',
        borderRadius: '12px',
        border: '1px solid #e0e7ff',
    },
    linksWrapper: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainNav: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        background: 'var(--card-bg)',
        padding: '0.4rem 1rem',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        zIndex: 1,
    },

    authNav: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        position: 'absolute',
        right: '2.5rem',
    },
    userName: {
        fontSize: '0.9rem',
        fontWeight: '600',
        maxWidth: '120px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: 'var(--text-color)',
    },
    avatarWrapper: {
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        background: 'var(--input-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
    },
    navAvatar: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    link: {
        textDecoration: 'none',
        color: '#64748b',
        fontWeight: '600',
        fontSize: '0.9rem',
    },
    bellWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    unreadBadge: {
        position: 'absolute',
        top: '-10px',
        right: '-10px',
        background: '#ef4444',
        color: 'white',
        fontSize: '0.65rem',
        fontWeight: '900',
        padding: '2px 5px',
        borderRadius: '8px',
        border: '2px solid white',
    },
};

export default Navbar;
