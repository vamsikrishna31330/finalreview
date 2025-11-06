const LoadingScreen = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
      fontFamily: 'var(--font-sans)'
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        border: '6px solid rgba(43, 138, 62, 0.2)',
        borderTopColor: 'var(--color-primary)',
        animation: 'spin 1s linear infinite'
      }} />
      <p>Preparing fields...</p>
      <style>{`@keyframes spin {from {transform: rotate(0deg);} to {transform: rotate(360deg);}}`}</style>
    </div>
  );
};

export default LoadingScreen;
