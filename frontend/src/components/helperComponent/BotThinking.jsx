// import { motion } from 'framer-motion';

// const BotThinking = ({ isVisible = true }) => {
//   if (!isVisible) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.5 }}
//       className="p-3 rounded-lg w-44 md:w-80 font-centurygothic text-white self-start ml-2 mb-2 md:ml-0 mr-auto mt-3"
//     >
//       <div className="flex items-center gap-3">
//         <div className="relative h-8 w-8">
//           {/* Minimal animated background */}
//           <div 
//             className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/40 to-indigo-600/40 backdrop-blur-sm"
//             style={{
//               animation: 'breathe 3s ease-in-out infinite'
//             }}
//           />
          
//           {/* Logo with faster thinking animation */}
//           <img
//             src="./logo.png"
//             alt="Bot Logo"
//             className="h-6 w-6 absolute top-1 left-1 z-10 rounded-full"
//             style={{
//               animation: 'thinking 0.8s ease-in-out infinite'
//             }}
//           />
//         </div>

//         <span className="animate-typingDots text-black dark:text-white text-xs md:text-lg font-mono">
           
//         </span>
//       </div>

//       <style jsx>{`
//         @keyframes breathe {
//           0%, 100% { 
//             transform: scale(1);
//             opacity: 0.4;
//           }
//           50% { 
//             transform: scale(1.1);
//             opacity: 0.6;
//           }
//         }
        
//         @keyframes thinking {
//           0%, 100% { 
//             transform: translateY(0px) rotate(0deg) scale(1);
//           }
//           25% { 
//             transform: translateY(-3px) rotate(-3deg) scale(1.05);
//           }
//           50% { 
//             transform: translateY(-4px) rotate(0deg) scale(1.08);
//           }
//           75% { 
//             transform: translateY(-3px) rotate(3deg) scale(1.05);
//           }
//         }
//       `}</style>
//     </motion.div>
//   );
// };

// export default BotThinking;

import React from 'react';
import { motion } from 'framer-motion';

const BotThinking = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="p-3 rounded-lg w-44 md:w-80 font-centurygothic text-white self-start ml-2 mb-2 md:ml-0 mr-auto mt-3"
    >
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8">
          {/* Breathing background */}
          <div 
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/40 to-indigo-600/40 backdrop-blur-sm animate-breathe"
          />
          
          {/* Bot logo */}
          <img
            src="./logo.png"
            alt="Bot Logo"
            className="h-6 w-6 absolute top-1 left-1 z-10 rounded-full animate-thinking"
          />
        </div>

        <span className="animate-typingDots text-black dark:text-white text-xs md:text-lg font-mono">
          {/* The dots will be added by CSS animation */}
        </span>
      </div>

      {/* Inline styles using regular style tag instead of styled-jsx */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes breathe {
            0%, 100% { 
              transform: scale(1);
              opacity: 0.4;
            }
            50% { 
              transform: scale(1.1);
              opacity: 0.6;
            }
          }
          
          @keyframes thinking {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg) scale(1);
            }
            25% { 
              transform: translateY(-2px) rotate(-2deg) scale(1.02);
            }
            50% { 
              transform: translateY(-3px) rotate(0deg) scale(1.05);
            }
            75% { 
              transform: translateY(-2px) rotate(2deg) scale(1.02);
            }
          }
          
          .animate-breathe {
            animation: breathe 3s ease-in-out infinite;
          }
          
          .animate-thinking {
            animation: thinking 1.5s ease-in-out infinite;
          }
        `
      }} />
    </motion.div>
  );
};

export default BotThinking;
