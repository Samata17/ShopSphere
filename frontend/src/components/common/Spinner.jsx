function Spinner({ size = 24, label }) {
  return (
    <div className="ss-spinner-wrapper" role="status" aria-live="polite">
      <span
        className="ss-spinner"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      {label && <span className="ss-spinner-label">{label}</span>}
    </div>
  );
}

export default Spinner;
