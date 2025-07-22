import { ethers } from "ethers";
import contractJson from "../NFTmarket/contractABI/NFTMarketplace.json";

export async function handleWalletAction(action, walletAddress, contractAddress) {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractJson.abi, signer);

    switch (action.intent) {
      case "transfer_eth": {
        const confirmed = window.confirm(`Send ${action.amount} ETH to ${action.to}?`);
        if (!confirmed) return;

        const tx = await signer.sendTransaction({
          to: action.to,
          value: ethers.utils.parseEther(action.amount.trim())
        });

        alert(`✅ ETH sent!\nTx Hash: ${tx.hash}`);
        break;
      }

      case "buy_nft": {
        const tx = await contract.createMarketSale(action.token_id, {
          value: ethers.utils.parseEther(action.price.trim())
        });
        await tx.wait();
        alert(`✅ NFT #${action.token_id} purchased for ${action.price} ETH`);
        break;
      }

      case "list_nft": {
        let ownsNFT = false;

        try {
          const owner = await contract.ownerOf(action.token_id);
          ownsNFT = owner.toLowerCase() === walletAddress.toLowerCase();
        } catch (checkErr) {
          console.warn("⚠️ Could not check ownerOf token. It might not exist yet.");
        }

        if (ownsNFT) {
          const approved = await contract.getApproved(action.token_id);
          if (approved.toLowerCase() !== contractAddress.toLowerCase()) {
            const approvalTx = await contract.approve(contractAddress, action.token_id);
            await approvalTx.wait();
          }

          const listingFee = await contract.getListingPrice();
          const tx = await contract.resellToken(
            action.token_id,
            ethers.utils.parseEther(action.price.trim()),
            { value: listingFee }
          );
          await tx.wait();
          alert(`✅ NFT #${action.token_id} listed via resellToken`);
        } else {
          const listingFee = await contract.getListingPrice();
          const mintingFee = await contract.getMintingFee();
          const total = mintingFee.add(listingFee);

          const confirmed = window.confirm(
            `You don't own NFT #${action.token_id}. Mint and list for ${action.price} ETH?\n\nTotal: ${ethers.utils.formatEther(total)} ETH`
          );
          if (!confirmed) return;

          const tx = await contract.createToken(
            "ipfs://dummy-uri",
            ethers.utils.parseEther(action.price.trim()),
            { value: total }
          );
          await tx.wait();
          alert("✅ NFT minted and listed successfully");
        }

        break;
      }

      default:
        console.warn("⚠️ Unknown action intent:", action.intent);
    }

  } catch (err) {
    console.error("❌ handleWalletAction failed:", err);
    alert("❌ Wallet action failed: " + (err.reason || err.message || JSON.stringify(err)));
  }
}
