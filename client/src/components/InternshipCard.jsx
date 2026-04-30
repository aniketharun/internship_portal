import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Calendar, Target, Building2 } from 'lucide-react';

// Direct logo URLs for known companies using Google's favicon service (high-res)
const DOMAIN_MAP = {
    'google':     'google.com',
    'microsoft':  'microsoft.com',
    'amazon':     'amazon.com',
    'meta':       'meta.com',
    'facebook':   'meta.com',
    'flipkart':   'flipkart.com',
    'swiggy':     'swiggy.com',
    'razorpay':   'razorpay.com',
    'zoho':       'zoho.com',
    'infosys':    'infosys.com',
    'wipro':      'wipro.com',
    'tcs':        'tcs.com',
    'accenture':  'accenture.com',
    'deloitte':   'deloitte.com',
    'cognizant':  'cognizant.com',
    'zomato':     'zomato.com',
    'paytm':      'paytm.com',
    'freshworks': 'freshworks.com',
    'ibm':        'ibm.com',
    'intel':      'intel.com',
    'nvidia':     'nvidia.com',
    'adobe':      'adobe.com',
    'salesforce': 'salesforce.com',
    'oracle':     'oracle.com',
    'netflix':    'netflix.com',
    'spotify':    'spotify.com',
    'uber':       'uber.com',
    'airbnb':     'airbnb.com',
    'linkedin':   'linkedin.com',
    'github':     'github.com',
    'stripe':     'stripe.com',
    'shopify':    'shopify.com',
    'slack':      'slack.com',
    'zoom':       'zoom.us',
    'atlassian':  'atlassian.com',
    'figma':      'figma.com',
    'notion':     'notion.so',
    'vercel':     'vercel.com',
    'samsung':    'samsung.com',
    'dell':       'dell.com',
    'cisco':      'cisco.com',
    'tesla':      'tesla.com',
    'apple':      'apple.com',
    'twitter':    'twitter.com',
    'x':          'x.com',
    'hcl':        'hcltech.com',
    'capgemini':  'capgemini.com',
    'tata':       'tata.com',
};

// Uses Google's S2 favicon service — returns high-quality logos at any size
const getLogoUrl = (companyName) => {
    const key = companyName.toLowerCase().split(' ')[0].replace(/[^a-z]/g, '');
    const domain = DOMAIN_MAP[key];
    if (!domain) return null;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
};

// Consistent color avatar fallback
const getAvatarColor = (name) => {
    const colors = ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

const CompanyLogo = ({ company }) => {
    const [failed, setFailed] = useState(false);
    const logoUrl = getLogoUrl(company);
    const initials = company.slice(0, 2).toUpperCase();
    const color = getAvatarColor(company);

    if (!logoUrl || failed) {
        return (
            <div style={{ ...styles.logoBox, background: `${color}18`, border: `1px solid ${color}30` }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color }}>{initials}</span>
            </div>
        );
    }

    return (
        <img
            src={logoUrl}
            alt={company}
            style={styles.logoImg}
            onError={() => setFailed(true)}
        />
    );
};

const InternshipCard = ({ internship, index = 0 }) => {
    return (
        <motion.div
            style={styles.card}
            className="card-premium"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
        >
            <div style={styles.header}>
                <CompanyLogo company={internship.company} />
                <div style={styles.headerText}>
                    <h3 style={styles.title}>{internship.title}</h3>
                    <span style={styles.company}>{internship.company}</span>
                </div>
            </div>

            {internship.matchScore !== undefined && (
                <div style={{
                    ...styles.matchScore,
                    borderColor: internship.matchScore >= 80 ? '#10b981' : internship.matchScore >= 50 ? '#f59e0b' : '#ef4444',
                    color: internship.matchScore >= 80 ? '#10b981' : internship.matchScore >= 50 ? '#f59e0b' : '#ef4444',
                    background: internship.matchScore >= 80 ? 'rgba(16, 185, 129, 0.1)' : internship.matchScore >= 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                }}>
                    <Target size={14} />
                    <span>{internship.matchScore}% Match Score</span>
                </div>
            )}

            <div style={styles.details}>
                <div style={styles.detailItem}>
                    <MapPin size={16} />
                    <span>{internship.location}</span>
                </div>
                <div style={styles.detailItem}>
                    <DollarSign size={16} />
                    <span>{internship.stipend}</span>
                </div>
                {internship.deadline && (
                    <div style={styles.detailItem}>
                        <Calendar size={16} />
                        <span>Deadline: {new Date(internship.deadline).toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            <p style={styles.description}>
                {internship.description.substring(0, 100)}
                {internship.description.length > 100 ? '...' : ''}
            </p>

            <Link to={`/internships/${internship._id}`} className="view-details-btn">
                View Details
            </Link>
        </motion.div>
    );
};

const styles = {
    card: {
        background: 'var(--card-bg)',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
    },
    logoBox: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    logoImg: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        objectFit: 'contain',
        border: '1px solid var(--border-color)',
        background: '#fff',
        padding: '6px',
        flexShrink: 0,
        imageRendering: 'crisp-edges',
    },
    headerText: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.15rem',
        minWidth: 0,
    },
    title: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: 'var(--text-color)',
        margin: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    company: {
        fontSize: '0.9rem',
        color: 'var(--text-color)',
        opacity: 0.6,
        fontWeight: '500',
    },
    matchScore: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.85rem',
        fontWeight: '700',
        padding: '0.4rem 0.75rem',
        borderRadius: '9999px',
        border: '1.5px solid',
        width: 'fit-content',
    },
    details: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        color: 'var(--text-color)',
        opacity: 0.8,
        fontSize: '0.875rem',
    },
    detailItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
    },
    description: {
        color: 'var(--text-color)',
        opacity: 0.75,
        fontSize: '0.9rem',
        lineHeight: '1.55',
        flex: 1,
    },
};

export default InternshipCard;
