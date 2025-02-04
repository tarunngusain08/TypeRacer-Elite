import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Keyboard, Crown } from 'lucide-react';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <>
      <AnimatedBackground />
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              className="pt-20 pb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="relative inline-block mb-8"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Trophy className="w-20 h-20 text-yellow-400 mx-auto" />
              </motion.div>

              <motion.h1 
                className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
                whileHover={{ scale: 1.02 }}
              >
                TypeRacer Elite
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Challenge yourself and compete with players worldwide in the ultimate typing race experience
              </motion.p>

              <motion.div 
                className="flex justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold 
                           hover:from-purple-500 hover:to-pink-500 transform hover:scale-105 transition-all
                           shadow-lg hover:shadow-purple-500/25"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>

                <motion.button
                  onClick={() => navigate('/register')}
                  className="px-8 py-3 bg-gray-800/50 backdrop-blur rounded-lg font-semibold 
                           border border-gray-700 hover:bg-gray-700/50 transform hover:scale-105 
                           transition-all"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign Up
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing; 