"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useForm } from "@/context/FormContext";

const navLinks = [
  {
    label: "What We Do",
    href: "#services",
    dropdown: {
      heading: "What We Do",
      links: [
        { label: "All Services", href: "/services" },
        { label: "Digital Marketing", href: "/digital-marketing-for-clinics" },
        { label: "Websites for Dentists", href: "/clinic-website-design" },
        { label: "Mobile App for Clinics", href: "/clinic-mobile-app" },
        { label: "Local SEO for Clinics", href: "/local-seo-for-clinics" },
        { label: "SEO for Dental Clinics", href: "/seo-for-clinics" },
        { label: "AI Receptionist", href: "/ai-receptionist" },
        { label: "WhatsApp AI Automation", href: "/whatsapp-ai-automation" },
        { label: "EHR Platform", href: "/ehr-platform" },
      ],
    },
  },
  {
    label: "Who We Help",
    href: "#",
    dropdown: {
      heading: "Who We Help",
      links: [
        { label: "Dental Clinics", href: "/dental-clinic-growth" },
        { label: "Aesthetic Clinics", href: "/aesthetic-clinic-growth" },
        { label: "Clinics in Lahore", href: "/dental-clinic-lahore" },
        { label: "Clinics in Karachi", href: "/dental-clinic-growth" },
        { label: "Clinics in Islamabad", href: "/dental-clinic-growth" },
        { label: "New Clinic Startups", href: "/dental-clinic-growth" },
      ],
    },
  },
  {
    label: "Who We Are",
    href: "#",
    dropdown: {
      heading: "Who We Are",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Our Mission", href: "/about" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
  },
  {
    label: "Results",
    href: "#results",
    dropdown: null,
  },
  {
    label: "Resources",
    href: "#",
    dropdown: {
      heading: "Resources",
      links: [
        { label: "Pricing", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
        { label: "WhatsApp AI Demo", href: "/whatsapp-ai-automation" },
        { label: "EHR Platform Demo", href: "/ehr-platform" },
      ],
    },
  },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const { openForm } = useForm();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white border-b border-gray-100 shadow-sm" : "bg-white/95 backdrop-blur-sm"
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <a href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Alliance Tech (PVT) LTD"
                width={150}
                height={54}
                className="h-12 lg:h-14 w-auto object-contain"
                priority
              />
            </a>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) =>
                link.dropdown ? (
                  <div key={link.label} className="relative group">
                    <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-[#00283C] transition-colors px-3 py-2 rounded-md hover:bg-gray-50">
                      {link.label}
                      <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-200" />
                    </button>

                    {/* Transparent bridge + dropdown panel — pt-2 closes the hover gap */}
                    <div className="absolute top-full left-0 pt-2 w-56 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                      <div className="rounded-xl py-3 bg-white shadow-xl border border-gray-100">
                        <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">{link.dropdown.heading}</p>
                        {link.dropdown.links.map((d) => (
                          <a key={d.label} href={d.href}
                            className="block px-4 py-2 text-sm text-gray-600 hover:text-[#00283C] hover:bg-[#F0F7FA] transition-colors">
                            {d.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <a key={link.label} href={link.href}
                    className="text-sm font-medium text-gray-700 hover:text-[#00283C] transition-colors px-3 py-2 rounded-md hover:bg-gray-50 relative group">
                    {link.label}
                    <span className="absolute bottom-0 left-3 right-3 h-px bg-[#00283C] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </a>
                )
              )}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <a href="https://wa.me/923207800010" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-semibold text-[#25D366] hover:bg-[#25D366]/10 px-3 py-2 rounded-md transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
              <button onClick={openForm} className="btn-dark px-5 py-2.5 text-sm">
                Let&apos;s Talk
              </button>
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-[#00283C] hover:bg-gray-100 transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-lg max-h-[80vh] overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.dropdown ? (
                    <>
                      <button
                        onClick={() => setMobileExpanded(mobileExpanded === link.label ? null : link.label)}
                        className="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold text-gray-700 hover:text-[#00283C] hover:bg-[#F0F7FA] rounded-lg transition-colors">
                        {link.label}
                        <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded === link.label ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {mobileExpanded === link.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-4">
                            {link.dropdown.links.map((d) => (
                              <a key={d.label} href={d.href} onClick={() => setMobileOpen(false)}
                                className="block px-3 py-2 text-sm text-gray-500 hover:text-[#00283C] hover:bg-[#F0F7FA] rounded-lg transition-colors">
                                {d.label}
                              </a>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <a href={link.href} onClick={() => setMobileOpen(false)}
                      className="block px-3 py-3 text-sm font-semibold text-gray-700 hover:text-[#00283C] hover:bg-[#F0F7FA] rounded-lg transition-colors">
                      {link.label}
                    </a>
                  )}
                </div>
              ))}
              <div className="pt-3 border-t border-gray-100 mt-2">
                <button onClick={() => { setMobileOpen(false); openForm(); }}
                  className="btn-dark w-full py-3 text-sm">
                  Let&apos;s Talk
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
