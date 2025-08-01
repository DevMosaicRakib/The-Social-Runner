import { motion } from "framer-motion";

interface RunnerLoadingProps {
  className?: string;
  count?: number;
  showText?: boolean;
}

export default function RunnerLoading({ className = "", count = 3, showText = true }: RunnerLoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      {/* Running Track Background */}
      <div className="relative mb-8">
        <svg width="200" height="80" viewBox="0 0 200 80" className="opacity-20">
          <ellipse cx="100" cy="40" rx="90" ry="30" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="10,5"/>
          <ellipse cx="100" cy="40" rx="70" ry="20" fill="none" stroke="#16a34a" strokeWidth="2" strokeDasharray="5,3"/>
        </svg>
        
        {/* Animated Runner Silhouettes */}
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: count }).map((_, index) => (
            <motion.div
              key={index}
              className="relative mx-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ 
                x: [0, 10, 0], 
                opacity: [0.6, 1, 0.6],
                scale: [0.9, 1, 0.9]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.3,
                ease: "easeInOut"
              }}
            >
              {/* Runner Silhouette */}
              <svg width="24" height="32" viewBox="0 0 24 32" className="fill-current text-orange-500">
                {/* Head */}
                <motion.circle 
                  cx="12" 
                  cy="6" 
                  r="4" 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: index * 0.3 }}
                />
                
                {/* Body */}
                <motion.rect 
                  x="9" 
                  y="10" 
                  width="6" 
                  height="12" 
                  rx="3"
                  animate={{ scaleY: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: index * 0.3 }}
                />
                
                {/* Arms - Running Motion */}
                <motion.rect 
                  x="6" 
                  y="12" 
                  width="3" 
                  height="8" 
                  rx="1"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: index * 0.3 }}
                  style={{ transformOrigin: "7.5px 12px" }}
                />
                <motion.rect 
                  x="15" 
                  y="12" 
                  width="3" 
                  height="8" 
                  rx="1"
                  animate={{ rotate: [0, -15, 15, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: index * 0.3 }}
                  style={{ transformOrigin: "16.5px 12px" }}
                />
                
                {/* Legs - Running Motion */}
                <motion.rect 
                  x="8" 
                  y="22" 
                  width="3" 
                  height="8" 
                  rx="1"
                  animate={{ rotate: [0, 20, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: index * 0.3 }}
                  style={{ transformOrigin: "9.5px 22px" }}
                />
                <motion.rect 
                  x="13" 
                  y="22" 
                  width="3" 
                  height="8" 
                  rx="1"
                  animate={{ rotate: [0, -10, 20, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: index * 0.3 }}
                  style={{ transformOrigin: "14.5px 22px" }}
                />
              </svg>
              
              {/* Motion Lines */}
              <div className="absolute -left-6 top-1/2 transform -translate-y-1/2">
                {[0, 1, 2].map((lineIndex) => (
                  <motion.div
                    key={lineIndex}
                    className="w-3 h-0.5 bg-orange-300 mb-1 rounded-full"
                    animate={{ 
                      opacity: [0, 1, 0],
                      scaleX: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: index * 0.3 + lineIndex * 0.2
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Loading Text */}
      {showText && (
        <motion.div
          className="text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Finding your running community...
          </h3>
          <div className="flex items-center justify-center space-x-1">
            {[0, 1, 2].map((dotIndex) => (
              <motion.div
                key={dotIndex}
                className="w-2 h-2 bg-orange-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: dotIndex * 0.3
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Compact version for smaller loading areas
export function RunnerLoadingCompact({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <motion.div
        className="relative"
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="20" height="24" viewBox="0 0 20 24" className="fill-current text-orange-500">
          <circle cx="10" cy="4" r="3" />
          <rect x="8" y="7" width="4" height="8" rx="2" />
          <motion.rect 
            x="5" 
            y="9" 
            width="2" 
            height="6" 
            rx="1"
            animate={{ rotate: [0, 30, -30, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ transformOrigin: "6px 9px" }}
          />
          <motion.rect 
            x="13" 
            y="9" 
            width="2" 
            height="6" 
            rx="1"
            animate={{ rotate: [0, -30, 30, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ transformOrigin: "14px 9px" }}
          />
          <motion.rect 
            x="7" 
            y="15" 
            width="2" 
            height="6" 
            rx="1"
            animate={{ rotate: [0, 25, -15, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ transformOrigin: "8px 15px" }}
          />
          <motion.rect 
            x="11" 
            y="15" 
            width="2" 
            height="6" 
            rx="1"
            animate={{ rotate: [0, -15, 25, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ transformOrigin: "12px 15px" }}
          />
        </svg>
        
        {/* Trail effect */}
        <div className="absolute -left-4 top-1/2 transform -translate-y-1/2">
          <motion.div
            className="w-2 h-0.5 bg-orange-300 rounded-full"
            animate={{ opacity: [0, 1, 0], scaleX: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  );
}