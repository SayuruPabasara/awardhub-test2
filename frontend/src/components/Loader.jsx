import './Loader.css';

export default function Loader({ size = 'md', text, fullPage = false }) {
  return (
    <div className={`loader-container ${fullPage ? 'loader-fullpage' : ''}`}>
      <div className={`loader-spinner ${size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : ''}`} />
      {text && <span className="loader-text">{text}</span>}
    </div>
  );
}
