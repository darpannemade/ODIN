import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import coinsVideo from "../assets/images/hero/coins.mp4";
import "./Hero.css";
import "../fonts/fonts.css";
import { Link } from "react-router-dom";
function Hero() {
  const steps = [
{
  title: "WEB3 POWERED",
  desc: "Odin seamlessly integrates ethers.js and MetaMask to interact with Ethereum smart contracts in real-time.",
},
{
  title: "SEAMLESS ETH TRANSFERS",
  desc: "Send and receive Ethereum effortlessly through secure wallet-to-wallet transfers with full MetaMask support.",
},
{
  title: "ODIN'S EYE AI",
  desc: "A chat-powered AI assistant that mints NFTs, sends ETH, manages access control, and interacts with smart contracts—powered by real-time blockchain intelligence.",
},
{
  title: "LIVE MARKET DATA",
  desc: "Track prices, volume, and trends of top cryptocurrencies with real-time CoinGecko data feeds and alerts.",
},
{
  title: "SMART CONTRACT ENABLED",
  desc: "Designed for full Ethereum smart contract deployment, NFT minting, role management, and admin controls via a user-friendly UI.",
}
  ];

  return (
    <div className="hero-wrapper">
      {/* ==== Background Video ==== */}
      <div className="hero-video-right">
        <video
          src={coinsVideo}
          autoPlay
          loop
          muted
          playsInline
          className="floating-coin-video"
        />
      </div>

      {/* ==== HERO CONTENT ==== */}
      <section className="hero-content">
        <button className="ui-btn" aria-label="Web3 Button">
          <span>WEB3</span>
        </button>
        <h1 className="hero-title">
          Odin Has <br /> Awakened
        </h1>
        <h2 className="hero-subtitle">Harness The Bifrost</h2>
        <p className="hero-desc">
          Instant Transactions forged by Ether.js & Web3.js
          <br />
          Guided By <span style={{ color: "#8b15fa" }}>Odin's Eye</span> - The
          Soul Bound AI
        </p>

        <div className="hero-buttons">
          <Link to="/wallet">
            <button className="herobtn button1">Make a Transfer</button>
          </Link>

     <a href="mailto:odinadmin@gmail.com" className="herobtn button2">
  Speak to an Expert
</a>


          <Link to="/odineye" className="herobtn button3">
            Odin's Eye
          </Link>
        </div>
      </section>

      {/* ==== HOW IT WORKS ==== */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="how-it-works-container">
          <div className="how-it-works-header">
            <span className="how-it-works-subtitle">How It Works</span>
            <h2 className="how-it-works-title">WHAT IS ODIN ?</h2>
          </div>

          <div className="how-it-works-content">
            <img
              className="how-it-works-image"
              src="./src/assets/images/hero/426_1x_shots_so.png"
              alt="How It Works"
            />

            <div className="how-it-works-slider-wrapper">
              <Swiper
                modules={[Pagination, Autoplay]}
                slidesPerView={1}
                spaceBetween={32}
                loop={true}
                centeredSlides={true}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                pagination={{
                  el: ".custom-swiper-pagination",
                  clickable: true,
                  renderBullet: (index, className) =>
                    `<span class="${className}">${index + 1}</span>`,
                }}
                className="how-it-works-swiper"
              >
                {steps.map((step, index) => (
                  <SwiperSlide key={index}>
                    <div className="how-it-works-slide">
                      <h4 className="slide-step-title">{step.title}</h4>
                      <p className="slide-step-desc">{step.desc}</p>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="custom-swiper-pagination"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Hero;
