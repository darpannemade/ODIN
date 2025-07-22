import React, { useEffect, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import images from "../constants/images";
import "./NFThome.css";

const NFThome = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false });

  // Optional: You can add any state or callbacks here for pagination or controls

  return (
    <div className="app__home section__padding">
      <div className="app__home-content">
        <h1 className="nfthometitle">ENTER THE REALM OF DIGITAL RELICS</h1>
        <p className="p__font1">
         Step into Bifrost — a mystic marketplace of enchanted NFTs. Discover, collect, and trade one-of-a-kind relics forged by digital artisans across the nine realms.
        </p>
        <Link to="/mint">
  <button className="button_1">Forge NFT's NOW</button>
</Link>
        <div className="app__home-content_amount">
          <div>
            <h1>Valhalla Tier</h1>
            <p>Runes Minted</p>
          </div>
          <div>
            <h1>Chosen</h1>
            <p>RuneSmiths</p>
          </div>
        </div>
      </div>

      <div className="app__home-images">
        {/* Embla viewport */}
        <div className="embla" ref={emblaRef} style={{ overflow: "hidden" }}>
          <div className="embla__container" style={{ display: "flex" }}>
            {/* Each slide */}
            {[1, 2, 3, 4, 5, 6, 7].map((num) => {
              const gradientKey = `gradient_${num}`;
              return (
                <div
                  key={num}
                  className="embla__slide"
                  style={{
                    position: "relative",
                    flex: "0 0 80%", // show one card at a time with some peek
                    marginRight: "1rem",
                    cursor: "grab",
                    userSelect: "none",
                  }}
                >
                  <img src={images[gradientKey]} alt={`Gradient ${num}`} />
                  <div className="swiper__content">
                    <div className="swiper__content-top">
                      
                      <div className="swiper__content_profil">
                        
                      </div>
                    </div>
                    <div className="swiper__content-bottom">
                      <div className="content__1">
                        <h1>Price</h1>
                        <div className="current__bid">
                          
                          <p>0.25 ETH</p>
                        </div>
                      </div>
                      <div className="content__2">
                        <div className="ends__in">
                          <h1>Sold</h1>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFThome;
