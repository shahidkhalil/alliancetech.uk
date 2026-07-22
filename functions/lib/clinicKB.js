/**
 * Clinic knowledge base for the AI Receptionist.
 * Demo clinic is UK-based for Alliance Tech UK demos.
 */

const CLINICS = {
  demo: {
    name: "Bright Smile Dental Care",
    tagline: "Private dental care in Blackburn",
    city: "Blackburn",
    address: "12 King William Street, Blackburn BB1 7DJ",
    phone: "+44 1254 555014",
    whatsapp: "441254555014",
    hours: {
      weekdays: "Mon–Sat, 9:00 AM – 6:00 PM",
      sunday: "Closed",
      note: "Evening slots fill quickly — book ahead where possible.",
    },
    languages: ["English"],
    doctors: [
      { name: "Dr. James Miller", role: "Principal Dentist, Implants", experience: "15+ years" },
      { name: "Dr. Sarah Johnson", role: "Orthodontist (braces & aligners)", experience: "10+ years" },
    ],
    services: [
      { name: "Consultation & Check-up", price: "£65", note: "Often waived if you proceed with treatment.", description: "Full exam, X-rays if needed, and a treatment plan with the dentist." },
      { name: "Scaling & Polishing", price: "£120", description: "Professional clean to remove plaque and stains — usually 45–60 minutes." },
      { name: "Tooth Filling", price: "from £150", description: "Repairs cavities with tooth-coloured composite — same-day in most cases." },
      { name: "Root Canal", price: "from £450", description: "Saves an infected tooth; usually 1–2 visits with local anaesthetic." },
      { name: "Dental Implants", price: "from £2,200 per implant", description: "Permanent tooth replacement; includes consultation and implant planning." },
      { name: "Braces (Orthodontics)", price: "from £2,800", description: "Metal or ceramic braces; typical treatment 12–24 months." },
      { name: "Clear Aligners", price: "from £3,200", description: "Nearly invisible aligners; removable and discreet." },
      { name: "Teeth Whitening", price: "£350", description: "In-surgery whitening — one session, results in about an hour." },
      { name: "Veneers", price: "from £650 per tooth", description: "Thin porcelain shells for a brighter, even smile." },
      { name: "Wisdom Tooth Extraction", price: "from £250", description: "Simple or surgical extraction with sedation options available." },
    ],
    policies: {
      payment: "Card and bank transfer accepted. Finance options available for implants, braces, and aligners.",
      firstVisit: "Please arrive 10 minutes early. Bring any previous X-rays or dental records if available.",
      cancellation: "Free rescheduling with 4 hours' notice.",
      emergency: "Dental emergencies (bleeding, severe pain, knocked-out tooth, facial swelling): triage immediately — calm the patient, mark urgent, offer the earliest emergency slot, alert staff, and offer to transfer to the clinic line. Life-threatening symptoms → advise calling 999.",
    },
    faqs: [
      { q: "Do you offer painless treatment?", a: "Yes — we use modern anaesthetic and gentle techniques. Most patients feel little to no discomfort." },
      { q: "Do you treat children?", a: "Yes, we offer paediatric dental care in a child-friendly environment." },
      { q: "Is parking available?", a: "Yes, nearby parking is available for patients." },
      { q: "Do you take NHS patients?", a: "This demo clinic focuses on private care. Ask about available options when you book." },
    ],
  },
};

function getClinic(clinicId) {
  return CLINICS[clinicId] || CLINICS.demo;
}

module.exports = { getClinic };
