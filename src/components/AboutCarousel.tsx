import { motion } from "motion/react";

const values = [
  {
    title: "Innovation",
    description: "We push the boundaries of what's possible in real-time AI.",
    icon: "🚀"
  },
  {
    title: "Speed",
    description: "Connecting businesses and customers in just 3 clicks.",
    icon: "⚡"
  },
  {
    title: "Integrity",
    description: "Building trust through transparent and ethical AI practices.",
    icon: "🛡️"
  },
  {
    title: "Impact",
    description: "Creating real value for businesses across the globe.",
    icon: "🌍"
  }
];

export function AboutCarousel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {values.map((value, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -10 }}
          className="p-8 rounded-3xl bg-white border border-orange-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all"
        >
          <div className="text-4xl mb-6">{value.icon}</div>
          <h3 className="text-xl font-bold mb-3 text-zinc-900">{value.title}</h3>
          <p className="text-zinc-500 text-sm leading-relaxed">{value.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
