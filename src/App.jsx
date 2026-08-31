import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import TldSection from "./components/TldSection";
import ComparisonPreview from "./components/ComparisonPreview";
import WhyCompare from "./components/WhyCompare";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [selectedTld, setSelectedTld] = useState(".com");

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTldSelect = (nextTld) => {
    setSelectedTld(nextTld);
    document.getElementById("top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="site-shell min-h-screen text-white overflow-x-hidden">
      {/* The app shell owns the shared page layout and scroll-aware navigation. */}
      <Navbar scrolled={scrolled} />
      {/* Primary domain search and live result states. */}
      <Hero tld={selectedTld} onTldChange={setSelectedTld} />
      {/* Explains the three-step availability and pricing workflow. */}
      <Features />
      {/* Shows popular TLD options in a card grid matching the reference. */}
      <TldSection tld={selectedTld} onTldSelect={handleTldSelect} />
      {/* Shows a representative comparison without requiring a search. */}
      <ComparisonPreview />
      {/* Builds trust by explaining the project's core benefits. */}
      <WhyCompare />
      {/* Project links, social links, and registrar disclaimer. */}
      <Footer />
    </div>
  );
}

export default App;
