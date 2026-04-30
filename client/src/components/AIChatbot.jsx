import { useState, useEffect, useRef, useContext } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, ChevronDown, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../contexts/AuthContext';

const AIChatbot = ({ isOpen, setIsOpen }) => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const location = useLocation();

    // Hide on auth pages
    const authPages = ['/login', '/register', '/forgot-password', '/resetpassword'];
    const isAuthPage = authPages.some(path => location.pathname.startsWith(path));

    if (!isAuthenticated || isAuthPage) return null;
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hi! I'm Propella, your AI Assistant. How can I help you land your dream internship today? ✨", time: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', text: input, time: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await api.post('/ai/chat', { message: input });
            const botMsg = { role: 'assistant', text: data.data.reply, time: new Date() };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: "I'm having a bit of a brain freeze! ❄️ Could you try again in a moment?",
                time: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        "How to improve my profile?",
        "Check my match score",
        "Explain mock tests",
        "Recent internships"
    ];

    if (!isAuthenticated) return null;

    return (
        <div style={styles.wrapper}>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

                    @keyframes slideIn {
                        from { opacity: 0; transform: translateY(20px) scale(0.95); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }

                    @keyframes msgAppear {
                        from { opacity: 0; transform: translateX(10px); }
                        to { opacity: 1; transform: translateX(0); }
                    }

                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-5px); }
                    }

                    .ai-toggle-btn {
                        width: 56px;
                        height: 56px;
                        border-radius: 28px;
                        background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
                        border: none;
                        cursor: pointer;
                        box-shadow: 0 8px 32px rgba(37, 99, 235, 0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        color: white;
                    }
                    .ai-toggle-btn:hover {
                        transform: translateY(-4px) scale(1.05);
                        box-shadow: 0 12px 40px rgba(37, 99, 235, 0.4);
                    }

                    .ai-status {
                        font-size: 0.7rem;
                        opacity: 0.9;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    }
                    .ai-status::before {
                        content: "";
                        width: 5px;
                        height: 5px;
                        background-color: #10b981;
                        border-radius: 50%;
                        box-shadow: 0 0 5px #10b981;
                    }

                    .ai-close-btn {
                        background: rgba(255, 255, 255, 0.15);
                        border: none;
                        width: 28px;
                        height: 28px;
                        border-radius: 14px;
                        color: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .ai-close-btn:hover {
                        background: rgba(255, 255, 255, 0.25);
                    }

                    .ai-message-area {
                        flex: 1;
                        padding: 1.25rem;
                        overflow-y: auto;
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                        scrollbar-width: none;
                    }
                    .ai-message-area::-webkit-scrollbar {
                        display: none;
                    }

                    .ai-input {
                        flex: 1;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        padding: 0.75rem 1rem;
                        color: var(--text-color);
                        font-family: inherit;
                        font-size: 0.9rem;
                        outline: none;
                        transition: all 0.3s ease;
                    }
                    .ai-input:focus {
                        border-color: var(--primary-color);
                        background: rgba(255, 255, 255, 0.1);
                        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
                    }
                    .ai-input::placeholder {
                        color: var(--text-color);
                        opacity: 0.4;
                    }

                    .ai-send-btn {
                        background: #2563eb;
                        border: none;
                        border-radius: 10px;
                        width: 32px;
                        height: 32px;
                        color: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: all 0.3s;
                    }
                    .ai-send-btn:disabled {
                        opacity: 0.3;
                        filter: grayscale(1);
                        cursor: not-allowed;
                    }
                    .ai-send-btn:hover:not(:disabled) {
                        background: #1d4ed8;
                        transform: scale(1.05);
                    }

                    .ai-quick-btn {
                        background: var(--card-bg);
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        padding: 0.4rem 0.75rem;
                        font-size: 0.75rem;
                        font-weight: 600;
                        color: var(--primary-color);
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    .ai-quick-btn:hover {
                        background: var(--primary-color);
                        color: white;
                        border-color: var(--primary-color);
                        transform: translateY(-1px);
                    }

                    .ai-typing span {
                        width: 6px;
                        height: 6px;
                        background: #93c5fd;
                        border-radius: 50%;
                    }
                `}
            </style>

            {/* Floating Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="ai-toggle-btn"
                    title="Propella - Chatbot"
                >
                    <Bot size={28} color="white" />
                    <div style={styles.badge}>Hi!</div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={styles.chatWindow}>
                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.headerTitle}>
                            <div style={styles.botIcon}>
                                <Bot size={20} color="white" />
                            </div>
                            <div>
                                <h3 style={styles.title}>Propella</h3>
                                <span className="ai-status">Online</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="ai-close-btn">
                            <ChevronDown size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="ai-message-area">
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                ...styles.msgWrapper,
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    ...styles.bubble,
                                    backgroundColor: msg.role === 'user' ? 'var(--primary-color)' : 'var(--background-color)',
                                    color: msg.role === 'user' ? 'white' : 'var(--text-color)',
                                    borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                                }}>
                                    {msg.text}
                                    <span style={{
                                        ...styles.msgTime,
                                        color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-color)'
                                    }}>
                                        {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={styles.msgWrapper}>
                                <div style={{ ...styles.bubble, backgroundColor: 'var(--background-color)' }}>
                                    <div style={styles.typingIndicator} className="ai-typing">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {messages.length < 3 && (
                        <div style={styles.quickArea}>
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setInput(action)}
                                    className="ai-quick-btn"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={styles.inputArea}>
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="ai-input"
                            style={styles.input}
                        />
                        <button type="submit" disabled={!input.trim()} className="ai-send-btn">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

const styles = {
    wrapper: {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 1000,
        fontFamily: "'Outfit', 'Inter', sans-serif",
    },
    badge: {
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        background: '#ef4444',
        color: 'white',
        fontSize: '0.6rem',
        fontWeight: '900',
        padding: '2px 6px',
        borderRadius: '10px',
        border: '2px solid var(--card-bg)',
    },
    chatWindow: {
        width: '340px',
        height: '480px',
        backgroundColor: 'var(--card-bg)',
        backdropFilter: 'blur(30px) saturate(180%)',
        borderRadius: '35px',
        boxShadow: '0 20px 50px rgba(37, 99, 235, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        animation: 'slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
    },
    header: {
        padding: '1.25rem 1.5rem',
        background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 15px rgba(37, 99, 235, 0.1)',
    },
    headerTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
    },
    botIcon: {
        width: '36px',
        height: '36px',
        borderRadius: '18px',
        background: 'rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255, 255, 255, 0.4)',
    },
    title: {
        margin: 0,
        fontSize: '0.95rem',
        fontWeight: '700',
        letterSpacing: '-0.01em',
    },
    status: {
        fontSize: '0.7rem',
        opacity: 0.9,
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    empty: {
        textAlign: 'center',
        padding: '4rem',
        color: 'var(--text-color)',
        opacity: 0.7,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        fontSize: '1.1rem',
        background: 'var(--card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
    },
    closeBtn: {
        // Base styles for ai-close-btn are now in the <style> tag
    },
    messageArea: {
        // Base styles for ai-message-area are now in the <style> tag
    },
    msgWrapper: {
        display: 'flex',
        width: '100%',
        animation: 'msgAppear 0.3s ease-out',
    },
    bubble: {
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        lineHeight: '1.5',
        maxWidth: '85%',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        position: 'relative',
        border: '1px solid var(--border-color)',
    },
    msgTime: {
        fontSize: '0.6rem',
        marginTop: '0.3rem',
        display: 'block',
        opacity: 0.6,
    },
    inputArea: {
        padding: '1rem 1.25rem',
        background: 'var(--nav-bg)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
    },
    input: {
        // Base styles for ai-input are now in the <style> tag
    },
    sendBtn: {
        // Base styles for ai-send-btn are now in the <style> tag
    },
    quickArea: {
        padding: '0 1.25rem 1rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    quickBtn: {
        // Base styles for ai-quick-btn are now in the <style> tag
    },
    typingIndicator: {
        display: 'flex',
        gap: '4px',
        padding: '4px 0',
    }
};

export default AIChatbot;
