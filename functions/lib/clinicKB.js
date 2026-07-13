/**
 * Clinic knowledge base for the AI Receptionist.
 * This is the "RAG" source: everything the receptionist is allowed to know
 * about a clinic. For the live demo we ship one sample clinic; in production
 * each clinic gets its own KB (same shape), loaded by clinicId.
 */

const CLINICS = {
  demo: {
    name: "Bright Smile Dental Care",
    tagline: "Premium dental care in Lahore",
    city: "Lahore",
    address: "123 Main Boulevard, DHA Phase 5, Lahore",
    phone: "+92 320 7800010",
    whatsapp: "923207800010",
    hours: {
      weekdays: "Mon–Sat, 10:00 AM – 9:00 PM",
      sunday: "Closed",
      note: "Evening slots (after 6 PM) are popular — book ahead.",
    },
    languages: ["English", "Urdu"],
    doctors: [
      { name: "Dr. Ahmed Raza", role: "Lead Dentist, Implantology", experience: "15+ years" },
      { name: "Dr. Sara Malik", role: "Orthodontist (braces & aligners)", experience: "10+ years" },
    ],
    services: [
      { name: "Consultation & Check-up", price: "PKR 2,000", note: "Waived if you proceed with treatment." },
      { name: "Scaling & Polishing", price: "PKR 6,000" },
      { name: "Tooth Filling", price: "from PKR 5,000" },
      { name: "Root Canal", price: "from PKR 18,000" },
      { name: "Dental Implants", price: "from PKR 100,000 per implant" },
      { name: "Braces (Orthodontics)", price: "from PKR 150,000" },
      { name: "Clear Aligners", price: "from PKR 250,000" },
      { name: "Teeth Whitening", price: "PKR 25,000" },
      { name: "Veneers", price: "from PKR 30,000 per tooth" },
      { name: "Wisdom Tooth Extraction", price: "from PKR 12,000" },
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
