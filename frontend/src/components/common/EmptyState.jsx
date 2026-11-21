function EmptyState({ icon, title, message, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}

      <h3>{title}</h3>

      {message && <p>{message}</p>}

      {actionLabel && onAction && (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
