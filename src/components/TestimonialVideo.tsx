"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Play, Quote } from "lucide-react";

const VIDEO_URL = "https://res.cloudinary.com/jzmvisx4/video/upload/v1784334648/f8612e1dab88f9fc9d638d614a86a702_jknnlz.mp4";

export default function TestimonialVideo() {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    videoRef.current?.play();
  };

  return (
    <section className="py-16 lg:py-24 bg-[#F8FAFC] overflow-hidden" ref={ref}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
          <span className="badge-light mb-4 inline-flex items-center gap-1.5">
            <Quote className="w-3.5 h-3.5" /> WHAT CLINICS SAY
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3">
            Hear It <span className="gradient-heading">From a Real Client</span>
          </h2>
          <p className="text-gray-500 mb-4 max-w-xl mx-auto">
            No script, no actors — just a clinic telling you what changed after working with us.
          </p>
          <div className="flex items-center justify-center gap-1.5 mb-10">
            <span className="text-amber-400 text-base tracking-tight">★★★★★</span>
            <span className="text-gray-400 text-xs font-semibold">Verified client story</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="relative max-w-xl mx-auto"
        >
          {/* Ambient glow */}
          <div
            className="absolute -inset-10 rounded-full pointer-events-none opacity-[0.14]"
            style={{ background: "radial-gradient(circle, #00B4D8, transparent 70%)", filter: "blur(60px)" }}
          />

          <div className="relative rounded-[28px] p-[3px]" style={{ background: "linear-gradient(135deg, #00283C, #0077A8, #00B4D8)" }}>
            <div className="relative rounded-[26px] overflow-hidden bg-black shadow-2xl h-[420px] sm:h-[480px] flex items-center justify-center">
              {/* Blurred backdrop — same video, scaled up, fills the frame edge-to-edge */}
              <video
                src={VIDEO_URL}
                muted
                loop
                autoPlay
                playsInline
                preload="metadata"
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-60"
              />
              <div className="absolute inset-0 bg-black/30" />

              {/* Sharp foreground video */}
              <video
                ref={videoRef}
                src={VIDEO_URL}
                controls={playing}
                playsInline
                preload="metadata"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                className="relative h-full w-auto max-w-full block shadow-xl"
              />

              {/* Custom play overlay */}
              {!playing && (
                <button
                  onClick={handlePlay}
                  aria-label="Play testimonial video"
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 via-transparent to-black/20 group"
                >
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider">
                    🎥 Real Client Story
                  </span>
                  <span className="relative flex items-center justify-center w-20 h-20 rounded-full bg-white/95 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-30" />
                    <Play className="w-8 h-8 text-[#00283C] ml-1" fill="#00283C" />
                  </span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
