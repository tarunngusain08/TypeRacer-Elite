import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Crown } from 'lucide-react';
import { FaUsers, FaChartBar } from 'react-icons/fa';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaUsers className="w-6 h-6" />,
      title: "Real-time Racing",
      description: "Compete with players worldwide in real-time typing races"
    },
    {
      icon: <FaChartBar className="w-6 h-6" />,
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
        </div>
      </div>
    </>
  );
};

export default Landing;