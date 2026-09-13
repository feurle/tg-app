export default function PageSkeleton() {
    return (
        <div className="skeleton-feed">
            {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-block">
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-line" />
                    <div className="skeleton skeleton-line skeleton-line--short" />
                </div>
            ))}
        </div>
    );
}
