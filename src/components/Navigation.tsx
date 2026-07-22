"use client";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, Phone, MessageCircle } from "lucide-react";
import { useForm } from "@/context/FormContext";
import { UK_PHONE_DISPLAY, UK_PHONE_TEL, UK_WHATSAPP_URL } from "@/lib/ukContact";

interface DropdownLink { label: string; href: string; }
interface DropdownGroup { title: string; links: DropdownLink[]; }
interface Dropdown {
  heading: string;
  links?: DropdownLink[];
  top?: DropdownLink[];
  groups?: DropdownGroup[];
}
interface NavLink { label: string; href: string; dropdown: Dropdown | null; }

const navLinks: NavLink[] = [
  {
    label: "Services",
    href: "/#services",
    dropdown: {
      heading: "Services",
      top: [{ label: "All Services", href: "/services" }],
      groups: [
        {
          title: "AI Automation",
          links: [
            { label: "AI Receptionist", href: "/ai-receptionist" },
            { label: "WhatsApp channel", href: "/whatsapp-ai-automation" },
            { label: "Free Website Audit", href: "/free-website-audit" },
          ],
        },
        {
          title: "Growth & Marketing",
          links: [
            { label: "Digital Marketing", href: "/digital-marketing-for-clinics" },
            { label: "SEO for Clinics", href: "/seo-for-clinics" },
            { label: "Local SEO for Clinics", href: "/local-seo-for-clinics" },
            { label: "Clinic Websites", href: "/clinic-website-design" },
          ],
        },
        {
          title: "Platform",
          links: [
            { label: "Patient Mobile App", href: "/clinic-mobile-app" },
            { label: "EHR Platform", href: "/ehr-platform" },
          ],
        },
      ],
    },
  },
  {
    label: "Clinics",
    href: "#",
    dropdown: {
      heading: "Who It's For",
      links: [
        { label: "Dental Clinics", href: "/dental-clinic-growth" },
        { label: "Aesthetic Clinics", href: "/aesthetic-clinic-growth" },
      ],
    },
  },
  {
    label: "Company",
    href: "#",
    dropdown: {
      heading: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Our Mission", href: "/our-mission" },
        { label: "Contact Us", href: "/contact" },
        { label: "Blackburn clinics", href: "/clinic-marketing-blackburn" },
        { label: "Manchester clinics", href: "/clinic-marketing-manchester" },
        { label: "London clinics", href: "/clinic-marketing-london" },
        { label: "FAQ", href: "/#faq" },
      ],
    },
  },
  {
    label: "Case Studies",
    href: "/portfolio",
    dropdown: null,
  },
  {
    label: "Try It",
    href: "#",
    dropdown: {
      heading: "Try It Live",
      links: [
        { label: "Free Website Audit", href: "/free-website-audit" },
        { label: "AI Business Growth Audit", href: "/business-growth-audit" },
        { label: "AI Receptionist", href: "/ai-receptionist" },
      ],
    },
  },
  {
    label: "Blog",
    href: "/blog",
    dropdown: null,
  },
  {
    label: "Pricing",
    href: "/pricing",
    dropdown: null,
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
          <div className="flex items-center justify-between gap-4 h-16 lg:h-[4.25rem]">

            {/* Logo */}
            <a href="/" className="flex items-center flex-shrink-0 bg-transparent">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-horizontal.png"
                alt="Alliance Tech"
                width={1043}
                height={200}
                className="h-8 lg:h-9 w-auto object-contain bg-transparent"
                decoding="async"
                fetchPriority="high"
              />
            </a>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center justify-center flex-1 min-w-0 gap-0.5">
              {navLinks.map((link) =>
                link.dropdown ? (
                  <div key={link.label} className="relative group">
                    <button
                      type="button"
                      aria-label={`${link.label} menu`}
                      aria-haspopup="true"
                      className="flex items-center gap-0.5 whitespace-nowrap text-[13px] font-medium text-gray-600 hover:text-[#00283C] transition-colors px-2.5 py-2 rounded-md hover:bg-gray-50"
                    >
                      {link.label}
                      <ChevronDown className="w-3 h-3 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                    </button>

                    {/* Transparent bridge + dropdown panel — pt-2 closes the hover gap */}
                    <div className={`absolute top-full left-0 pt-2 ${link.dropdown.groups ? "w-64" : "w-56"} opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50`}>
                      <div className="rounded-xl py-3 bg-white shadow-xl border border-gray-100">
                        {link.dropdown.groups ? (
                          <>
                            {link.dropdown.top?.map((d) => (
                              <a key={d.label} href={d.href}
                                className="block px-4 py-2 text-sm font-semibold text-[#00283C] hover:bg-[#F0F7FA] transition-colors">
                                {d.label}
                              </a>
                            ))}
                            {link.dropdown.groups.map((g, gi) => (
                              <div key={g.title} className={gi > 0 ? "mt-1 pt-2 border-t border-gray-100" : "mt-1"}>
                                <p className="px-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{g.title}</p>
                                {g.links.map((d) => (
                                  <a key={d.label} href={d.href}
                                    className="block px-4 py-2 text-sm text-gray-600 hover:text-[#00283C] hover:bg-[#F0F7FA] transition-colors">
                                    {d.label}
                                  </a>
                                ))}
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">{link.dropdown.heading}</p>
                            {link.dropdown.links!.map((d) => (
                              <a key={d.label} href={d.href}
                                className="block px-4 py-2 text-sm text-gray-600 hover:text-[#00283C] hover:bg-[#F0F7FA] transition-colors">
                                {d.label}
                              </a>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <a key={link.label} href={link.href}
                    className="whitespace-nowrap text-[13px] font-medium text-gray-600 hover:text-[#00283C] transition-colors px-2.5 py-2 rounded-md hover:bg-gray-50 relative group">
                    {link.label}
                    <span className="absolute bottom-0.5 left-2.5 right-2.5 h-px bg-[#00283C] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </a>
                )
              )}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center flex-shrink-0 gap-1.5">
              <a
                href={UK_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                title="WhatsApp"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full text-[#25D366] hover:bg-[#ECFDF5] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={UK_PHONE_TEL}
                aria-label={`Call ${UK_PHONE_DISPLAY}`}
                title={UK_PHONE_DISPLAY}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:text-[#00283C] hover:bg-gray-50 transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={openForm}
                data-analytics-label="book_consultation"
                data-analytics-location="desktop_navigation"
                className="btn-dark ml-1 px-4 py-2 text-[13px] whitespace-nowrap"
              >
                Free Audit
              </button>
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-[#00283C] hover:bg-gray-100 transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
          <div className="fixed top-16 lg:top-[4.25rem] left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.dropdown ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={mobileExpanded === link.label}
                        onClick={() => setMobileExpanded(mobileExpanded === link.label ? null : link.label)}
                        className="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold text-gray-700 hover:text-[#00283C] hover:bg-[#F0F7FA] rounded-lg transition-colors">
                        {link.label}
                        <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded === link.label ? "rotate-180" : ""}`} />
                      </button>
                      {mobileExpanded === link.label && (
                          <div className="overflow-hidden pl-4">
                            {link.dropdown.groups ? (
                              <>
                                {link.dropdown.top?.map((d) => (
                                  <a key={d.label} href={d.href} onClick={() => setMobileOpen(false)}
                                    className="block px-3 py-2 text-sm font-semibold text-[#00283C] hover:bg-[#F0F7FA] rounded-lg transition-colors">
                                    {d.label}
                                  </a>
                                ))}
                                {link.dropdown.groups.map((g) => (
                                  <div key={g.title} className="mt-1">
                                    <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{g.title}</p>
                                    {g.links.map((d) => (
                                      <a key={d.label} href={d.href} onClick={() => setMobileOpen(false)}
                                        className="block px-3 py-2 text-sm text-gray-600 hover:text-[#00283C] hover:bg-[#F0F7FA] rounded-lg transition-colors">
                                        {d.label}
                                      </a>
                                    ))}
                                  </div>
                                ))}
                              </>
                            ) : (
                              link.dropdown.links!.map((d) => (
                                <a key={d.label} href={d.href} onClick={() => setMobileOpen(false)}
                                  className="block px-3 py-2 text-sm text-gray-600 hover:text-[#00283C] hover:bg-[#F0F7FA] rounded-lg transition-colors">
                                  {d.label}
                                </a>
                              ))
                            )}
                          </div>
                        )}
                    </>
                  ) : (
                    <a href={link.href} onClick={() => setMobileOpen(false)}
                      className="block px-3 py-3 text-sm font-semibold text-gray-700 hover:text-[#00283C] hover:bg-[#F0F7FA] rounded-lg transition-colors">
                      {link.label}
                    </a>
                  )}
                </div>
              ))}
              <div className="pt-3 border-t border-gray-100 mt-2 space-y-2">
                <a
                  href={UK_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold rounded-lg border border-[#25D366]/30 text-[#128C7E]"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <a
                  href={UK_PHONE_TEL}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold rounded-lg border border-gray-200 text-[#00283C]"
                >
                  <Phone className="w-4 h-4" /> {UK_PHONE_DISPLAY}
                </a>
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); openForm(); }}
                  data-analytics-label="book_consultation"
                  data-analytics-location="mobile_navigation"
                  className="btn-dark w-full py-3 text-sm">
                  Book a Free Audit
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
