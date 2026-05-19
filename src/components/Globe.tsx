import { motion } from "motion/react";

export function Globe() {
  return (
    <div className="relative w-[600px] h-[600px] rounded-full border border-orange-500/10 flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border-2 border-dashed border-orange-500/5"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-10 rounded-full border border-orange-500/10"
      />
      <div className="w-96 h-96 rounded-full bg-gradient-to-br from-orange-500/5 to-transparent blur-3xl" />
    </div>
  );
}
