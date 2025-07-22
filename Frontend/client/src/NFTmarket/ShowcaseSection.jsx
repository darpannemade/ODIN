// Section component placed below NFThome in the same page
// You may import this into the same file or create a separate one and use <ShowcaseSection />

import React from "react";
import "./ShowcaseSection.css";
import { useNavigate } from "react-router-dom";
import showcase1 from "../assets/images/showcase_1.png";
import showcase2 from "../assets/images/showcase_2.png";
import showcase3 from "../assets/images/showcase_3.png";

const ShowcaseSection = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "DISCOVER",
      desc: "LARGEST DIGITAL NFT MARKETPLACE",
      image: showcase1,
      route: "/marketplace",
    },
    {
      title: "SELL",
      desc: "INSTANT SALES, CREATE YOUR RELIC NOW",
      image: showcase2,
      route: "/mint",
    },
    {
      title: "COLLECT",
      desc: "RAREST RUNES FROM THE BEST DIGITAL RUNESMITHS, CHECK PROFILE",
      image: showcase3,
      route: "/profile",
    },
  ];

return (
  <div className="showcase__wrapper section__padding">
    <div className="showcase__header">
      <h1 className="showcase__heading">ENTER THE HALLS OF BIFROST</h1>
      <p className="showcase__subtext">
        Traverse through realms of digital relics — discover, sell, and collect enchanted NFTs blessed by the gods.
      </p>
    </div>

    <div className="showcase__container">
      {cards.map((card, index) => (
        <div key={index} className="showcase__card">
          <h2 className="showcase__title">{card.title}</h2>
          <p className="showcase__desc">{card.desc}</p>
          <img src={card.image} alt={card.title} className="showcase__image" />
          <div className="showcase__footer">
            <span className="showcase__index">0{index + 1}</span>
            <span className="showcase__progress">—— 03</span>
            <button
              className="showcase__arrow"
              onClick={() => navigate(card.route)}
            >
              →
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

};

export default ShowcaseSection;
