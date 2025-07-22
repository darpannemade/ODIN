from contract_config import contract, w3

def handle_wallet_intent(intent: dict) -> dict | str:
    match intent["intent"]:
        case "transfer_eth":
            return {
                "text": f"💸 You are sending {intent['amount']} ETH to {intent['to']}.\nPlease confirm this in your wallet.",
                "intent": "transfer_eth",
                "to": intent["to"],
                "amount": intent["amount"]
            }

        case "list_nft":
            return {
                "text": f"📤 Listing NFT #{intent['token_id']} for {intent['price']} ETH.\nConfirm in your wallet.",
                "intent": "list_nft",
                "token_id": intent["token_id"],
                "price": intent["price"]
            }

        case "buy_nft":
            try:
                item = contract.functions.getMarketItem(intent["token_id"]).call()
                price_wei = item[3]
                price_eth = w3.from_wei(price_wei, "ether")
                return {
                    "text": f"🛍 Buying NFT #{intent['token_id']} for {price_eth} ETH. Confirm in your wallet.",
                    "intent": "buy_nft",
                    "token_id": intent["token_id"],
                    "price": str(price_eth)
                }
            except Exception as e:
                return f"❌ Failed to fetch price: {str(e)}"

        case "transfer_nft":
            return {
                "text": f"🎁 Transferring NFT #{intent['token_id']} to {intent['to']}...\nConfirm in wallet.",
                "intent": "transfer_nft",
                "token_id": intent["token_id"],
                "to": intent["to"]
            }

        case _:
            return "⚠️ Unknown wallet action."
