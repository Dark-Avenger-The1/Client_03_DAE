import './Notice.css';

// tone: 'info' | 'success' | 'error'
export default function Notice({ tone = 'info', children }) {
  if (!children) return null;
  return <p className={`notice notice-${tone}`}>{children}</p>;
}
