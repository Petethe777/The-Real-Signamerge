import React, { useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Footer } from "@/components/Footer";
import { OrangeDots } from "@/components/ui/OrangeDots";
import { Globe } from "@/components/Globe";
import { AboutCarousel } from "@/components/AboutCarousel";
import { Logo } from "@/components/Logo";
import { TermsModal } from "@/components/TermsModal";

const timelineEvents = [
  {
    year: "2021",
    title: "The Genesis",
    description: "Signalmerge launches as consultant video booking software, laying the foundation for remote business growth.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
  },
    {
      year: "2023",
      title: "The Pivot",
      description: "Recognizing the gap in lead generation, Signalmerge pivots to advanced technology to connect buyers and sellers.",
      image: "https://images.unsplash.com/photo-1551288049-bbdac8a28a1e?auto=format&fit=crop&q=80&w=800",
    },
  {
    year: "2024",
    title: "MEYA Launch",
    description: "Launch of MEYA, an AI-driven ecommerce consumer research platform that redefined market intelligence.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
  },
  {
    year: "2025",
    title: "SignalMerge Is Born",
    description: "The ultimate evolution: a real-time buying signal AI engine that makes client acquisition a 3-click reality.",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800",
  },
];

export default function AboutPage() {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-primary selection:text-white overflow-x-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,165,0,0.05),transparent_50%)]" />
      <OrangeDots />
    
    <div className="fixed top-6 left-6 z-50">
      <Logo />
    </div>

    <main className="relative z-10">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        <motion.div style={{ opacity, scale }} className="text-center z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium tracking-widest uppercase"
          >
            Our Mission
          </motion.div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 tracking-tighter text-zinc-900">
            THREE <br />
            <span className="text-primary italic">CLICKS</span> <br />
            AWAY
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-zinc-500 font-light leading-relaxed">
            We're building a world where businesses connect with high-intent customers faster than you can blink.
          </p>
        </motion.div>

        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40">
          <Globe />
        </div>
        
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-primary"
        >
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center p-2">
            <div className="w-1 h-2 bg-primary rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Carousel Section */}
      <section className="py-32 px-4 bg-orange-50/50 backdrop-blur-sm border-y border-orange-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-zinc-900">
                Core <span className="text-primary italic">Values</span>
              </h2>
              <p className="text-zinc-600 text-lg">
                Innovation is in our DNA. We don't just follow the trends; we create the infrastructure for the next era of commerce.
              </p>
            </div>
          </div>
          <AboutCarousel />
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-[3rem] overflow-hidden border border-orange-200 shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000"
                alt="Founder"
                className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
            </motion.div>
            
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 italic text-zinc-900">Our Story</h2>
              <div className="space-y-6 text-zinc-600 text-lg leading-relaxed">
                <p>
                  SignalMerge was born from a simple realization: the gap between intent and action is too wide. 
                  Businesses spend billions on ads, hoping to catch someone at the right moment.
                </p>
                  <p>
                      Fully owned by <span className="text-zinc-900 font-semibold">Mergemega</span>, a South African company, 
                      we've built the engine that bridges that gap.
                  </p>
                <p>
                  Founded by <span className="text-primary font-bold">Peter Mkhize</span>, an international award-winning entrepreneur, 
                  we are pioneering the future of sales automation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-32 px-4 bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-5xl md:text-6xl font-black mb-24 tracking-tighter uppercase text-zinc-900">
            The <span className="text-primary italic">Journey</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative h-64 rounded-3xl overflow-hidden mb-6 border border-orange-100 group-hover:border-primary/50 transition-colors shadow-lg shadow-orange-500/5">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-3xl font-black text-primary drop-shadow-md">{event.year}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors text-zinc-900">{event.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{event.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated CTA */}
      <section className="py-40 px-4 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto p-12 sm:p-20 rounded-[4rem] bg-primary relative overflow-hidden group shadow-2xl shadow-primary/30"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_0%,transparent_70%)] opacity-20 group-hover:opacity-30 transition-opacity duration-1000" />
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-none drop-shadow-lg">
            READY TO <br />
            <span className="opacity-90 italic underline">ACCELERATE?</span>
          </h2>
          <button className="bg-white text-primary px-12 py-6 rounded-full font-black text-xl hover:scale-105 transition-all active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-white/20">
            Get Started Now
          </button>
        </motion.div>
      </section>
    </main>

    <Footer onTermsClick={() => setIsTermsModalOpen(true)} />
    <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
    </div>
  );
}
