import { motion } from 'framer-motion';
import React from 'react';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  description: string;
  delay?: number;
}

export const Card = ({ icon, title, value, description, delay = 0 }: CardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white p-6 rounded-3xl shadow-xl ring-1 ring-gray-200 flex flex-col justify-between"
    >
      <div className="flex items-center mb-2">
        <div className="p-3 bg-blue-100 rounded-full mr-4 text-blue-600">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">{description}</p>
    </motion.div>
  );
};