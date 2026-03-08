import React from 'react';
import { motion } from 'framer-motion';

export default function ChooseBox({ img, title, text, index }) {
  // Use framer-motion to stagger the entrance of each box based on its index
  return (
    <motion.div 
      className="choose-box aether-card text-center h-full flex flex-col items-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, boxShadow: 'var(--shadow-aurora)' }}
    >
      <div className="icon-wrapper mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 text-3xl">
        {img}
      </div>
      <h4 className="font-display text-xl font-bold text-primary mb-3">{title}</h4>
      <p className="text-secondary text-sm leading-relaxed">{text}</p>
    </motion.div>
  );
}
