import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./Hero.css";
import { Link } from "react-router-dom";

const steps = [
  { num: "01", title: "COSMIC FORGE", desc: "Seamlessly integrates ethers.js and MetaMask to interact with Ethereum smart contracts in real-time across the Aether.", color: "aurora" },
  { num: "02", title: "SEAMLESS ETH TRANSFERS", desc: "Send and receive Ethereum effortlessly through secure wallet-to-wallet transfers with full MetaMask support.", color: "violet" },
  { num: "03", title: "ODIN'S EYE AI", desc: "A chat-powered AI assistant that mints NFTs, sends ETH, manages access control, and interprets the will of the gods.", color: "crimson" },
  { num: "04", title: "LIVE MARKET DATA", desc: "Track prices, volume, and trends of top cryptocurrencies with real-time stellar data feeds.", color: "ember" },
  { num: "05", title: "SMART CONTRACT ENABLED", desc: "Full Ethereum smart contract deployment, NFT minting, role management, and admin controls via an elegant UI.", color: "violet" },
];

const bentoFeatures = [
  {
    title: "Real-Time Blockchain",
    desc: "Live transaction feeds powered by Alchemy and ethers.js.",
    color: "aurora",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: "AI-Guided Actions",
    desc: "Odin's Eye executes complex Web3 operations through natural language commands.",
    color: "violet",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    title: "Secure by Design",
    desc: "Non-custodial architecture. Your keys, your assets, always.",
    color: "ember",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "NFT Marketplace",
    desc: "Mint, sell, and collect enchanted relics forged on the Bifrost.",
    color: "crimson",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

/* ─── Cosmic Rain Canvas ─── */
function CosmicCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;

    const mouse = { x: -9999, y: -9999 };
    const SCATTER_RADIUS = 100;
    const SCATTER_STRENGTH = 3.5;

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
      mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
    };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    /* Rain-drop color palette */
    const PALETTE = [
      [0,   212, 255],   /* aurora cyan   */
      [139, 92,  246],   /* violet        */
      [225, 29,  72 ],   /* crimson       */
      [245, 197, 66 ],   /* ember         */
      [99,  220, 255],   /* sky blue      */
    ];

    /* Generate N drops scattered across the full canvas */
    const N = 240;
    const drops = Array.from({ length: N }, () => {
      const [r, g, b] = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      return {
        x:    Math.random() * (canvas.width  || 1440),
        y:    Math.random() * (canvas.height || 900),   /* start anywhere, not just top */
        len:  8  + Math.random() * 14,                  /* drop tail length (px)         */
        r:    0.4 + Math.random() * 1.0,                /* drop width                    */
        s:    1.5 + Math.random() * 0.38,              /* fall speed                    */
        dx:   (Math.random() - 0.5) * 0.12,             /* slight horizontal drift       */
        a:    0.15 + Math.random() * 0.35,              /* opacity                       */
        col: [r, g, b],
      };
    });

    /* Subtle ambient orb — follows mouse gently */
    const orb = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    const drawOrb = () => {
      const t = Date.now() / 1000;
      if (mouse.x > 0) { orb.tx = mouse.x / canvas.width; orb.ty = mouse.y / canvas.height; }
      else             { orb.tx = 0.5; orb.ty = 0.4; }
      orb.x += (orb.tx - orb.x) * 0.03;
      orb.y += (orb.ty - orb.y) * 0.03;
      const cx = orb.x * canvas.width;
      const cy = orb.y * canvas.height;
      const radius = 140 + Math.sin(t * 0.6) * 30;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      g.addColorStop(0,    `rgba(0,212,255,${0.09 + Math.sin(t) * 0.03})`);
      g.addColorStop(0.4,  `rgba(139,92,246,${0.04 + Math.cos(t * 0.5) * 0.02})`);
      g.addColorStop(1,    "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawOrb();

      for (const d of drops) {
        /* Mouse scatter */
        const mdx = d.x - mouse.x;
        const mdy = d.y - mouse.y;
        const dist = Math.hypot(mdx, mdy);
        if (dist < SCATTER_RADIUS && dist > 0) {
          const force = (SCATTER_RADIUS - dist) / SCATTER_RADIUS;
          d.x += (mdx / dist) * force * SCATTER_STRENGTH;
        }

        /* Fall */
        d.y += d.s;
        d.x += d.dx;

        /* Reset when drop exits bottom */
        if (d.y > canvas.height + d.len) {
          d.y = -d.len - 5;
          d.x = Math.random() * canvas.width;
        }
        /* Wrap horizontally */
        if (d.x < 0)             d.x = canvas.width;
        if (d.x > canvas.width)  d.x = 0;

        /* Draw as a vertical line (rain streak) */
        const [r, g, b] = d.col;
        const grad = ctx.createLinearGradient(d.x, d.y - d.len, d.x, d.y);
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},${d.a})`);
        ctx.beginPath();
        ctx.moveTo(d.x, d.y - d.len);
        ctx.lineTo(d.x, d.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = d.r;
        ctx.lineCap = "round";
        ctx.stroke();

        /* Small bright tip */
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${d.a * 0.9})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return <canvas ref={ref} className="hero-canvas" />;
}



function Hero() {
  return (
    <div className="hero-wrapper page-enter">
      <div className="cosmic-bg" />

      {/* ═══ ABOVE FOLD ═══ */}
      <section className="hero-cinematic">
        <CosmicCanvas />

        <motion.div
          className="hero-center container"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="hero-eyebrow">
            <span className="forge-tag">
              <span className="pulse-dot" />
              Web3 · AI · NFT
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="hero-title">
            Odin Has
            <span className="hero-title-accent">Awakened</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="hero-tagline">
            Harness The <span className="text-aurora">Aether</span>
          </motion.p>

          <motion.p variants={fadeUp} className="hero-desc">
            Instant transactions forged by Ether.js &amp; Web3.js.
            <br />
            Guided by <em className="text-violet">Odin's Eye</em> — The Soul Bound AI.
          </motion.p>

          <motion.div variants={fadeUp} className="hero-cta-group">
            <Link to="/wallet" className="btn-aether">
              <span>Make a Transfer</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link to="/odineye" className="btn-rune">Odin's Eye</Link>
            <Link to="/bifrost" className="btn-rune btn-rune-ember">Bifrost</Link>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp} className="hero-stats">
            {[
              { val: "Valhalla", lbl: "Tier Reached" },
              { val: "Chosen",   lbl: "RuneSmiths"   },
              { val: "Sepolia",  lbl: "Network"       },
            ].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="hero-stat-divider" />}
                <div className="hero-stat-item">
                  <span className="hero-stat-value">{s.val}</span>
                  <span className="hero-stat-label">{s.lbl}</span>
                </div>
              </React.Fragment>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <div className="hero-scroll-cue">
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — Magazine Vertical List ═══ */}
      <section className="how-it-works">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="how-it-works-header"
          >
            <div className="section-label">
              <span className="text-aurora">01</span> // Mechanics
            </div>
            <h2 className="section-title">
              What Is <span className="text-violet">ODIN?</span>
            </h2>
            <p className="section-sub">Five pillars that define the Aether.</p>
          </motion.div>

          {/* Horizontal 5-card grid */}
          <div className="steps-grid">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className={`step-card step-color-${step.color}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <div className="step-num-badge">{step.num}</div>
                <h4 className="step-title">{step.title}</h4>
                <p className="step-desc">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BENTO FEATURES — Glassmorphism Cards ═══ */}
      <section className="features-bento">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bento-header"
          >
            <div className="section-label">
              <span className="text-aurora">02</span> // Core Pillars
            </div>
            <h2 className="section-title">Built For The <span className="text-ember">New Age</span></h2>
          </motion.div>

          <div className="bento-grid">
            {bentoFeatures.map((f, i) => (
              <motion.div
                key={i}
                className={`bento-card bento-color-${f.color}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -6 }}
              >
                <div className="bento-card-shimmer" />
                <div className="bento-icon-wrap">
                  {f.icon}
                </div>
                <h4 className="bento-title">{f.title}</h4>
                <p className="bento-desc">{f.desc}</p>
                <div className="bento-card-footer">
                  <div className="bento-accent-line" />
                </div>
              </motion.div>
            ))}

            {/* CTA card */}
            <motion.div
              className="bento-card bento-cta-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="bento-cta-left-bar" />
              <div className="bento-cta-inner">
                <p className="bento-cta-label">Ready?</p>
                <p className="bento-cta-sub">Enter the Aether and begin your journey.</p>
                <Link to="/register" className="btn-aether bento-cta-btn">
                  Enter The Aether
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Hero;
