import React from 'react';
import { motion } from 'framer-motion';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative">
        {/* Cerchio esterno animato */}
        <motion.div
          className="h-16 w-16 rounded-full border-t-2 border-r-2 border-emerald-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Cerchio interno pulsante */}
        <motion.div
          className="absolute inset-0 m-auto h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/50"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Glow effect */}
        <div className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-emerald-500/10 blur-xl animate-pulse" />
      </div>
    </div>
  );
};

export default Loader;
