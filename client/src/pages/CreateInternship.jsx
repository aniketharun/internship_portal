import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../contexts/AuthContext';

const CreateInternship = () => {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        description: '',
        location: '',
        stipend: '',
        deadline: '',
        requirements: '',
        experienceLevel: 'Beginner',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Redirect if not authorized (client-side check)
    if (user && user.role === 'student') {
        navigate('/');
        return null;
    }

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const formattedData = {
                ...formData,
                requirements: formData.requirements.split(',').map(r => r.trim()).filter(r => r !== '')
            };
            await api.post('/internships', formattedData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create internship');
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.heading}>Post a New Internship</h2>
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Internship Title (e.g. Software Engineer Intern)"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                    <input
                        type="text"
                        name="company"
                        placeholder="Company Name"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                    <input
                        type="text"
                        name="location"
                        placeholder="Location (e.g. Remote, New York)"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                    <input
                        type="text"
                        name="stipend"
                        placeholder="Stipend (e.g. $20/hr, Unpaid)"
                        value={formData.stipend}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                    <div style={styles.dateGroup}>
                        <label style={styles.label}>Application Deadline</label>
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.grid2}>
                        <div style={styles.dateGroup}>
                            <label style={styles.label}>Experience Level</label>
                            <select
                                name="experienceLevel"
                                value={formData.experienceLevel}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Expert">Expert</option>
                            </select>
                        </div>
                        <div style={styles.dateGroup}>
                            <label style={styles.label}>Requirements (comma-separated)</label>
                            <input
                                type="text"
                                name="requirements"
                                placeholder="React, Node.js, Python"
                                value={formData.requirements}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                    </div>
                    <textarea
                        name="description"
                        placeholder="Internship Description & Requirements..."
                        value={formData.description}
                        onChange={handleChange}
                        required
                        style={styles.textarea}
                        rows="6"
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Posting...' : 'Post Internship'}
                    </button>
                    <button type="button" onClick={() => navigate('/')} className="btn-secondary" style={{ width: '100%' }}>
                        Cancel
                    </button>
                </form>
            </div >
        </div >
    );
};

const styles = {
    container: {
        maxWidth: '800px',
        margin: '2rem auto',
        padding: '0 1rem',
    },
    card: {
        background: 'var(--card-bg)',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid var(--border-color)',
    },
    heading: {
        textAlign: 'center',
        marginBottom: '2rem',
        color: 'var(--text-color)',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    input: {
        padding: '0.75rem',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        fontSize: '1rem',
        background: 'var(--input-bg)',
        color: 'var(--text-color)',
    },
    textarea: {
        padding: '0.75rem',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        fontSize: '1rem',
        fontFamily: 'inherit',
        resize: 'vertical',
        background: 'var(--input-bg)',
        color: 'var(--text-color)',
    },
    grid2: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    },
    dateGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    label: {
        fontSize: '0.9rem',
        color: 'var(--text-color)',
        fontWeight: '600',
        opacity: 0.9,
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
};

export default CreateInternship;
