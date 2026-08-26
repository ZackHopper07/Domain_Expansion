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
<<<<<<< HEAD
          ? "bg-[#090b1a]/80 backdrop-blur-lg border-b border-white/10"
          : "bg-[#090b1a]/20 backdrop-blur-sm"
=======
          ? "bg-slate-950/80 backdrop-blur-lg border-b border-slate-800"
          : "bg-slate-950/20 backdrop-blur-sm"
>>>>>>> 53e0773e429aa548712526d3138262bd0e1e3b19
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
<<<<<<< HEAD
          {/* Brand link returns the visitor to the search hero. */}
          <a href="#top" className="flex items-center space-x-2 group cursor-pointer">
            <img
              src="/domain.png"
              alt="DomainExpansion"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
            <span className="text-lg sm:text-xl md:text-2xl font-medium">
              <span className="text-white">Domain</span>
              <span className="text-fuchsia-300">Expansion</span>
            </span>
          </a>

          {/* Desktop section navigation and primary search shortcut. */}
=======
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
>>>>>>> 53e0773e429aa548712526d3138262bd0e1e3b19
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
<<<<<<< HEAD
              className="px-4 py-2 bg-violet-700 text-white rounded-lg text-sm font-semibold hover:bg-violet-600 transition-colors duration-200"
=======
              className="px-4 py-2 bg-gradient-to-b from-blue-600 to-blue-400 rounded-lg text-sm font-semibold hover:scale-102 transition-transform duration-200"
>>>>>>> 53e0773e429aa548712526d3138262bd0e1e3b19
            >
              Search a domain
            </a>
          </div>

<<<<<<< HEAD
          {/* Mobile menu toggle keeps navigation available on narrow screens. */}
=======
>>>>>>> 53e0773e429aa548712526d3138262bd0e1e3b19
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

<<<<<<< HEAD
      {/* Mobile links close the menu after navigating to a section. */}
      {mobileMenuIsOpen && (
        <div className="md:hidden bg-[#0d1022]/95 backdrop-blur-lg border-t border-white/10 animate-in slide-in-from-top duration-300">
=======
      {mobileMenuIsOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 animate-in slide-in-from-top duration-300">
>>>>>>> 53e0773e429aa548712526d3138262bd0e1e3b19
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
<<<<<<< HEAD
              className="block text-fuchsia-300 font-semibold text-sm lg:text-base"
=======
              className="block text-blue-400 font-semibold text-sm lg:text-base"
>>>>>>> 53e0773e429aa548712526d3138262bd0e1e3b19
            >
              Search a domain
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
