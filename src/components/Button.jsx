import './Button.css';

// variant: 'primary' (shiny green) | 'secondary' (silver)
export default function Button({ children, variant = 'primary', onClick, type = 'button', disabled = false }) {
  return (
    <button
      type={type}
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
