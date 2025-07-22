function ChooseBox({ img, title, text }) {
  return (
    <div className="choose-box p-6 bg-gray-800 text-white rounded shadow">
      <div className="text-4xl mb-2">{img}</div>
      <h4 className="text-xl font-semibold mb-1">{title}</h4>
      <p className="text-gray-400">{text}</p>
    </div>
  );
}

export default ChooseBox;
