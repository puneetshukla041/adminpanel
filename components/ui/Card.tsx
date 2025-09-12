import { motion } from "framer-motion";
import React from "react";

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  description: string;
  delay?: number;
}

export const Card = ({
  icon,
  title,
  value,
  description,
  delay = 0,
}: CardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.05, rotate: 0.5 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="relative p-6 rounded-3xl bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-xl 
                 shadow-lg border border-white/20 flex flex-col justify-between overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition duration-500"></div>

      {/* Icon */}
      <div className="flex items-center mb-4 relative z-10">
        <div className="p-3 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-2xl text-blue-600 shadow-inner">
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <motion.p
            className="text-3xl font-extrabold text-gray-900 tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3 }}
          >
            {value.toLocaleString()}
          </motion.p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mt-2 relative z-10">{description}</p>
    </motion.div>
  );
};
