import { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, User as UserIcon, MessageSquare, Search, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import AuthContext from '../contexts/AuthContext';

const Chat = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [initialRecipient, setInitialRecipient] = useState(null);
    const messagesEndRef = useRef(null);
    const isInitialMessagesLoad = useRef(true);

    // Scroll window to top when page first loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const init = async () => {
            const fetchedChats = await fetchChats();

            if (location.state?.recipientId) {
                const existingChat = fetchedChats.find(chat =>
                    chat.participants.some(p => p._id === location.state.recipientId)
                );

                if (existingChat) {
                    setSelectedChat(existingChat);
                } else {
                    // Fetch user details to show in header even if chat doesn't exist yet
                    try {
                        const { data } = await api.get(`/auth/users/${location.state.recipientId}`);
                        setInitialRecipient(data.data);
                    } catch (err) {
                        console.error('Failed to fetch recipient details');
                    }
                }
            }
        };
        init();
        const interval = setInterval(fetchChats, 10000);
        return () => clearInterval(interval);
    }, [location.state]);

    useEffect(() => {
        if (selectedChat) {
            isInitialMessagesLoad.current = true; // Reset so first load doesn't scroll page
            fetchMessages(selectedChat._id);
            const interval = setInterval(() => fetchMessages(selectedChat._id), 5000); // Poll for messages
            return () => clearInterval(interval);
        }
    }, [selectedChat]);

    useEffect(() => {
        if (isInitialMessagesLoad.current) {
            isInitialMessagesLoad.current = false;
            return;
        }
        scrollToBottom();
    }, [messages]);

    const fetchChats = async () => {
        try {
            const { data } = await api.get('/chats');
            setChats(data.data);
            setLoading(false);
            return data.data;
        } catch (err) {
            console.error('Failed to fetch chats');
            setLoading(false);
            return [];
        }
    };

    const fetchMessages = async (chatId) => {
        try {
            const { data } = await api.get(`/chats/${chatId}/messages`);
            setMessages(data.data);
            // Mark as read
            await api.put(`/chats/${chatId}/read`);
        } catch (err) {
            console.error('Failed to fetch messages');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || (!selectedChat && !initialRecipient)) return;

        setSending(true);
        try {
            const recipientId = selectedChat
                ? selectedChat.participants.find(p => p._id !== user._id)._id
                : initialRecipient._id;

            const { data } = await api.post('/chats/message', {
                recipientId,
                text: newMessage
            });

            if (!selectedChat) {
                // First message sent, chat created
                const fetchedChats = await fetchChats();
                const newChat = fetchedChats.find(chat => chat._id === data.data.chat);
                setSelectedChat(newChat);
                setInitialRecipient(null);
            } else {
                setMessages([...messages, data.data]);
            }

            setNewMessage('');
            fetchChats();
        } catch (err) {
            console.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const filteredChats = chats.filter(chat => {
        const otherParticipant = chat.participants.find(p => p._id !== user._id);
        return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) return <div style={styles.loading}>Loading Conversations...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.chatBox}>
                {/* Sidebar */}
                <div style={{
                    ...styles.sidebar,
                    display: selectedChat && window.innerWidth < 768 ? 'none' : 'flex'
                }}>
                    <div style={styles.sidebarHeader}>
                        <h2 style={styles.sidebarTitle}>Messages</h2>
                        <div style={styles.searchContainer}>
                            <Search size={18} color="var(--text-color)" style={{ opacity: 0.4 }} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                style={styles.searchInput}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div style={styles.chatList}>
                        {filteredChats.length === 0 ? (
                            <div style={styles.emptyList}>
                                <MessageSquare size={40} color="var(--border-color)" />
                                <p>No conversations found</p>
                            </div>
                        ) : (
                            filteredChats.map(chat => {
                                const otherParticipant = chat.participants.find(p => p._id !== user._id);
                                const isUnread = chat.unreadCount?.[user._id] > 0;
                                return (
                                    <div
                                        key={chat._id}
                                        onClick={() => setSelectedChat(chat)}
                                        style={{
                                            ...styles.chatItem,
                                            backgroundColor: selectedChat?._id === chat._id ? 'var(--nav-bg)' : 'transparent',
                                            borderLeft: isUnread ? '4px solid var(--primary-color)' : '4px solid transparent'
                                        }}
                                    >
                                        <div style={styles.avatar}>
                                            <UserIcon size={20} color="var(--text-color)" style={{ opacity: 0.5 }} />
                                        </div>
                                        <div style={styles.chatInfo}>
                                            <div style={styles.chatHeader}>
                                                <span style={styles.chatName}>{otherParticipant?.name}</span>
                                                <span style={styles.chatTime}>
                                                    {chat.lastMessage ? new Date(chat.lastMessage.createdAt).toLocaleDateString() : ''}
                                                </span>
                                            </div>
                                            <p style={{
                                                ...styles.chatLastMsg,
                                                fontWeight: isUnread ? '700' : '400',
                                                color: isUnread ? 'var(--text-color)' : 'var(--text-color)',
                                                opacity: isUnread ? 1 : 0.6
                                            }}>
                                                {chat.lastMessage?.text || 'No messages yet'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div style={{
                    ...styles.mainArea,
                    display: (!selectedChat && !initialRecipient) && window.innerWidth < 768 ? 'none' : 'flex'
                }}>
                    {(selectedChat || initialRecipient) ? (
                        <>
                            <div style={styles.mainHeader}>
                                <button
                                    style={styles.backBtn}
                                    onClick={() => { setSelectedChat(null); setInitialRecipient(null); }}
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div style={styles.headerAvatar}>
                                    <UserIcon size={20} color="var(--text-color)" style={{ opacity: 0.5 }} />
                                </div>
                                <div>
                                    <h3 style={styles.headerName}>
                                        {selectedChat
                                            ? selectedChat.participants.find(p => p._id !== user._id)?.name
                                            : initialRecipient?.name
                                        }
                                    </h3>
                                    <span style={styles.headerStatus}>Online</span>
                                </div>
                            </div>

                            <div style={styles.messageArea}>
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            ...styles.messageWrapper,
                                            justifyContent: msg.sender === user._id ? 'flex-end' : 'flex-start'
                                        }}
                                    >
                                        <div style={{
                                            ...styles.messageBubble,
                                            backgroundColor: msg.sender === user._id ? 'var(--primary-color)' : 'var(--nav-bg)',
                                            color: msg.sender === user._id ? 'white' : 'var(--text-color)',
                                            borderRadius: msg.sender === user._id ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                            border: msg.sender === user._id ? 'none' : '1px solid var(--border-color)',
                                        }}>
                                            {msg.text}
                                            <span style={{
                                                ...styles.messageTime,
                                                color: msg.sender === user._id ? 'rgba(255,255,255,0.7)' : 'var(--text-color)'
                                            }}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {!selectedChat && initialRecipient && (
                                    <div style={styles.startBadge}>
                                        This is the start of your conversation with {initialRecipient.name}
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} style={styles.inputArea}>
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    style={styles.msgInput}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', flexShrink: 0 }}
                                    disabled={sending || !newMessage.trim()}
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div style={styles.placeholder}>
                            <div style={styles.placeholderContent}>
                                <MessageSquare size={64} color="var(--border-color)" />
                                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: '800', letterSpacing: '-0.025em' }}>Your Conversations</h2>
                                <p>Select a chat from the sidebar to start messaging.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        height: 'calc(100vh - 80px)',
        padding: '1rem 3%',
        width: '100%',
        margin: '0',
    },
    chatBox: {
        display: 'flex',
        height: '100%',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
    },
    sidebar: {
        width: '450px',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
    },
    sidebarHeader: {
        padding: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
    },
    sidebarTitle: {
        fontSize: '1.75rem',
        fontWeight: '800',
        color: 'var(--text-color)',
        marginBottom: '1rem',
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '-0.025em',
    },
    searchContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        backgroundColor: 'var(--input-bg)',
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
    },
    searchInput: {
        border: 'none',
        background: 'transparent',
        outline: 'none',
        width: '100%',
        fontSize: '0.9rem',
        color: 'var(--text-color)',
    },
    chatList: {
        flex: 1,
        overflowY: 'auto',
    },
    chatItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        gap: '1rem',
    },
    avatar: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: 'var(--input-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: '1px solid var(--border-color)',
    },
    chatInfo: {
        flex: 1,
        minWidth: 0,
    },
    chatHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.25rem',
    },
    chatName: {
        fontWeight: '600',
        color: 'var(--text-color)',
        fontSize: '1rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    chatTime: {
        fontSize: '0.75rem',
        color: 'var(--text-color)',
        opacity: 0.5,
    },
    chatLastMsg: {
        fontSize: '0.85rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    emptyList: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        color: 'var(--text-color)',
        opacity: 0.5,
        gap: '1rem',
    },
    mainArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--card-bg)',
    },
    mainHeader: {
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    backBtn: {
        display: 'none', // Show on mobile
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: '#64748b',
    },
    headerAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        backgroundColor: 'var(--input-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border-color)',
    },
    headerName: {
        fontSize: '1.1rem',
        fontWeight: '700',
        color: 'var(--text-color)',
        margin: 0,
    },
    headerStatus: {
        fontSize: '0.75rem',
        color: 'var(--success)',
        fontWeight: '600',
    },
    messageArea: {
        flex: 1,
        overflowY: 'auto',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    messageWrapper: {
        display: 'flex',
        width: '100%',
    },
    messageBubble: {
        maxWidth: '70%',
        padding: '1rem 1.25rem',
        fontSize: '0.95rem',
        lineHeight: '1.5',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
    },
    messageTime: {
        fontSize: '0.7rem',
        alignSelf: 'flex-end',
        opacity: 0.6,
    },
    inputArea: {
        padding: '1.5rem 2rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        gap: '1rem',
    },
    msgInput: {
        flex: 1,
        padding: '0.85rem 1.25rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--input-bg)',
        color: 'var(--text-color)',
        outline: 'none',
        fontSize: '0.95rem',
        transition: 'border-color 0.2s',
    },
    sendBtn: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s',
        flexShrink: 0,
    },
    startBadge: {
        textAlign: 'center',
        background: 'var(--nav-bg)',
        padding: '1rem',
        borderRadius: '8px',
        color: 'var(--text-color)',
        opacity: 0.6,
        fontSize: '0.9rem',
        border: '1px dashed var(--border-color)',
        margin: '1rem 0',
    },
    placeholder: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--card-bg)',
    },
    placeholderContent: {
        textAlign: 'center',
        color: 'var(--text-color)',
        opacity: 0.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
    },
    loading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: 'var(--text-color)',
        opacity: 0.7,
    }
};

export default Chat;
