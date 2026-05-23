import { Link } from "react-router-dom";

interface FooterProps {
  onTermsClick?: () => void;
}

export function Footer({ onTermsClick }: FooterProps) {
  return (
    <footer className="max-w-7xl mx-auto px-12 py-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-gray-500">
      <div className="flex flex-col items-center md:items-start gap-2">
        <Link to="/" className="font-bold text-black hover:text-primary transition-colors">Signalmerge</Link>
        <p>© 2026 Signalmerge. All rights reserved.</p>
      </div>
      <div className="flex gap-8 items-center">
        <Link to="/about" className="hover:text-black transition-colors font-medium">
          About
        </Link>
        <button 
          onClick={onTermsClick}
          className="hover:text-black transition-colors focus:outline-none font-medium cursor-pointer"
        >
          Terms of Service
        </button>
        <a href="#" className="hover:text-black transition-colors">Contact</a>
      </div>
    </footer>
  );
}
