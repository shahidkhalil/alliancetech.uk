/**
 * Clinic knowledge base for the AI Receptionist.
 * This is the "RAG" source: everything the receptionist is allowed to know
 * about a clinic. For the live demo we ship one sample clinic; in production
 * each clinic gets its own KB (same shape), loaded by clinicId.
 */

const CLINICS = {
  demo: {
    name: "Bright Smile Dental Care",
    tagline: "Premium dental care in Houston",
    city: "Houston",
    address: "2500 Post Oak Blvd, Houston, TX 77056",
    phone: "+1 (713) 555-0142",
    whatsapp: "923207800010",
    hours: {
      weekdays: "Mon–Sat, 10:00 AM – 9:00 PM",
      sunday: "Closed",
      note: "Evening slots (after 6 PM) are popular — book ahead.",
    },
    languages: ["English", "Spanish"],
    doctors: [
      { name: "Dr. James Miller", role: "Lead Dentist, Implantology", experience: "15+ years" },
      { name: "Dr. Sarah Johnson", role: "Orthodontist (braces & aligners)", experience: "10+ years" },
    ],
    services: [
      { name: "Consultation & Check-up", price: "$75", note: "Waived if you proceed with treatment.", description: "Full exam, X-rays if needed, and a treatment plan with the dentist." },
      { name: "Scaling & Polishing", price: "$150", description: "Professional deep clean to remove plaque and stains — usually 45–60 minutes." },
      { name: "Tooth Filling", price: "from $200", description: "Repairs cavities with tooth-coloured composite — same-day in most cases." },
      { name: "Root Canal", price: "from $900", description: "Saves an infected tooth; usually 1–2 visits with local anaesthesia." },
      { name: "Dental Implants", price: "from $3,500 per implant", description: "Permanent tooth replacement; includes consultation and implant placement planning." },
      { name: "Braces (Orthodontics)", price: "from $4,500", description: "Metal or ceramic braces; typical treatment 12–24 months with monthly adjustments." },
      { name: "Clear Aligners", price: "from $5,000", description: "Nearly invisible aligners (Invisalign-style); removable and discreet." },
      { name: "Teeth Whitening", price: "$450", description: "In-office professional whitening — one session, results in about an hour." },
      { name: "Veneers", price: "from $1,000 per tooth", description: "Thin porcelain shells for a brighter, even smile — custom-made." },
      { name: "Wisdom Tooth Extraction", price: "from $350", description: "Simple or surgical extraction with sedation options available." },
    ],
    policies: {
      payment: "Cash, card, and bank transfer accepted. Installment plans available for implants, braces, and aligners.",
      firstVisit: "Please arrive 10 minutes early. Bring any previous X-rays or dental records if available.",
      cancellation: "Free rescheduling with 4 hours' notice.",
      emergency: "For dental emergencies, message us on WhatsApp and we'll try to fit you in the same day.",
    },
    faqs: [
      { q: "Do you offer painless treatment?", a: "Yes — we use modern anaesthesia and gentle techniques. Most patients feel little to no discomfort." },
      { q: "Do you treat children?", a: "Yes, we offer paediatric dental care in a child-friendly environment." },
      { q: "Is parking available?", a: "Yes, free parking is available on-site." },
    ],
  },
};

function getClinic(clinicId) {
  return CLINICS[clinicId] || CLINICS.demo;
}

module.exports = { getClinic };
