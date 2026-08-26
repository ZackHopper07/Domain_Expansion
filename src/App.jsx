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
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Navbar scrolled={scrolled} />
      <Hero />
      <Features />
      <ComparisonPreview />
      <WhyCompare />
      <Footer />
    </div>
  );
}

export default App;
