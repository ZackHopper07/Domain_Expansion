import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#compare", label: "Compare" },
  { href: "#why", label: "Why us" },
];

export default function Navbar({ scrolled }) {
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/80 backdrop-blur-lg border-b border-slate-800"
          : "bg-slate-950/20 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
          <a href="#top" className="flex items-center space-x-1 group cursor-pointer">
            <img
              src="/logo.png"
              alt="DomainCompare"
              className="w-6 h-6 sm:w-8 sm:h-8"
            />
            <span className="text-lg sm:text-xl md:text-2xl font-medium">
              <span className="text-white">Domain</span>
              <span className="text-blue-400">Compare</span>
            </span>
          </a>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white text-sm lg:text-base"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#top"
              className="px-4 py-2 bg-gradient-to-b from-blue-600 to-blue-400 rounded-lg text-sm font-semibold hover:scale-102 transition-transform duration-200"
            >
              Search a domain
            </a>
          </div>

          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setMobileMenuIsOpen((prev) => !prev)}
            aria-label={mobileMenuIsOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuIsOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuIsOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 animate-in slide-in-from-top duration-300">
          <div className="px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuIsOpen(false)}
                className="block text-gray-300 hover:text-white text-sm lg:text-base"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#top"
              onClick={() => setMobileMenuIsOpen(false)}
              className="block text-blue-400 font-semibold text-sm lg:text-base"
            >
              Search a domain
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
