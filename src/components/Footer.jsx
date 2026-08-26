import { Github, Linkedin, Mail } from "lucide-react";

const footerLinks = {
  Product: ["Search", "Compare prices", "Alternatives", "How it works"],
  Project: ["About this project", "Team", "GitHub repo"],
  Resources: ["API reference", "Documentation", "FAQ"],
  Legal: ["Privacy", "Terms", "Registrar disclaimer"],
};

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Main footer content - hidden on mobile, visible on sm and up */}
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
          <div className="col-span-1 sm:col-span-3 lg:col-span-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2 mb-3 sm:mb-4">
              <img
                src="/logo.png"
                alt="DomainCompare logo"
                className="w-6 h-6 sm:w-8 sm:h-8"
              />
              <span className="text-lg sm:text-xl font-bold">
                <span className="text-white">Domain</span>
                <span className="text-blue-400">Compare</span>
              </span>
            </div>
            <p className="text-gray-400 mb-4 sm:mb-6 max-w-xs mx-auto sm:mx-0 text-sm sm:text-base">
              Check availability and compare registrar prices in one search.
              Final-year project prototype.
            </p>
            <div className="flex justify-center sm:justify-start space-x-3 sm:space-x-4">
              <a
                href="#"
                className="p-2 sm:p-2.5 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors duration-200"
                aria-label="GitHub repository"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 sm:p-2.5 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 sm:p-2.5 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors duration-200"
                aria-label="Email the team"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Footer links - visible on sm and up */}
          <div className="sm:col-span-3 lg:col-span-4">
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">
                    {category}
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-gray-400 hover:text-white transition-colors duration-200 text-xs sm:text-sm"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t-0 sm:border-t border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
              © 2026 DomainCompare. Prices are sourced from third-party registrar
              APIs and may change. DomainCompare is a comparison tool, not a
              registrar.
            </p>
            <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm shrink-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
