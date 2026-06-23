"use client";

const marqueeItems = [
  "🦷 Dental Clinics", "✨ Aesthetic Clinics", "📍 Lahore", "🏙️ Karachi",
  "🌆 Islamabad", "🤖 AI Receptionist", "💬 WhatsApp AI", "🌐 Clinic Websites",
  "📱 Patient Apps", "🔍 Local SEO", "📣 Google Ads", "🏥 EHR Platform",
  "🦷 Dental Clinics", "✨ Aesthetic Clinics", "📍 Lahore", "🏙️ Karachi",
  "🌆 Islamabad", "🤖 AI Receptionist", "💬 WhatsApp AI", "🌐 Clinic Websites",
  "📱 Patient Apps", "🔍 Local SEO", "📣 Google Ads", "🏥 EHR Platform",
];

export default function Hero() {

  return (
    <section className="relative pt-32 pb-0 overflow-hidden bg-[#00283C]">

      {/* Full-screen video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/hero-bg.mp4"
      />


      <div className="relative h-[70vh] min-h-[400px]" />


      {/* Marquee / Logo bar */}
      <div className="border-t border-b border-gray-100 bg-[#F8FAFC] py-4 overflow-hidden">
        <div className="flex overflow-hidden">
          <div className="marquee-track whitespace-nowrap">
            {marqueeItems.map((item, i) => (
              <span key={i} className="inline-flex items-center mx-6 text-sm font-semibold text-gray-400">
                <span className="mr-2">{item}</span>
                <span className="text-[#00B4D8]">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-[#00283C] py-8">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { stat: "100+", label: "Clinics Served" },
            { stat: "4x", label: "Avg. Return on Ad Spend" },
            { stat: "60 days", label: "To Measurable Results" },
            { stat: "0", label: "Missed Leads After AI Setup" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-white mb-0.5">{s.stat}</div>
              <div className="text-xs text-white/50 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
