import ChooseBox from "./ChooseBox";
import "./ChooseSection.css"; // ✅ Styles for this section

function ChooseSection() {
  const features = [
    { img: "⚡", title: "Fast Transactions", text: "Execute trades in milliseconds." },
    { img: "🔒", title: "Secure Platform", text: "Top-tier encryption and wallet safety." },
    { img: "🌐", title: "Global Access", text: "Trade from anywhere in the world." },
    { img: "📈", title: "Live Market Data", text: "Stay ahead with real-time insights." },
    { img: "🤝", title: "Trusted Partners", text: "Integrated with major wallets & exchanges." },
    { img: "💼", title: "Portfolio Management", text: "Track and manage your assets easily." },
  ];

  return (
    <section className="choose-section">
      <h2 className="choose-heading">Why Choose ODIN?</h2>
      <div className="choose-grid">
        {features.map((feature, i) => (
          <ChooseBox key={i} img={feature.img} title={feature.title} text={feature.text} />
        ))}
      </div>
    </section>
  );
}

export default ChooseSection;
