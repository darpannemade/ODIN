import React, { useRef, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import images from "../constants/images";
import "./NFThome.css";

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const NFT_CARDS = [1, 2, 3, 4, 5, 6, 7];
const PRICES = ["0.25", "0.80", "1.20", "0.45", "2.10", "0.60", "3.00"];
const BADGES = ["Sold", "Live", "Rare", "Sold", "Epic", "Live", "Myth"];

/* 3D Tilt Card */
function TiltCard({ children, className }) {
  const ref = useRef(null);
  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    ref.current.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(12px)`;
  };
  const handleMouseLeave = () => {
    ref.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0)";
  };
  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)", willChange: "transform" }}
    >
      {children}
    </div>
  );
}

const NFThome = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: true });

  // Auto-scroll
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 2800);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div className="bifrost-page page-enter">

      {/* ═══ HERO ═══ */}
      <section className="bifrost-hero">
        <div className="bifrost-hero-mesh" />
        {/* Animated aurora orb layers */}
        <div className="bifrost-aurora-orb bifrost-orb-1" />
        <div className="bifrost-aurora-orb bifrost-orb-2" />
        <div className="bifrost-aurora-orb bifrost-orb-3" />

        <div className="container">
          <motion.div
            className="bifrost-hero-inner"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="bifrost-eyebrow">
              <div className="aurora-strip" />
              <span className="forge-tag">
                <span className="pulse-dot" />
                NFT Marketplace · Bifrost
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1 variants={fadeUp} className="bifrost-mega-title">
              Enter The Realm
              <span className="bifrost-title-sub">Of Digital Relics</span>
            </motion.h1>

            {/* Sub text */}
            <motion.p variants={fadeUp} className="bifrost-hero-desc">
              Step into Bifrost — a mystic marketplace of enchanted NFTs.
              Discover, collect, and trade one-of-a-kind relics forged by
              digital artisans across the cosmic realms.
            </motion.p>

            {/* CTA Row */}
            <motion.div variants={fadeUp} className="bifrost-cta-row">
              <Link to="/mint" className="btn-aether">
                <span>Forge NFT Now</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </Link>
              <Link to="/marketplace" className="btn-rune">
                Browse Relics
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="bifrost-stats-row">
              {[
                { val: "Aether", lbl: "Tier Reached" },
                { val: "Runes", lbl: "Total Minted" },
                { val: "Starborn", lbl: "Runesmiths" },
              ].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="stat-sep" />}
                  <div className="bifrost-stat">
                    <span className="bifrost-stat-value">{s.val}</span>
                    <span className="bifrost-stat-label">{s.lbl}</span>
                  </div>
                </React.Fragment>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ AURORA DIVIDER ═══ */}
      <div className="aurora-divider">
        <div className="aurora-divider-line" />
        <span className="aurora-divider-label">✦ Featured Relics ✦</span>
        <div className="aurora-divider-line" />
      </div>

      {/* ═══ 3D NFT CARD GALLERY ═══ */}
      <section className="bifrost-gallery">
        <div className="bifrost-gallery-track" ref={emblaRef} style={{ overflow: "hidden" }}>
          <div className="bifrost-gallery-rail">
            {NFT_CARDS.map((num, i) => (
              <TiltCard key={num} className="bifrost-tilt-card">
                <div className="bifrost-card-img-wrap">
                  <img src={images[`gradient_${num}`]} alt={`Relic ${num}`} />
                  <div className="bifrost-card-shine" />
                </div>
                <div className="bifrost-card-info">
                  <div className="bifrost-card-name">Relic #{String(num).padStart(3, "0")}</div>
                  <div className="bifrost-card-price-row">
                    <div>
                      <div className="bifrost-card-price-label">Price</div>
                      <div className="bifrost-card-price-val text-aurora">{PRICES[i]} ETH</div>
                    </div>
                    <span className={`bifrost-card-badge badge-${BADGES[i].toLowerCase()}`}>
                      {BADGES[i]}
                    </span>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AURORA DIVIDER ═══ */}
      <div className="aurora-divider">
        <div className="aurora-divider-line" />
        <span className="aurora-divider-label">✦ Realms ✦</span>
        <div className="aurora-divider-line" />
      </div>

      {/* ═══ ACTION STRIP — redesigned ═══ */}
      <section className="bifrost-realms">
        <div className="container">
          <div className="realms-grid">
            {[
              { num: "01", title: "Discover", sub: "Largest Cosmic NFT Marketplace", to: "/marketplace", color: "aurora", icon: "🌌" },
              { num: "02", title: "Forge", sub: "Instant Sales — Bind Your Relic", to: "/mint", color: "violet", icon: "⚒️" },
              { num: "03", title: "Collect", sub: "Rarest Runes From Starborn Artisans", to: "/manageNFT", color: "ember", icon: "✨" },
            ].map((card, i) => (
              <motion.div
                key={card.num}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={card.to} className={`realm-card realm-${card.color}`}>
                  <div className="realm-card-top">
                    <span className="realm-num">{card.num}</span>
                    <span className="realm-icon">{card.icon}</span>
                  </div>
                  <div className="realm-card-body">
                    <h3 className="realm-title">{card.title}</h3>
                    <p className="realm-sub">{card.sub}</p>
                  </div>
                  <div className="realm-card-footer">
                    <span className="realm-cta">Enter Realm</span>
                    <div className="realm-arrow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                  <div className="realm-card-glow" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NFThome;
