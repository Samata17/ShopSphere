function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-block skeleton-image" />

      <div className="skeleton-block skeleton-line skeleton-line-sm" />
      <div className="skeleton-block skeleton-line skeleton-line-lg" />
      <div className="skeleton-block skeleton-line skeleton-line-md" />
      <div className="skeleton-block skeleton-button" />
    </div>
  );
}

export default SkeletonCard;
