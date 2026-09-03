import './Footer.css';

export default function Footer({ brandName = 'Farmstand' }) {
  return (
    <footer className="footer">
      <p>{brandName} — connecting farmers and buyers directly.</p>
    </footer>
  );
}
