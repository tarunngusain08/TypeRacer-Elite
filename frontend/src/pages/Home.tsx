import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Keyboard, Sparkles, Crown, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Keyboard className="w-6 h-6" />,
      title: "Real-time Racing",
      description: "Compete with players worldwide in real-time typing races"
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Track Progress",
      description: "Monitor your WPM and accuracy with detailed statistics"
    },
    {
      icon: <Crown className="w-6 h-6" />,
      title: "Global Rankings",
      description: "Climb the leaderboard and become the typing champion"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="relative z-10">
        {/* Hero Section */}
        <motion.div 
          className="text-center pt-20 pb-16 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="relative inline-block"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
            <motion.div
              className="absolute -inset-2 bg-yellow-400/20 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>

          <motion.h1 
            className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
            whileHover={{ scale: 1.02 }}
          >
            TypeRacer Elite
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Challenge yourself and compete with players worldwide in the ultimate typing race experience
          </motion.p>

          <motion.div 
            className="flex justify-center gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              variants={itemVariants}
              onClick={() => isAuthenticated ? navigate('/game/new') : navigate('/login')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold 
                       hover:from-purple-500 hover:to-pink-500 transform hover:scale-105 transition-all
                       shadow-lg hover:shadow-purple-500/25"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {isAuthenticated ? 'Play Now' : 'Get Started'}
              </span>
            </motion.button>

            <motion.button
              variants={itemVariants}
              onClick={() => navigate('/leaderboard')}
              className="px-8 py-3 bg-gray-800/50 backdrop-blur rounded-lg font-semibold 
                       border border-gray-700 hover:bg-gray-700/50 transform hover:scale-105 
                       transition-all"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Leaderboard
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4 py-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="p-6 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50
                       hover:bg-gray-700/30 transition-all duration-300"
            >
              <div className="w-12 h-12 mb-4 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="text-center py-16 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-blue-900/20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            className="text-3xl font-bold mb-12"
            variants={itemVariants}
          >
            Join the Elite Typing Community
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto px-4">
            {[
              { number: "10K+", label: "Active Players" },
              { number: "1M+", label: "Races Completed" },
              { number: "150+", label: "Countries" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6"
              >
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                  {stat.number}
                </div>
                <div className="text-gray-400 mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Home; 