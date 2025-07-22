// MintContext.jsx
import { createContext, useState } from "react";

export const MintContext = createContext();

export const MintProvider = ({ children }) => {
  const [nftData, setNftData] = useState({
    image: null,
    name: "",
    description: "",
    price: "",
    fromChatbot: false,
  });

  return (
    <MintContext.Provider value={{ nftData, setNftData }}>
      {children}
    </MintContext.Provider>
  );
};
