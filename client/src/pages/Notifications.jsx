import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Bell, Briefcase, Info, CheckCircle, Clock, Trash2, ArrowRight } from 'lucide-react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/notifications');
            setNotifications(data.data);
            setError(null);
        } catch (err) {
            setError('Failed to load notifications');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'NEW_INTERNSHIP':
                return <Briefcase size={20} color="var(--primary-color)" />;
            case 'APPLICATION_UPDATE':
                return <CheckCircle size={20} color="var(--success)" />;
            default:
                return <Info size={20} color="var(--text-color)" style={{ opacity: 0.6 }} />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    if (loading) return <div style={styles.loading}>Loading notifications...</div>;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div style={styles.container}>
            <style>
                {`
                    .notif-mark-all-btn {
                        background: none;
                        border: none;
                        color: var(--primary-color);
                        font-size: 0.875rem;
                        font-weight: 600;
                        cursor: pointer;
                        padding: 0.5rem;
                        border-radius: 6px;
                        transition: all 0.2s;
                    }
                    .notif-mark-all-btn:hover {
                        background-color: var(--nav-bg);
                        opacity: 0.8;
                    }
                `}
            </style>
            <div style={styles.header}>
                <div style={styles.titleSection}>
                    <h1 style={styles.title}>Notifications</h1>
                    {unreadCount > 0 && (
                        <span style={styles.badge}>{unreadCount} New</span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="notif-mark-all-btn">
                        Mark all as read
                    </button>
                )}
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.list}>
                {notifications.length === 0 ? (
                    <div style={styles.empty}>
                        <Bell size={48} color="var(--text-color)" style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No notifications yet.</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-color)', opacity: 0.6 }}>
                            We'll notify you here when there are updates on your applications or new internships.
                        </p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification._id}
                            style={{
                                ...styles.card,
                                backgroundColor: notification.read ? 'var(--card-bg)' : 'var(--nav-bg)',
                                borderLeft: notification.read ? '4px solid transparent' : '4px solid var(--primary-color)',
                                color: 'var(--text-color)',
                                border: '1px solid var(--border-color)',
                            }}
                        >
                            <div style={styles.iconWrapper}>
                                {getIcon(notification.type)}
                            </div>
                            <div style={styles.content}>
                                <div style={styles.message}>{notification.message}</div>
                                <div style={styles.meta}>
                                    <span style={styles.time}>
                                        <Clock size={12} style={{ marginRight: '4px' }} />
                                        {formatDate(notification.createdAt)}
                                    </span>
                                </div>
                                {notification.link && (
                                    <Link
                                        to={notification.link}
                                        className="btn-link" style={{ padding: '0.25rem 0' }}
                                        onClick={() => markAsRead(notification._id)}
                                    >
                                        View details <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                                    </Link>
                                )}
                            </div>
                            {!notification.read && (
                                <button
                                    onClick={() => markAsRead(notification._id)}
                                    style={styles.readBtn}
                                    title="Mark as read"
                                >
                                    <div style={styles.dot} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '800px',
        margin: '2rem auto',
        padding: '0 1rem',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    titleSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    title: {
        fontSize: '1.875rem',
        fontWeight: '800',
        color: 'var(--text-color)',
        margin: 0,
    },
    badge: {
        background: 'var(--primary-color)',
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '700',
    },
    markAllBtn: {
        // Moved hover to .notif-mark-all-btn
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    card: {
        padding: '1.25rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        gap: '1.25rem',
        transition: 'all 0.2s',
        position: 'relative',
    },
    iconWrapper: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: 'var(--nav-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: '1px solid var(--border-color)',
    },
    content: {
        flex: 1,
    },
    message: {
        fontSize: '0.95rem',
        color: 'var(--text-color)',
        fontWeight: '500',
        lineHeight: '1.5',
        marginBottom: '0.5rem',
    },
    meta: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '0.75rem',
    },
    time: {
        fontSize: '0.75rem',
        color: 'var(--text-color)',
        opacity: 0.6,
        display: 'flex',
        alignItems: 'center',
    },
    actionLink: {
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '0.875rem',
        color: 'var(--primary-color)',
        textDecoration: 'none',
        fontWeight: '600',
    },
    readBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'var(--primary-color)',
    },
    empty: {
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'var(--card-bg)',
        borderRadius: '12px',
        border: '2px dashed var(--nav-bg)',
        color: 'var(--text-color)'
    },
    loading: {
        textAlign: 'center',
        padding: '4rem',
        color: 'var(--text-color)',
        opacity: 0.6,
    },
    error: {
        background: 'rgba(239, 68, 68, 0.1)',
        color: 'var(--error)',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        border: '1px solid var(--error)',
    },
};

export default Notifications;
