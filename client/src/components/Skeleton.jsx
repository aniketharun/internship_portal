// Reusable skeleton loader component
const Skeleton = ({ width = '100%', height = '1rem', borderRadius = '8px', style = {} }) => (
    <div
        className="skeleton"
        style={{ width, height, borderRadius, ...style }}
    />
);

// Skeleton that matches InternshipCard layout
export const InternshipCardSkeleton = () => (
    <div className="skeleton-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <Skeleton height="1.4rem" width="70%" />
            <Skeleton height="1rem" width="45%" />
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Skeleton height="0.9rem" width="100px" />
            <Skeleton height="0.9rem" width="80px" />
            <Skeleton height="0.9rem" width="110px" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <Skeleton height="0.85rem" />
            <Skeleton height="0.85rem" />
            <Skeleton height="0.85rem" width="60%" />
        </div>
        <Skeleton height="2.75rem" borderRadius="8px" />
    </div>
);

// Skeleton for dashboard stat cards
export const DashboardSkeleton = () => (
    <div style={{ padding: '2rem', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <Skeleton height="2rem" width="220px" />
            <Skeleton height="2.5rem" width="180px" borderRadius="8px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton-card" style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                    <Skeleton width="48px" height="48px" borderRadius="12px" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <Skeleton height="1.5rem" width="50px" />
                        <Skeleton height="0.85rem" width="90px" />
                    </div>
                </div>
            ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <InternshipCardSkeleton key={i} />
            ))}
        </div>
    </div>
);

export default Skeleton;
