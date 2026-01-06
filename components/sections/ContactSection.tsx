import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Send } from "lucide-react";

const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    service: '',
    message: '',
    subscribe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://cms.nextventures.in/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          organization: formData.organization,
          service: formData.service,
          message: formData.message,
          subscribe: formData.subscribe, // Send as boolean
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message. Please try again.');
      }

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Message Sent!",
          description: "We'll get back to you within 24 hours.",
        });
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          organization: '',
          service: '',
          message: '',
          subscribe: false,
        });
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


    
  //   // Simulate form submission
  //   await new Promise(resolve => setTimeout(resolve, 1000));
    
  //   toast({
  //     title: "Message Sent!",
  //     description: "We'll get back to you within 24 hours.",
  //   });
    
  //   setIsSubmitting(false);
  //   (e.target as HTMLFormElement).reset();
  // };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Address",
      content: "Indore, Madhya Pradesh, India",
    },
    {
      icon: Phone,
      title: "Phone",
      content: "+91 8818887785",
      href: "tel:+918818887785",
    },
    {
      icon: Mail,
      title: "Email",
      content: "info@nextventures.in",
      href: "mailto:info@nextventures.in",
    },
  ];

  const services = [
    "Business Development",
    "HR & Compliance",
    "Finance & Accounting",
    "Marketing & Branding",
    "Digital Solutions",
    "NGO/FPO Consultancy",
    "Other",
  ];

  return (
    <section id="contact" className="py-20 lg:py-28 bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <div className="animate-fade-up">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              Get In Touch
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Let&apos;s Start Your{" "}
              <span className="text-primary">Success Journey</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Have questions or ready to get started? Reach out to us and our team 
              will respond within 24 hours.
            </p>

            {/* Contact Cards */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <div
                  key={info.title}
                  className="flex items-start gap-4 p-4 bg-secondary rounded-xl animate-fade-up"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{info.title}</div>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <div className="text-muted-foreground">{info.content}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="animate-slide-in-right">
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-2xl shadow-elegant p-8 border border-border/50"
            >
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Adhyant Patil"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    name="organization"
                    placeholder="Company Name"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="info@nextventures.in"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 88188 87785"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <Label htmlFor="service">Service Interest *</Label>
                <select
                  id="service"
                  name="service"
                  required
                  value={formData.service}
                  onChange={handleInputChange}
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a service...</option>
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 mb-8">
                <Label htmlFor="message">Your Message </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us about your project or requirements..."
                  value={formData.message}
                  onChange={handleInputChange}
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="flex items-center space-x-2 mb-8">
                <Checkbox
                  id="subscribe"
                  name="subscribe"
                  checked={formData.subscribe}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, subscribe: checked as boolean }))}
                />
                <Label htmlFor="subscribe" className="text-sm">
                  Subscribe to our newsletter for business tips and updates.
                </Label>
              </div>

              <Button
                type="submit"
                variant="cta"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
