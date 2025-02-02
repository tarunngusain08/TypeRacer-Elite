import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';

interface AnimatedHeaderProps {
  title: string;
  subtitle?: string;
}

const AnimatedHeader = ({ title, subtitle }: AnimatedHeaderProps) => {
  return (
    <motion.div 
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 blur-3xl animate-pulse-glow" />

      {/* Icon with sparkle effect */}
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Trophy className="w-12 h-12 text-yellow-400" />
        <motion.div
          className="absolute -inset-1"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-14 h-14 text-yellow-400/30" />
        </motion.div>
      </motion.div>

      {/* Title with gradient text */}
      <motion.h1 
        className="mt-4 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {title}
      </motion.h1>

      {/* Subtitle with fade-in animation */}
      {subtitle && (
        <motion.p
          className="mt-2 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {subtitle}
        </motion.p>
      )}

      {/* Decorative underline */}
      <motion.div
        className="mt-4 h-1 w-24 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: 96 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      />
    </motion.div>
  );
};

export default AnimatedHeader; 