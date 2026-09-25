"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      const sections = ["about", "services", "industries", "why-us", "contact"];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(`#${current}`);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "https://nextventures.in", label: "Home" },
    { href: "https://nextventures.in/#about", label: "About" },
    { href: "https://nextventures.in/#services", label: "Services" },
    { href: "https://nextventures.in/#industries", label: "Industries" },
    { href: "https://nextventures.in/#why-us", label: "Why Us" },
    { 
      label: "Resources", 
      dropdown: [
        { href: "/case-studies", label: "Case Studies" },
        { href: "/blog", label: "Blog" },
        { href: "https://nextventures.in/#faq", label: "FAQ & Insights" }
      ]
    },
    { href: "https://nextventures.in/#contact", label: "Contact" },
  ];

  return (
    <header
      className={`
        fixed left-0 right-0 z-50 transition-all duration-500
        ${isScrolled
          ? "top-4 bg-background/90 backdrop-blur-2xl shadow-2xl border border-ocean-lightest/20 rounded-full max-w-[1200px] mx-auto h-20"
          : "top-0 bg-background" 
        }
      `}
    >
      <div className={`mx-auto px-6 lg:px-12 ${isScrolled ? "h-full" : ""}`}>
        <div className={`flex items-center justify-between ${isScrolled ? "h-full" : "h-20"}`}>
          {/* Logo */}
          <a 
            href="https://nextventures.in" 
            className="relative z-10 flex items-center gap-3 transition-transform duration-300 hover:scale-105"
            aria-label="Next Ventures Home"
          >
            <img 
              src="/nvces-logo.svg" 
              alt="Next Ventures" 
              className={`${isScrolled ? "h-12" : "h-14"} w-auto object-contain`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                (e.target as HTMLImageElement).src = "/logo.png";
              }}
            />
            <span className="font-heading font-bold text-xl md:text-2xl text-[hsl(var(--primary))] tracking-tight">
              Next Ventures
            </span>
          </a>

          {/* Desktop Navigation - Centered */}
          <nav className={`hidden lg:flex items-center gap-0.5 ${isScrolled ? "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" : "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"}`}> 
            {navLinks.map((link) => (
              link.dropdown ? (
                <div 
                  key={link.label}
                  className="relative group"
                  onMouseEnter={() => setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    className={`flex items-center gap-1 font-medium text-ocean-dark/80 hover:text-primary transition-colors duration-300 ${isScrolled ? "px-2 py-1 text-[15px]" : "px-5 py-2 text-[15px]"}`}  // More compact: smaller padding and font
                    aria-expanded={openDropdown === link.label}
                    aria-haspopup="true"
                  >
                    {link.label}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openDropdown === link.label ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div 
                    className={`
                      absolute top-full left-0 mt-2 w-48 bg-card rounded-xl shadow-elegant border border-ocean-lightest/30
                      transition-all duration-300 origin-top
                      ${openDropdown === link.label ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
                    `}
                  >
                    <div className="py-2">
                      {link.dropdown.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-2.5 text-[14px] font-medium text-ocean-dark/80 hover:text-primary hover:bg-ocean-pale/30 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className={`
                    relative font-medium transition-colors duration-300
                    ${isScrolled ? "px-3 py-1 text-[15px]" : "px-5 py-2 text-[15px]"} 
                    ${activeSection === link.href ? "text-primary" : "text-ocean-dark/80 hover:text-primary"}
                  `}
                >
                  {link.label}
                  {/* Active indicator with gold accent */}
                  <span 
                    className={`
                      absolute bottom-0 left-0 right-0 h-[2px] bg-accent
                      transition-transform duration-300 origin-center rounded-full
                      ${activeSection === link.href ? "scale-x-100" : "scale-x-0"}
                    `}
                  />
                </a>
              )
            ))}
          </nav>

          {/* CTA Button - Premium Gold */}
          <div className="hidden lg:block">
            <Button 
              size="default"
              className={`
                gradient-cta text-accent-foreground
                rounded-full font-medium
                transition-all duration-300 
                shadow-gold hover:shadow-cta
                hover:-translate-y-0.5 hover:scale-105
              `}
              asChild
            >
              <a href="https://nextventures.in/#contact">Get Consultancy</a>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2.5 rounded-lg hover:bg-ocean-pale/30 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-ocean-dark" />
            ) : (
              <Menu className="w-6 h-6 text-ocean-dark" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Unchanged */}
      <div
        className={`
          lg:hidden overflow-hidden transition-all duration-500
          ${isMobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="bg-card border-t border-ocean-lightest/20">
          <nav className="max-w-[1400px] mx-auto px-6 py-6 space-y-1">
            {navLinks.map((link) => (
              link.dropdown ? (
                <div key={link.label}>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                    className="w-full flex items-center justify-between text-ocean-dark font-medium py-3 px-4 rounded-lg hover:bg-ocean-pale/30 hover:text-primary transition-all duration-300"
                    aria-expanded={openDropdown === link.label}
                  >
                    {link.label}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openDropdown === link.label ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Mobile Dropdown */}
                  <div 
                    className={`
                      overflow-hidden transition-all duration-300
                      ${openDropdown === link.label ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
                    `}
                  >
                    <div className="pl-4 space-y-1 mt-1">
                      {link.dropdown.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          className="block text-ocean-dark/80 font-medium py-2.5 px-4 rounded-lg hover:bg-ocean-pale/20 hover:text-primary transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className={`
                    block text-ocean-dark font-medium py-3 px-4 rounded-lg
                    hover:bg-ocean-pale/30 hover:text-primary transition-all duration-300
                    ${activeSection === link.href ? "bg-ocean-pale/40 text-primary" : ""}
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              )
            ))}
            
            {/* Mobile CTA - Premium Gold */}
            <Button 
              className="
                w-full mt-4 gradient-cta text-accent-foreground
                rounded-full font-medium shadow-gold
                hover:shadow-cta transition-all duration-300
              "
              asChild
            >
              <a href="https://nextventures.in/#contact">Get Consultancy</a>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;