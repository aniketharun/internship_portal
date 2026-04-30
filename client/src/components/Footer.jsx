import { Link, useLocation } from 'react-router-dom';
import { Github, Linkedin, Twitter, Mail, ExternalLink, GraduationCap, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
    const { theme } = useTheme();
    const location = useLocation();
    const currentYear = new Date().getFullYear();

    // Pages where the footer should not be shown
    const authPaths = ['/login', '/register', '/forgot-password'];
    const isAuthPage = authPaths.includes(location.pathname) || location.pathname.startsWith('/resetpassword');

    if (isAuthPage) return null;

    return (
        <footer className="footer-custom" style={styles.footer}>
            <div style={styles.container}>
                <div style={styles.grid} className="footer-grid-responsive">
                    {/* Brand Section */}
                    <div style={styles.section}>
                        <Link to="/" style={styles.logo}>
                            <div style={styles.logoSymbol}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13 19L19 13L13 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M5 19L11 13L5 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
                                </svg>
                            </div>
                            PROPEL
                        </Link>
                        <p style={styles.description}>
                            Empowering students to launch their careers through meaningful internships and practical experience.
                        </p>
                        <div style={styles.socialLinks}>
                            <a href="#" style={styles.socialIcon} title="LinkedIn"><Linkedin size={18} /></a>
                            <a href="#" style={styles.socialIcon} title="Twitter"><Twitter size={18} /></a>
                            <a href="#" style={styles.socialIcon} title="GitHub"><Github size={18} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div style={styles.section}>
                        <h4 style={styles.heading}>Platform</h4>
                        <ul style={styles.list}>
                            <li><Link to="/?scrollTo=internships" style={styles.link}><ChevronRight size={14} /> Explore Internships</Link></li>
                            <li><Link to="/community" style={styles.link}><ChevronRight size={14} /> Experience Feed</Link></li>
                            <li><Link to="/tests" style={styles.link}><ChevronRight size={14} /> Mock Tests</Link></li>
                            <li><Link to="/chat" style={styles.link}><ChevronRight size={14} /> Messages</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div style={styles.section}>
                        <h4 style={styles.heading}>Account</h4>
                        <ul style={styles.list}>
                            <li><Link to="/profile" style={styles.link}><ChevronRight size={14} /> My Profile</Link></li>
                            <li><Link to="/my-applications" style={styles.link}><ChevronRight size={14} /> Applications</Link></li>
                            <li><Link to="/notifications" style={styles.link}><ChevronRight size={14} /> Notifications</Link></li>
                            <li><Link to="/login" style={styles.link}><ChevronRight size={14} /> Login / Register</Link></li>
                        </ul>
                    </div>

                    {/* Contact/Newsletter */}
                    <div style={styles.section}>
                        <h4 style={styles.heading}>Stay Connected</h4>
                        <p style={styles.subtext}>Join our community for updates on the latest opportunities.</p>
                        <div style={styles.contactInfo}>
                            <div style={styles.contactItem}>
                                <Mail size={16} />
                                <span>support@propel.io</span>
                            </div>
                            <div style={{ ...styles.contactItem, marginTop: '0.5rem' }}>
                                <GraduationCap size={16} />
                                <span>internship.propel.io</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.bottomBar}>
                    <p>&copy; {currentYear} Propel Internship Portal. All rights reserved.</p>
                    <div style={styles.bottomLinks}>
                        <a href="#" style={styles.bottomLink}>Privacy Policy</a>
                        <a href="#" style={styles.bottomLink}>Terms of Service</a>
                    </div>
                </div>
            </div>

            {/* Scoped Styles for animations & responsiveness */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .footer-custom a {
                    transition: all 0.2s ease;
                }
                .footer-custom a:hover {
                    color: var(--primary-color) !important;
                    transform: translateX(4px);
                }
                @media (max-width: 768px) {
                    .footer-grid-responsive {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 2rem !important;
                    }
                }
                @media (max-width: 480px) {
                    .footer-grid-responsive {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}} />
        </footer>
    );
};

const styles = {
    footer: {
        background: 'var(--card-bg)',
        borderTop: '1px solid var(--border-color)',
        padding: '5rem 0 2rem 0',
        marginTop: '4rem',
        color: 'var(--text-color)',
        width: '100%',
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr',
        gap: '4rem',
        marginBottom: '4rem',
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
    },
    logo: {
        fontSize: '1.3rem',
        fontWeight: '900',
        color: 'var(--text-color)',
        textDecoration: 'none',
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '0.15em',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '0.5rem',
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
    description: {
        fontSize: '0.95rem',
        color: 'var(--text-color)',
        opacity: 0.9,
        lineHeight: '1.6',
    },
    socialLinks: {
        display: 'flex',
        gap: '1rem',
        marginTop: '0.5rem',
    },
    socialIcon: {
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: 'var(--input-bg)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-color)',
        opacity: 0.8,
    },
    heading: {
        fontSize: '1.1rem',
        fontWeight: '700',
        color: 'var(--text-color)',
        marginBottom: '0.5rem',
    },
    list: {
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    link: {
        fontSize: '0.95rem',
        color: 'var(--text-color)',
        opacity: 0.9,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
    },
    subtext: {
        fontSize: '0.9rem',
        color: 'var(--text-color)',
        opacity: 0.85,
        marginBottom: '0.5rem',
    },
    contactInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    contactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.9rem',
        opacity: 1,
    },
    bottomBar: {
        borderTop: '1px solid var(--border-color)',
        paddingTop: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.85rem',
        opacity: 0.85,
        flexWrap: 'wrap',
        gap: '1rem',
    },
    bottomLinks: {
        display: 'flex',
        gap: '2rem',
    },
    bottomLink: {
        textDecoration: 'none',
        color: 'inherit',
    }
};

export default Footer;
