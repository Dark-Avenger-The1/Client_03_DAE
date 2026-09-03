import Navbar from './Navbar';
import Footer from './Footer';
import './Layout.css';

// role: 'buyer' | 'seller' — passed straight through to Navbar
export default function Layout({ role = 'buyer', brandName, userName, points, children }) {
  return (
    <div className="layout">
      <Navbar role={role} brandName={brandName} userName={userName} points={points} />
      <main className="layout-content">{children}</main>
      <Footer brandName={brandName} />
    </div>
  );
}
