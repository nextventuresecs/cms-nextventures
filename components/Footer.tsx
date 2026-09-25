"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Linkedin, Twitter, Facebook, Instagram } from "lucide-react";

const Footer = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'footer_newsletter',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe. Please try again.');
      }

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Subscribed!",
          description: "Thank you for subscribing to our newsletter.",
        });
        setEmail('');
      } else {
        throw new Error('Unexpected response from server.');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLinks = [
    { label: "About Us", href: "https://nextventures.in/#about" },
    { label: "Services", href: "https://nextventures.in/#services" },
    { label: "Industries", href: "https://nextventures.in/#industries" },
    { label: "Why Us", href: "https://nextventures.in/#why-us" },
    { label: "Blog", href: "/blog" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Contact", href: "https://nextventures.in/#contact" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "https://nextventures.in/privacy-policy" },
    { label: "Terms & Conditions", href: "https://nextventures.in/terms-conditions" },
    { label: "Refund Policy", href: "https://nextventures.in/refund-policy" },
  ];

  const socialLinks = [
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
  ];

  return (
    <footer className="bg-foreground text-primary-foreground pt-16 pb-8 border-t border-border/20">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <a 
                href="https://nextventures.in" 
                aria-label="Next Ventures Home" 
                className="flex items-center gap-3 transition-transform duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-sm">
                  <img 
                    src="/nvces-logo.svg" 
                    alt="Next Ventures Logo" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      (e.target as HTMLImageElement).src = "/logo.png";
                    }}
                  />
                </div>
                <span className="font-heading font-bold text-3xl text-primary-foreground tracking-tight">
                  Next Ventures
                </span>
              </a>
            </div>
            <p className="text-primary-foreground/70 mb-6 max-w-sm">
              Professional consultancy firm providing comprehensive business development, 
              compliance, finance, HR, marketing, and digital solutions.
            </p>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold mb-3">Subscribe to Newsletter</h4>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-10 flex-1"
                />
                <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent-hover text-accent-foreground font-medium">
                  {isSubmitting ? "Subscribing..." : <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6">Legal</h4>
            <ul className="space-y-3 mb-6">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Follow Us</h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Next Ventures Education And Consultancy Services. All rights reserved.
          </p>
          <p className="text-primary-foreground/60 text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
            Based in Indore, Madhya Pradesh, India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
