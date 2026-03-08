import React from 'react';
import { motion } from 'framer-motion';
import ChooseBox from "./ChooseBox";
import "./ChooseSection.css";

export default function ChooseSection() {
  const features = [
    { 
      img: "⚡", 
      title: "Primal Speed", 
      text: "Forge and trade relics across the Aether with zero latency." 
    },
    { 
      img: "🛡️", 
      title: "Aegis Security", 
      text: "Protected by immutable smart contracts and the Eye of Odin." 
    },
    { 
      img: "🌌", 
      title: "Cosmic Reach", 
      text: "Summon artifacts from any realm, unbound by mortal borders." 
    },
    { 
      img: "🔮", 
      title: "Astral Insight", 
      text: "Gaze into market trends with real-time oracle data." 
    },
    { 
      img: "🤝", 
      title: "Realm Alliances", 
      text: "Seamlessly connect with MetaMask and other major treasuries." 
    },
    { 
      img: "📜", 
      title: "Runesmith Ledger", 
      text: "Track the lineage and value of your collected artifacts instantly." 
    },
  ];

  return (
    <section className="choose-section">
      <div className="container relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="nav-brand-rune mx-auto mb-4" style={{ width: 48, height: 48 }} />
          <h2 className="choose-heading">Why Choose the <span className="text-aurora">Aether?</span></h2>
          <p className="text-muted text-lg max-w-2xl mx-auto mt-4">
            The Bifrost gateway offers unparalleled access to the cosmic marketplace.
          </p>
          <div className="aether-line mx-auto mt-6" style={{ width: '80px' }} />
        </motion.div>

        <div className="choose-grid">
          {features.map((feature, i) => (
            <ChooseBox 
              key={i} 
              img={feature.img} 
              title={feature.title} 
              text={feature.text} 
              index={i} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
