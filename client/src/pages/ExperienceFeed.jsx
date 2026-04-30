import { useState, useEffect, useContext } from 'react';
import {
    MessageCircle,
    ThumbsUp,
    Send,
    Plus,
    Filter,
    User as UserIcon,
    ShieldCheck,
    Award,
    Clock,
    Tag,
    X
} from 'lucide-react';
import api from '../services/api';
import AuthContext from '../contexts/AuthContext';

const ExperienceFeed = () => {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'Interview Tips'
    });
    const [commentText, setCommentText] = useState({});
    const [showComments, setShowComments] = useState({});

    const categories = ['All', 'Interview Tips', 'Networking', 'Technical', 'General', 'Testimonial'];

    useEffect(() => {
        fetchPosts();
    }, [category]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/posts?category=${category}`);
            setPosts(data.data);
        } catch (err) {
            console.error('Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            await api.post('/posts', formData);
            setFormData({ title: '', content: '', category: 'Interview Tips' });
            setShowModal(false);
            fetchPosts();
        } catch (err) {
            alert('Failed to create post');
        }
    };

    const handleLike = async (postId) => {
        try {
            const { data } = await api.put(`/posts/${postId}/like`);
            setPosts(posts.map(post =>
                post._id === postId ? { ...post, likes: data.data } : post
            ));
        } catch (err) {
            console.error('Failed to like post');
        }
    };

    const handleAddComment = async (e, postId) => {
        e.preventDefault();
        const text = commentText[postId];
        if (!text?.trim()) return;

        try {
            const { data } = await api.post(`/posts/${postId}/comment`, { text });
            setPosts(posts.map(post =>
                post._id === postId ? { ...post, comments: data.data } : post
            ));
            setCommentText({ ...commentText, [postId]: '' });
        } catch (err) {
            alert('Failed to add comment');
        }
    };

    if (loading && posts.length === 0) return <div style={styles.loading}>Loading community feed...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Community Experience Feed</h1>
                    <p style={styles.subtitle}>Insights and tips from fellow students</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} /> Share Experience
                </button>
            </div>

            <div style={styles.filterBar}>
                <div style={styles.filterLabel}><Filter size={16} /> Filter by:</div>
                <div style={styles.tagGrid}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            style={{
                                ...styles.tag,
                                backgroundColor: category === cat ? 'var(--primary-color)' : 'var(--nav-bg)',
                                color: category === cat ? 'white' : 'var(--text-color)'
                            }}
                            onClick={() => setCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div style={styles.feed}>
                {posts.length === 0 ? (
                    <div style={styles.empty}>
                        <MessageCircle size={64} color="var(--border-color)" />
                        <h2>No experiences shared yet in this category</h2>
                        <p>Be the first to help others by sharing your journey!</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post._id} style={styles.postCard}>
                            <div style={styles.postHeader}>
                                <div style={styles.authorSection}>
                                    <div style={styles.avatar}>
                                        <UserIcon size={24} color="var(--text-color)" style={{ opacity: 0.5 }} />
                                    </div>
                                    <div>
                                        <h4 style={styles.authorName}>{post.author?.name}</h4>
                                        <div style={styles.postMeta}>
                                            <Tag size={12} /> {post.category} • <Clock size={12} /> {new Date(post.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                {post.author?._id === user._id && (
                                    <span style={styles.myPostBadge}>Your Post</span>
                                )}
                            </div>

                            <div style={styles.postContent}>
                                <h2 style={styles.postTitle}>{post.title}</h2>
                                <p style={styles.postText}>{post.content}</p>
                            </div>

                            <div style={styles.postActions}>
                                <button
                                    style={{
                                        ...styles.actionBtn,
                                        color: post.likes.includes(user._id) ? 'var(--primary-color)' : 'var(--text-color)'
                                    }}
                                    onClick={() => handleLike(post._id)}
                                >
                                    <ThumbsUp size={18} fill={post.likes.includes(user._id) ? 'currentColor' : 'none'} />
                                    {post.likes.length} Likes
                                </button>
                                <button
                                    style={styles.actionBtn}
                                    onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })}
                                >
                                    <MessageCircle size={18} />
                                    {post.comments.length} Comments
                                </button>
                            </div>

                            {showComments[post._id] && (
                                <div style={styles.commentSection}>
                                    <form style={styles.commentForm} onSubmit={(e) => handleAddComment(e, post._id)}>
                                        <input
                                            type="text"
                                            placeholder="Write a comment..."
                                            style={styles.commentInput}
                                            value={commentText[post._id] || ''}
                                            onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                                        />
                                        <button type="submit" className="btn-primary" style={{ width: '40px', height: '40px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}><Send size={16} /></button>
                                    </form>

                                    <div style={styles.commentList}>
                                        {post.comments.map((comment, idx) => (
                                            <div key={idx} style={styles.commentItem}>
                                                <div style={styles.miniAvatar}>
                                                    <UserIcon size={12} />
                                                </div>
                                                <div style={styles.commentBubble}>
                                                    <div style={styles.commentUser}>{comment.user?.name}</div>
                                                    <p style={styles.commentText}>{comment.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Create Post Modal */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2>Share Your Experience</h2>
                            <button style={styles.closeBtn} onClick={() => setShowModal(false)}><X /></button>
                        </div>
                        <form onSubmit={handleCreatePost} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. My Product Intern Interview Journey"
                                    style={styles.input}
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Category</label>
                                <select
                                    style={styles.select}
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.slice(1).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Share your thoughts/tips</label>
                                <textarea
                                    required
                                    rows="6"
                                    placeholder="Describe your experience, the questions asked, and any tips for others..."
                                    style={styles.textarea}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Post to Community</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '900px',
        margin: '2rem auto',
        padding: '0 1.5rem',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    title: {
        fontSize: '2.25rem',
        fontWeight: '800',
        color: 'var(--text-color)',
        letterSpacing: '-0.02em',
    },
    subtitle: {
        color: 'var(--text-color)',
        opacity: 0.6,
        fontSize: '1.1rem',
    },
    createBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        padding: '0.85rem 1.5rem',
        borderRadius: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)',
        transition: 'transform 0.2s',
    },
    filterBar: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid var(--nav-bg)',
    },
    filterLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: '700',
        color: '#475569',
        fontSize: '0.9rem',
        whiteSpace: 'nowrap',
    },
    tagGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
    },
    tag: {
        padding: '0.4rem 1rem',
        borderRadius: '100px',
        border: 'none',
        fontWeight: '600',
        fontSize: '0.85rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    feed: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    postCard: {
        backgroundColor: 'var(--card-bg)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        border: '1px solid var(--nav-bg)',
    },
    postHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1.5rem',
    },
    authorSection: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
    },
    avatar: {
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        backgroundColor: 'var(--nav-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    authorName: {
        fontWeight: '700',
        color: 'var(--text-color)',
        fontSize: '1rem',
        marginBottom: '0.1rem',
    },
    postMeta: {
        fontSize: '0.8rem',
        color: 'var(--text-color)',
        opacity: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
    },
    myPostBadge: {
        fontSize: '0.7rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        backgroundColor: 'rgba(219, 39, 119, 0.1)',
        color: '#db2777',
        padding: '0.25rem 0.6rem',
        borderRadius: '4px',
        border: '1px solid #db2777',
    },
    postTitle: {
        fontSize: '1.5rem',
        fontWeight: '800',
        color: 'var(--text-color)',
        marginBottom: '1rem',
        lineHeight: '1.3',
    },
    postText: {
        color: 'var(--text-color)',
        opacity: 0.8,
        lineHeight: '1.7',
        fontSize: '1.05rem',
        whiteSpace: 'pre-line',
    },
    postActions: {
        display: 'flex',
        gap: '2rem',
        borderTop: '1px solid var(--border-color)',
        marginTop: '1.5rem',
        paddingTop: '1rem',
    },
    actionBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'none',
        border: 'none',
        fontWeight: '600',
        fontSize: '0.95rem',
        cursor: 'pointer',
        padding: '0.5rem 0.75rem',
        borderRadius: '8px',
        transition: 'background 0.2s',
    },
    commentSection: {
        marginTop: '1.5rem',
        paddingTop: '1rem',
        backgroundColor: 'var(--nav-bg)',
        borderRadius: '16px',
        padding: '1rem',
    },
    commentForm: {
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
    },
    commentInput: {
        flex: 1,
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--nav-bg)',
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        outline: 'none',
        fontSize: '0.9rem',
        color: 'var(--text-color)'
    },
    commentSend: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    commentList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    commentItem: {
        display: 'flex',
        gap: '0.75rem',
    },
    miniAvatar: {
        width: '24px',
        height: '24px',
        borderRadius: '6px',
        backgroundColor: 'var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    commentBubble: {
        backgroundColor: 'var(--card-bg)',
        padding: '0.75rem 1rem',
        borderRadius: '0 12px 12px 12px',
        border: '1px solid var(--nav-bg)',
    },
    commentUser: {
        fontWeight: '700',
        fontSize: '0.8rem',
        color: 'var(--text-color)',
        marginBottom: '0.2rem',
    },
    loading: {
        textAlign: 'center',
        padding: '5rem',
        fontSize: '1.2rem',
        color: 'var(--text-color)',
        opacity: 0.6,
    },
    empty: {
        textAlign: 'center',
        padding: '5rem',
        background: 'var(--card-bg)',
        borderRadius: '24px',
        color: 'var(--text-color)',
        opacity: 0.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        border: '2px dashed var(--nav-bg)',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
    },
    modal: {
        backgroundColor: 'var(--card-bg)',
        width: '100%',
        maxWidth: '600px',
        borderRadius: '24px',
        padding: '2rem',
        maxHeight: '90vh',
        overflowY: 'auto',
        color: 'var(--text-color)',
        border: '1px solid var(--nav-bg)',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-color)',
        opacity: 0.6,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    label: {
        fontWeight: '700',
        color: 'var(--text-color)',
        opacity: 0.8,
        fontSize: '0.9rem',
    },
    input: {
        padding: '0.85rem 1.25rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        background: 'var(--input-bg)',
        color: 'var(--text-color)',
        fontSize: '1rem',
        outline: 'none',
    },
    select: {
        padding: '0.85rem 1.25rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        background: 'var(--input-bg)',
        color: 'var(--text-color)',
        fontSize: '1rem',
        outline: 'none',
    },
    textarea: {
        padding: '0.85rem 1.25rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        background: 'var(--input-bg)',
        color: 'var(--text-color)',
        fontSize: '1rem',
        outline: 'none',
        resize: 'vertical',
    },
    submitBtn: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        padding: '1rem',
        borderRadius: '12px',
        fontWeight: '700',
        fontSize: '1.1rem',
        cursor: 'pointer',
        marginTop: '1rem',
    }
};

export default ExperienceFeed;
