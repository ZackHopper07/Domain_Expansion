import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import ComparisonPreview from "./components/ComparisonPreview";
import WhyCompare from "./components/WhyCompare";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
<<<<<<< HEAD
    <div className="site-shell min-h-screen text-white overflow-x-hidden">
      {/* The app shell owns the shared page layout and scroll-aware navigation. */}
      <Navbar scrolled={scrolled} />
      {/* Primary domain search and live result states. */}
      <Hero />
      {/* Explains the three-step availability and pricing workflow. */}
      <Features />
      {/* Shows a representative comparison without requiring a search. */}
      <ComparisonPreview />
      {/* Builds trust by explaining the project's core benefits. */}
      <WhyCompare />
      {/* Project links, social links, and registrar disclaimer. */}
=======
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Navbar scrolled={scrolled} />
      <Hero />
      <Features />
      <ComparisonPreview />
      <WhyCompare />
>>>>>>> 53e0773e429aa548712526d3138262bd0e1e3b19
      <Footer />
    </div>
  );
}

export default App;
