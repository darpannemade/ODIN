from web3 import Web3
import json

# Replace these
INFURA_URL = "http://127.0.0.1:8545" 
CONTRACT_ADDRESS = ""

# Load ABI from JSON file
with open("C:\\Users\\Darpan\\Odin's Eye\\utils\\NFTMarketplace.json", "r") as f:
    ABI = json.load(f)["abi"]

# Setup provider
w3 = Web3(Web3.HTTPProvider(INFURA_URL))
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)
