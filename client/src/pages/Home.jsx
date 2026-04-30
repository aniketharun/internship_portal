import { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import InternshipCard from '../components/InternshipCard';
import { InternshipCardSkeleton } from '../components/Skeleton';
import AuthContext from '../contexts/AuthContext';
import { PlusCircle, Search, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';
import TypingHeadline from '../components/TypingHeadline';

const Home = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [typingStarted, setTypingStarted] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const listingsRef = useRef(null);
    const heroRef = useRef(null);
    const glowRef = useRef(null);
    const animFrameRef = useRef(null);
    const iconRefs = useRef([]);
    const iconStates = useRef([]);
    const mouseGlobal = useRef({ x: 0, y: 0 });

    // Track mouse position accurately
    const handleMouseMove = useCallback((e) => {
        if (!heroRef.current) return;
        const rect = heroRef.current.getBoundingClientRect();
        mouseGlobal.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        setIsHovering(true);
        if (glowRef.current) {
            glowRef.current.style.left = `${mouseGlobal.current.x}px`;
            glowRef.current.style.top = `${mouseGlobal.current.y}px`;
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovering(false);
        mouseGlobal.current = { x: -1000, y: -1000 };
    }, []);

    // SVG Paths for background logos
    const LOGO_PATHS = {
        google: "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z",
        meta: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z",
        microsoft: "M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z",
        apple: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z",
        github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
        figma: "M15.332 8.668a3.333 3.333 0 0 0 0-6.663H8.668a3.333 3.333 0 0 0 0 6.663 3.333 3.333 0 0 0 0 6.665 3.333 3.333 0 0 0 0 6.664A3.334 3.334 0 0 0 12 18.664V12a3.333 3.333 0 0 0 3.332-3.332z",
        spotify: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
        notion: "M4.459 4.208c.601.575 1.29.8 2.373.717l12.89-.856c.258 0 .043-.258-.085-.301L17.567 2.56c-.387-.344-.902-.73-1.888-.644L2.855 2.987c-.47.043-.558.3-.386.502zm.902 3.516v13.378c0 .729.344 1.03 1.16.987l13.977-.814c.815-.043.987-.558.987-1.158V6.857c0-.6-.215-.944-.73-.9l-14.664.858c-.558.043-.73.386-.73.909zm13.29.814c.086.387 0 .773-.386.816l-.644.128v9.464c-.56.3-1.073.47-1.502.47-.686 0-.857-.215-1.373-.858l-4.202-6.605v6.39l1.332.3s0 .772-1.073.772l-2.96.172c-.086-.172 0-.601.299-.687l.772-.214V9.7L7.1 9.486c-.086-.387.129-.944.727-.987l3.188-.214 4.374 6.69V9.7l-1.116-.129c-.086-.472.255-.815.685-.857z",
        linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
    };

    // Generate randomized floating icons
    const floatingIcons = useMemo(() => {
        const types = Object.keys(LOGO_PATHS);
        return Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            path: LOGO_PATHS[types[i % types.length]],
            x: Math.random() * 100, // percentage
            y: Math.random() * 100, // percentage
            scale: 0.6 + Math.random() * 0.8,
            opacity: 0.12 + Math.random() * 0.18, // increased visibility
            rotation: Math.random() * 360,
            size: 25 + Math.random() * 35 // slightly larger
        }));
    }, []);

    // Initialize physics state and handle resizes robustly with ResizeObserver
    useEffect(() => {
        if (!heroRef.current) return;

        const updateHomePositions = (width, height) => {
            if (width === 0 || height === 0) return;
            
            // Only re-initialize if we don't have states yet, or if dimensions changed significantly
            iconStates.current = floatingIcons.map((icon) => {
                const px = (icon.x / 100) * width;
                const py = (icon.y / 100) * height;
                return {
                    x: px,
                    y: py,
                    vx: 0,
                    vy: 0,
                    homeX: px,
                    homeY: py,
                    phase: Math.random() * Math.PI * 2
                };
            });
        };

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                const { width, height } = entry.contentRect;
                updateHomePositions(width, height);
            }
        });

        observer.observe(heroRef.current);
        return () => observer.disconnect();
    }, [floatingIcons]);

    // Physics Loop: Repulsion, Elasticity, and Drift
    useEffect(() => {
        const animate = () => {
            // Fallback initialization if ResizeObserver missed it or width was 0
            if (!iconStates.current.length || (iconStates.current.length > 0 && iconStates.current[0].homeX === 0)) {
                if (heroRef.current) {
                    const rect = heroRef.current.getBoundingClientRect();
                    if (rect.width > 0) {
                        iconStates.current = floatingIcons.map((icon) => {
                            const px = (icon.x / 100) * rect.width;
                            const py = (icon.y / 100) * rect.height;
                            return {
                                x: px, y: py, vx: 0, vy: 0, 
                                homeX: px, homeY: py, 
                                phase: Math.random() * Math.PI * 2
                            };
                        });
                    }
                }
                animFrameRef.current = requestAnimationFrame(animate);
                return;
            }

            const time = Date.now() * 0.001;
            
            iconStates.current.forEach((state, i) => {
                const iconNode = iconRefs.current[i];
                if (!iconNode) return;

                // 1. Repulsion from cursor
                const dx = state.x - mouseGlobal.current.x;
                const dy = state.y - mouseGlobal.current.y;
                const distSq = dx * dx + dy * dy;
                const dist = Math.sqrt(distSq);
                const radius = 250; 

                if (dist < radius) {
                    const force = (1 - dist / radius) * 2.5; // push a bit harder
                    state.vx += (dx / dist) * force;
                    state.vy += (dy / dist) * force;
                }

                // 2. Elasticity (Pull back to home)
                const hdx = state.homeX - state.x;
                const hdy = state.homeY - state.y;
                state.vx += hdx * 0.04;
                state.vy += hdy * 0.04;

                // 3. Constant Drift
                state.vx += Math.sin(time + state.phase) * 0.1;
                state.vy += Math.cos(time + state.phase) * 0.1;

                // 4. Physics
                state.vx *= 0.88; // slightly more damping
                state.vy *= 0.88;
                state.x += state.vx;
                state.y += state.vy;

                // 5. Apply to DOM with Hardware Acceleration
                iconNode.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) rotate(${state.vx * 12}deg)`;
            });

            animFrameRef.current = requestAnimationFrame(animate);
        };
        animFrameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [floatingIcons]);

    const slides = [
        {
            title: <>Propel Your Career <br /> with the Best Internships</>,
            subtitle: "Empowering people to find meaningful opportunities and launch their professional journey with confidence.",
            btnText: "Browse Internships",
            btnLink: "scroll",
            color: "var(--primary-color)"
        },
        {
            title: <>Smarter Matching, <br /> Faster Hiring</>,
            subtitle: "Our AI analyzes your skills to find the perfect internship match with a 95% success rate.",
            btnText: "Try AI Match",
            btnLink: "/ai-match",
            color: "#6366f1" // Indigo
        },
        {
            title: <>Get Verified <br /> & Stand Out</>,
            subtitle: "Earn badges and certifications that catch the eye of prestigious recruiters.",
            btnText: "Take a Test",
            btnLink: "/tests",
            color: "#f59e0b" // Amber
        },
        {
            title: <>Is your resume ready?</>,
            subtitle: "Get instant AI-powered feedback on your resume and land your dream role faster.",
            btnText: "Check My Resume",
            btnLink: "/resume-checker",
            color: "#10b981" // Emerald
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    useEffect(() => {
        if (user && user.role === 'recruiter') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchInternships = async () => {
            try {
                console.log('Frontend: Fetching internships with limit=9');
                const { data } = await api.get('/internships?limit=9');
                console.log('Frontend: Received internships count:', data.data.length);
                setInternships(data.data.slice(0, 9));
            } catch (err) {
                setError('Failed to load internships');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInternships();
    }, []);

    // Handle ?scrollTo=internships from footer link
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('scrollTo') === 'internships' && !loading) {
            setTypingStarted(false);
            setTimeout(() => {
                listingsRef.current?.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => setTypingStarted(true), 600);
            }, 100);
            // Clean up the URL
            navigate('/', { replace: true });
        }
    }, [location.search, loading, navigate]);

    const scrollToListings = () => {
        setTypingStarted(false);
        listingsRef.current?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => typingStarted === false && setTypingStarted(true), 600);
    };

    return (
        <div style={styles.appWrapper}>
            {/* Hero Section */}
            <div style={styles.hero} ref={heroRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                <button style={styles.arrowLeft} onClick={prevSlide} className="carousel-arrow">
                    <ChevronLeft size={24} />
                </button>
                <button style={styles.arrowRight} onClick={nextSlide} className="carousel-arrow">
                    <ChevronRight size={24} />
                </button>

                <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    style={styles.heroContent}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                >
                    <h1 style={styles.heroTitle}>{slides[currentSlide].title}</h1>
                    <p style={styles.heroSubtitle}>
                        {slides[currentSlide].subtitle}
                    </p>
                    <button
                        onClick={() => {
                            if (slides[currentSlide].btnLink === 'scroll') {
                                scrollToListings();
                            } else {
                                navigate(slides[currentSlide].btnLink);
                            }
                        }}
                        className="btn-primary"
                        style={{ ...styles.heroBtn, backgroundColor: slides[currentSlide].color, boxShadow: `0 10px 30px ${slides[currentSlide].color}40` }}
                    >
                        {slides[currentSlide].btnText}
                    </button>
                </motion.div>
                </AnimatePresence>

                <div style={styles.slidePagination}>
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            style={{
                                ...styles.dot,
                                backgroundColor: currentSlide === index ? slides[index].color : 'var(--border-color)',
                                transform: currentSlide === index ? 'scale(1.2)' : 'scale(1)'
                            }}
                        />
                    ))}
                </div>

                {/* Cursor glow orb */}
                <div
                    ref={glowRef}
                    style={{
                        position: 'absolute',
                        width: '350px',
                        height: '350px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${slides[currentSlide].color}20 0%, transparent 70%)`,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        zIndex: 1,
                        opacity: isHovering ? 1 : 0,
                        transition: 'opacity 0.4s ease, background 0.5s ease',
                    }}
                />

                {/* Hero Decoration - Randomized Floating Icons */}
                <div style={styles.heroDecoration}>
                    {floatingIcons.map((icon, i) => (
                        <svg
                            key={icon.id}
                            ref={el => iconRefs.current[i] = el}
                            viewBox="0 0 24 24"
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                width: `${icon.size}px`,
                                height: `${icon.size}px`,
                                opacity: icon.opacity,
                                willChange: 'transform',
                                pointerEvents: 'none',
                                color: '#94a3b8',
                            }}
                        >
                            <path fill="currentColor" d={icon.path} />
                        </svg>
                    ))}
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .carousel-arrow:hover {
                        background: rgba(255, 255, 255, 0.2) !important;
                        transform: translateY(-50%) scale(1.1) !important;
                        color: var(--primary-color) !important;
                        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
                    }
                    .carousel-arrow:active {
                        transform: translateY(-50%) scale(0.95) !important;
                    }
                    .parallax-layer {
                        position: absolute;
                        top: 0; left: 0;
                        width: 100%; height: 100%;
                        color: #94a3b8;
                    }
                    @keyframes floatSlow {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-8px); }
                    }
                `}} />
            </div>

            <div style={styles.container} ref={listingsRef}>
                <div style={styles.header}>
                    <div>
                        <TypingHeadline
                            text="Find Your Dream Internship"
                            style={styles.title}
                            highlightText=""
                            startTyping={typingStarted}
                        />
                        <p style={styles.subtitle}>Explore the latest opportunities handpicked for you.</p>
                    </div>
                    {user && (user.role === 'recruiter' || user.role === 'admin') && (
                        <Link to="/internships/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                            <PlusCircle size={20} />
                            Post Internship
                        </Link>
                    )}
                </div>

                {error && <div style={styles.error}>{error}</div>}

                {loading ? (
                    <div style={styles.grid}>
                        {Array.from({ length: 9 }).map((_, i) => (
                            <InternshipCardSkeleton key={i} />
                        ))}
                    </div>
                ) : internships.length === 0 ? (
                    <div style={styles.empty}>
                        <Search size={48} color="var(--text-color)" style={{ opacity: 0.3 }} />
                        <p>No internships found at the moment.</p>
                    </div>
                ) : (
                    <>
                        <div style={styles.grid}>
                            {internships.map((internship, i) => (
                                <InternshipCard key={internship._id} internship={internship} index={i} />
                            ))}
                        </div>
                        <motion.div
                            style={styles.viewMoreContainer}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.4 }}
                        >
                            <Link to="/all-internships" className="btn-secondary" style={styles.viewMoreBtn}>
                                View All Internships
                                <Rocket size={18} style={{ marginLeft: '0.5rem' }} />
                            </Link>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    appWrapper: {
        width: '100%',
        background: 'var(--background-color)',
    },
    hero: {
        width: '100%',
        padding: '1rem 2rem 5rem 2rem', // Reduced top padding to accommodate buttons
        textAlign: 'center',
        background: 'var(--white)',
        borderBottom: '1px solid var(--border-color)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        minHeight: '600px', // Fixed height to prevent arrows from moving
    },
    heroContent: {
        maxWidth: '850px',
        position: 'relative',
        zIndex: 2,
        height: '400px', // Content area height
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: '3.75rem',
        fontWeight: '900',
        color: 'var(--text-color)',
        lineHeight: '1.1',
        marginBottom: '1.5rem',
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '-0.03em',
    },
    heroSubtitle: {
        fontSize: '1.25rem',
        color: 'var(--text-color)',
        opacity: 0.7,
        lineHeight: '1.6',
        marginBottom: '2.5rem',
        maxWidth: '650px',
        margin: '0 auto 2.5rem auto',
    },
    heroBtn: {
        padding: '1.1rem 3rem',
        fontSize: '1.15rem',
        fontWeight: '700',
        borderRadius: '16px',
        transition: 'all 0.3s ease',
    },
    arrowLeft: {
        position: 'absolute',
        left: '2rem',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-color)',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10,
        color: 'var(--text-color)',
        transition: 'all 0.3s ease',
    },
    arrowRight: {
        position: 'absolute',
        right: '2rem',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-color)',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10,
        color: 'var(--text-color)',
        transition: 'all 0.3s ease',
    },
    slidePagination: {
        position: 'absolute',
        bottom: '2rem',
        display: 'flex',
        gap: '0.75rem',
        zIndex: 10,
    },
    dot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    heroDecoration: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0,
    },
    // logoBg style removed — parallax layers use CSS classes now
    container: {
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '5rem 2rem',
        scrollMarginTop: '100px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '3.5rem',
        flexWrap: 'wrap',
        gap: '1.5rem',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: 'var(--text-color)',
        marginBottom: '0.75rem',
        minHeight: '3rem',
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '-0.02em',
    },
    subtitle: {
        color: 'var(--text-color)',
        opacity: 0.7,
        fontSize: '1.15rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '2.5rem',
    },
    viewMoreContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '4rem',
    },
    viewMoreBtn: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.8rem 2rem',
        fontSize: '1.1rem',
        fontWeight: '600',
        borderRadius: '12px',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
    },
    loading: {
        textAlign: 'center',
        padding: '6rem',
        fontSize: '1.25rem',
        color: 'var(--text-color)',
        opacity: 0.7,
    },
    error: {
        background: 'rgba(239, 68, 68, 0.1)',
        color: 'var(--error)',
        padding: '1.25rem',
        borderRadius: '12px',
        marginBottom: '3rem',
        border: '1px solid var(--error)',
    },
    empty: {
        textAlign: 'center',
        padding: '6rem 2rem',
        color: 'var(--text-color)',
        opacity: 0.7,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        fontSize: '1.25rem',
        background: 'var(--card-bg)',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
    },
};

export default Home;
