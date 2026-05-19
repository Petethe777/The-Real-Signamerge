export function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-12 py-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-gray-500">
      <div className="flex flex-col items-center md:items-start gap-2">
        <span className="font-bold text-black">Signalmerge</span>
        <p>© 2026 Signalmerge. All rights reserved.</p>
      </div>
      <div className="flex gap-8">
        <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-black transition-colors">Contact</a>
      </div>
    </footer>
  );
}
