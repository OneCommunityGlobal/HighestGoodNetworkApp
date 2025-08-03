const Spinner = () => (
  <div style={{ textAlign: 'center', margin: '2rem' }}>
    <div className="spinner" />
    <style>{`
      .spinner {
        border: 4px solid rgba(0,0,0,0.1);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border-left-color: #09f;
        animation: spin 1s ease infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default Spinner;
