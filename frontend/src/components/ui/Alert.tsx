import React from 'react';
import { motion } from 'framer-motion';

type AlertProps = {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  className?: string;
};

export const Alert = ({ type, message, className = '' }: AlertProps) => {
  const colors = {
    error: 'bg-red-100 border-red-400 text-red-700',
    success: 'bg-green-100 border-green-400 text-green-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${colors[type]} border-l-4 p-4 rounded ${className}`}
      role="alert"
    >
      <p className="font-medium">{message}</p>
    </motion.div>
  );
}; 