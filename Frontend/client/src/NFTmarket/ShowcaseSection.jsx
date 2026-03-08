import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./ShowcaseSection.css";
import showcase1 from "../assets/images/showcase_1.png";
import showcase2 from "../assets/images/showcase_2.png";
import showcase3 from "../assets/images/showcase_3.png";

const cards = [
  {
    title: "DISCOVER",
    sub: "Largest Cosmic NFT Marketplace",
    desc: "Traverse the Aether and uncover one-of-a-kind relics forged by the finest digital artisans across the nine realms.",
    image: showcase1,
    route: "/marketplace",
    color: "aurora",
    num: "01",
    cta: "Browse Marketplace",
  },
  {
    title: "FORGE",
    sub: "Bind Your Relic to the Chain",
    desc: "Mint your NFT directly through Odin's cosmic forge. Upload, name, price, and seal your creation in blockchain forever.",
    image: showcase2,
    route: "/mint",
    color: "fire",
    num: "02",
    cta: "Start Minting",
  },
  {
    title: "COLLECT",
    sub: "Rarest Runes from Starborn Artisans",
    desc: "Build your collection with legendary relics from the cosmos. Manage, trade, and display your digital artifacts.",
    image: showcase3,
    route: "/profile",
    color: "violet",
    num: "03",
    cta: "View Collection",
  },
];

const ShowcaseSection = () => {
  const navigate = useNavigate();

  return (
    <div className="showcase-wrapper">
      <div className="container">
        <motion.div
          className="showcase-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="section-label showcase-label">
            <span className="text-aurora">02</span> // Halls of Bifrost
          </div>
          <h2 className="showcase-heading">
            Enter The Halls Of <span className="text-aurora">BIFROST</span>
          </h2>
          <p className="showcase-subtext">
            Traverse through realms of digital relics — discover, sell, and collect enchanted NFTs blest by cosmic forces.
          </p>
        </motion.div>

        <div className="showcase-masonry">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              className={`showcase-card showcase-${card.color}`}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => navigate(card.route)}
            >
              {/* Full-bleed image background */}
              <div className="showcase-img-bg">
                <img src={card.image} alt={card.title} />
                <div className="showcase-img-overlay" />
              </div>

              {/* Content layer */}
              <div className="showcase-content">
                {/* Top bar */}
                <div className="showcase-top">
                  <span className={`showcase-num text-${card.color === "aurora" ? "aurora" : card.color === "fire" ? "ember" : "violet"}`}>
                    {card.num}
                  </span>
                  <span className="showcase-sub-tag">{card.sub}</span>
                </div>

                {/* Main text — revealed on hover */}
                <div className="showcase-body">
                  <h3 className="showcase-title">{card.title}</h3>
                  <p className="showcase-desc">{card.desc}</p>
                </div>

                {/* Footer CTA */}
                <div className="showcase-footer">
                  <span className="showcase-cta">{card.cta}</span>
                  <div className="showcase-arrow-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShowcaseSection;
