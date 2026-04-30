import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, MapPin } from 'lucide-react';
import api from '../services/api';
import InternshipCard from '../components/InternshipCard';
import { InternshipCardSkeleton } from '../components/Skeleton';
import TypingHeadline from '../components/TypingHeadline';

const AllInternships = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [tempSearch, setTempSearch] = useState('');

    // Filter states
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [location, setLocation] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [tempLocation, setTempLocation] = useState('');
    const [tempExperienceLevel, setTempExperienceLevel] = useState('');

    const fetchInternships = async () => {
        setLoading(true);
        try {
            const query = `/internships?page=${page}&limit=12&keyword=${search}&location=${location}&experienceLevel=${experienceLevel}`;
            const { data } = await api.get(query);
            setInternships(data.data);
            setCount(data.total);
            setTotalPages(data.pages);
        } catch (err) {
            setError('Failed to load internships');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        fetchInternships();
    }, [page, search, location, experienceLevel]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(tempSearch);
        setPage(1); // Reset to first page on new search
    };

    const handleApplyFilters = () => {
        setLocation(tempLocation);
        setExperienceLevel(tempExperienceLevel);
        setPage(1);
        setIsFilterOpen(false);
    };

    const handleResetFilters = () => {
        setTempLocation('');
        setTempExperienceLevel('');
        setLocation('');
        setExperienceLevel('');
        setPage(1);
        setIsFilterOpen(false);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <style>
                {`
                    .filter-btn {
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    }
                    .filter-btn:hover {
                        background-color: var(--primary-color) !important;
                        color: white !important;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                    }
                    .filter-btn:active {
                        transform: translateY(0);
                    }
                `}
            </style>
            <div style={styles.container}>
                <div style={styles.header}>
                    <div>
                        <TypingHeadline
                            text="All Opportunities"
                            style={styles.title}
                            highlightText=""
                            startTyping={true}
                        />
                        <p style={styles.subtitle}>Discover over 6000 opportunities across India</p>
                    </div>

                    <form onSubmit={handleSearch} style={styles.searchContainer}>
                        <div style={styles.searchInputWrapper}>
                            <Search size={20} style={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by role or company..."
                                value={tempSearch}
                                onChange={(e) => setTempSearch(e.target.value)}
                                style={styles.searchInput}
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={styles.searchBtn}>
                            Search
                        </button>
                    </form>
                </div>

                <div style={styles.filtersBar}>
                    <button
                        style={styles.filterBadge}
                        className="filter-btn"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        <SlidersHorizontal size={14} />
                        Filter
                    </button>
                    <div style={styles.resultsCount}>
                        Showing {internships.length} of {count} results
                    </div>
                </div>

                {/* Filter Drawer/Dropdown */}
                {isFilterOpen && (
                    <div style={styles.filterDrawer}>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Location</label>
                            <input
                                type="text"
                                placeholder="e.g. Remote, Mumbai, etc."
                                value={tempLocation}
                                onChange={(e) => setTempLocation(e.target.value)}
                                style={styles.filterInput}
                            />
                        </div>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Experience Level</label>
                            <select
                                value={tempExperienceLevel}
                                onChange={(e) => setTempExperienceLevel(e.target.value)}
                                style={styles.filterInput}
                            >
                                <option value="">Any Experience</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Expert">Expert</option>
                            </select>
                        </div>
                        <div style={styles.filterActions}>
                            <button onClick={handleResetFilters} style={styles.resetFilterBtn}>Reset</button>
                            <button onClick={handleApplyFilters} className="btn-primary" style={styles.applyFilterBtn}>Apply Filters</button>
                        </div>
                    </div>
                )}

                {error && <div style={styles.error}>{error}</div>}

                {loading ? (
                    <div style={styles.grid}>
                        {Array.from({ length: 12 }).map((_, i) => (
                            <InternshipCardSkeleton key={i} />
                        ))}
                    </div>
                ) : internships.length === 0 ? (
                    <div style={styles.empty}>
                        <Search size={48} style={{ opacity: 0.3 }} />
                        <p>No internships found matching your search.</p>
                        <button
                            onClick={() => { setSearch(''); setTempSearch(''); }}
                            style={styles.resetBtn}
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={styles.grid}>
                            {internships.map((internship, i) => (
                                <InternshipCard key={internship._id} internship={internship} index={i} />
                            ))}
                        </div>

                        {/* Pagination UI */}
                        {totalPages > 1 && (
                            <div style={styles.pagination}>
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    style={{ ...styles.pageBtn, ...(page === 1 ? styles.pageBtnDisabled : {}) }}
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div style={styles.pageNumbers}>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        // Simple pagination logic for showing 5 pages
                                        let pageNum = page;
                                        if (totalPages <= 5) pageNum = i + 1;
                                        else if (page <= 3) pageNum = i + 1;
                                        else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                        else pageNum = page - 2 + i;

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                style={{
                                                    ...styles.pageNumBtn,
                                                    ...(page === pageNum ? styles.pageNumBtnActive : {})
                                                }}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    style={{ ...styles.pageBtn, ...(page === totalPages ? styles.pageBtnDisabled : {}) }}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    pageWrapper: {
        background: 'var(--background-color)',
        minHeight: '100vh',
    },
    container: {
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '4rem 2rem',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '3rem',
        flexWrap: 'wrap',
        gap: '2rem',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: 'var(--text-color)',
        marginBottom: '0.75rem',
        fontFamily: "'Outfit', sans-serif",
    },
    subtitle: {
        color: 'var(--text-color)',
        opacity: 0.7,
        fontSize: '1.15rem',
    },
    searchContainer: {
        display: 'flex',
        gap: '0.75rem',
        flex: '1',
        maxWidth: '500px',
    },
    searchInputWrapper: {
        position: 'relative',
        flex: 1,
    },
    searchIcon: {
        position: 'absolute',
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text-color)',
        opacity: 0.5,
    },
    searchInput: {
        width: '100%',
        padding: '0.875rem 1rem 0.875rem 3rem',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        background: 'var(--card-bg)',
        color: 'var(--text-color)',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s ease',
    },
    searchBtn: {
        padding: '0 1.5rem',
        borderRadius: '12px',
        fontWeight: '600',
    },
    filtersBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 0',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '2.5rem',
    },
    filterBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: 'var(--text-color)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    filterDrawer: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        alignItems: 'flex-end',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        animation: 'slideDown 0.3s ease-out',
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flex: '1',
        minWidth: '200px',
    },
    filterLabel: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: 'var(--text-color)',
        opacity: 0.6,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    filterInput: {
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        background: 'var(--input-bg)',
        color: 'var(--text-color)',
        fontSize: '0.95rem',
        outline: 'none',
    },
    filterActions: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
    },
    applyFilterBtn: {
        padding: '0.75rem 1.5rem',
        borderRadius: '10px',
    },
    resetFilterBtn: {
        background: 'transparent',
        border: 'none',
        color: 'var(--text-color)',
        opacity: 0.5,
        cursor: 'pointer',
        fontWeight: '500',
    },
    resultsCount: {
        fontSize: '0.95rem',
        color: 'var(--text-color)',
        opacity: 0.6,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '2.5rem',
        marginBottom: '4rem',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        margin: '2rem 0',
    },
    pageNumbers: {
        display: 'flex',
        gap: '0.5rem',
    },
    pageBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        background: 'var(--card-bg)',
        color: 'var(--text-color)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    pageBtnDisabled: {
        opacity: 0.3,
        cursor: 'not-allowed',
    },
    pageNumBtn: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        background: 'transparent',
        color: 'var(--text-color)',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    pageNumBtnActive: {
        background: 'var(--primary-color)',
        color: 'white',
        border: 'none',
    },
    loading: {
        textAlign: 'center',
        padding: '10rem 0',
        fontSize: '1.25rem',
        opacity: 0.6,
        color: 'var(--text-color)',
    },
    error: {
        background: 'rgba(239, 68, 68, 0.1)',
        color: 'var(--error)',
        padding: '1.25rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        border: '1px solid var(--error)',
    },
    empty: {
        textAlign: 'center',
        padding: '6rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        color: 'var(--text-color)',
        background: 'var(--card-bg)',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
    },
    resetBtn: {
        background: 'transparent',
        border: 'none',
        color: 'var(--primary-color)',
        fontWeight: '600',
        cursor: 'pointer',
        textDecoration: 'underline',
    }
};

export default AllInternships;
