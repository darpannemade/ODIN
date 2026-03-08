// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract NFTMarketplace is ERC721URIStorage, Ownable, Pausable {

    // ✅ Counters removed in OZ v5 — use plain uint256 instead
    uint256 private _tokenIds;
    uint256 private _itemsSold;

    enum NFTLevel { Basic, Stoneborn, Spiritbound, BifrostWalker, Godslayer }
    mapping(uint256 => NFTLevel) private tokenLevels;

    uint256 public listingPrice = 0.025 ether;
    uint256 public mintingFee = 0.005 ether;

    mapping(uint256 => MarketItem) public idToMarketItem;
    mapping(address => uint256) private userBalances;
    uint256 private adminFunds;

    address[] private allUsers;
    mapping(address => bool) private userTracked;

    mapping(address => bool) private whitelist;
    mapping(address => bool) private blacklist;

    bool public whitelistEnabled = false;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    error InsufficientPayment();
    error NotOwner();
    error InvalidPrice();
    error NoFunds();
    error TokenDoesNotExist();
    error OnlySeller();
    error ItemNotListed();
    error ItemAlreadySold();

    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    event AddressWhitelisted(address indexed user);
    event AddressRemovedFromWhitelist(address indexed user);
    event AddressBlacklisted(address indexed user);
    event AddressRemovedFromBlacklist(address indexed user);

    // ✅ OZ v5 requires passing msg.sender to Ownable constructor
    constructor() ERC721("Marketplace Tokens", "MPT") Ownable(msg.sender) {}

    modifier onlyAllowed() {
        if (blacklist[msg.sender]) revert("You are banned");
        if (whitelistEnabled && !whitelist[msg.sender]) revert("Not whitelisted");
        _;
    }

    function addToWhitelist(address user) external onlyOwner {
        whitelist[user] = true;
        emit AddressWhitelisted(user);
    }

    function removeFromWhitelist(address user) external onlyOwner {
        whitelist[user] = false;
        emit AddressRemovedFromWhitelist(user);
    }

    function addToBlacklist(address user) external onlyOwner {
        blacklist[user] = true;
        emit AddressBlacklisted(user);
    }

    function removeFromBlacklist(address user) external onlyOwner {
        blacklist[user] = false;
        emit AddressRemovedFromBlacklist(user);
    }

    function isWhitelisted(address user) public view returns (bool) {
        return whitelist[user];
    }

    function isBlacklisted(address user) public view returns (bool) {
        return blacklist[user];
    }

    function setWhitelistEnabled(bool enabled) external onlyOwner {
        whitelistEnabled = enabled;
    }

    function createToken(string memory tokenURI, uint256 price)
        public
        payable
        whenNotPaused
        onlyAllowed
        returns (uint256)
    {
        _trackUser(msg.sender);
        if (msg.value != mintingFee + listingPrice) revert InsufficientPayment();

        adminFunds += mintingFee + listingPrice;

        // ✅ Plain increment instead of Counters
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        createMarketItem(newTokenId, price);

        return newTokenId;
    }

    function createMarketItem(uint256 tokenId, uint256 price) private {
        if (price <= 0) revert InvalidPrice();

        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);
        emit MarketItemCreated(tokenId, msg.sender, address(this), price, false);
    }

    function createMarketSale(uint256 tokenId) public payable whenNotPaused onlyAllowed {
        _trackUser(msg.sender);
        uint256 price = idToMarketItem[tokenId].price;
        address seller = idToMarketItem[tokenId].seller;

        if (msg.value != price) revert InsufficientPayment();

        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;
        idToMarketItem[tokenId].seller = payable(address(0));
        _itemsSold++;

        _transfer(address(this), msg.sender, tokenId);

        userBalances[seller] += msg.value;
        adminFunds += listingPrice;
    }

    function resellToken(uint256 tokenId, uint256 price) public payable whenNotPaused onlyAllowed {
        _trackUser(msg.sender);
        if (idToMarketItem[tokenId].owner != msg.sender) revert NotOwner();
        if (msg.value != listingPrice) revert InsufficientPayment();

        adminFunds += listingPrice;

        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].owner = payable(address(this));

        _itemsSold--;
        _transfer(msg.sender, address(this), tokenId);
    }

    function withdrawMyFunds() public {
        uint256 balance = userBalances[msg.sender];
        if (balance == 0) revert NoFunds();

        userBalances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
    }

    function withdrawAdminFunds() public onlyOwner {
        if (adminFunds == 0) revert NoFunds();

        uint256 amount = adminFunds;
        adminFunds = 0;
        payable(owner()).transfer(amount);
    }

    function getMyBalance() public view returns (uint256) {
        return userBalances[msg.sender];
    }

    function updateListingPrice(uint256 _listingPrice) public onlyOwner {
        listingPrice = _listingPrice;
    }

    function updateMintingFee(uint256 _mintingFee) public onlyOwner {
        mintingFee = _mintingFee;
    }

    function deleteNFT(uint256 tokenId) public onlyOwner {
        // ✅ _exists() removed in OZ v5 — use ownerOf with try/catch
        try this.ownerOf(tokenId) returns (address) {
            _burn(tokenId);
            delete idToMarketItem[tokenId];
        } catch {
            revert TokenDoesNotExist();
        }
    }

    function fetchAllNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds;
        MarketItem[] memory items = new MarketItem[](totalItemCount);

        for (uint256 i = 0; i < totalItemCount; i++) {
            items[i] = idToMarketItem[i + 1];
        }

        return items;
    }

    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenIds;
        uint256 unsoldCount = _tokenIds - _itemsSold;
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(this)) {
                items[currentIndex] = idToMarketItem[i + 1];
                currentIndex++;
            }
        }
        return items;
    }

    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                items[currentIndex] = idToMarketItem[i + 1];
                currentIndex++;
            }
        }

        return items;
    }

    function fetchItemsListed() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                items[currentIndex] = idToMarketItem[i + 1];
                currentIndex++;
            }
        }

        return items;
    }

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function getMintingFee() public view returns (uint256) {
        return mintingFee;
    }

    function cancelListing(uint256 tokenId) public {
        MarketItem storage item = idToMarketItem[tokenId];
        if (item.seller != msg.sender) revert OnlySeller();
        if (item.owner != address(this)) revert ItemNotListed();
        if (item.sold) revert ItemAlreadySold();

        item.owner = payable(msg.sender);
        item.seller = payable(address(0));
        item.sold = true;

        _itemsSold++;
        _transfer(address(this), msg.sender, tokenId);
    }

    function getOwnedTokenIds(address user) public view returns (uint256[] memory) {
        uint256 totalItemCount = _tokenIds;
        uint256 count = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (ownerOf(i + 1) == user) count++;
        }

        uint256[] memory result = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (ownerOf(i + 1) == user) {
                result[index] = i + 1;
                index++;
            }
        }

        return result;
    }

    function isListed(uint256 tokenId) public view returns (bool) {
        return idToMarketItem[tokenId].owner == address(this) && !idToMarketItem[tokenId].sold;
    }

    function getMarketItem(uint256 tokenId) public view returns (
        uint256, address, address, uint256, bool
    ) {
        MarketItem memory item = idToMarketItem[tokenId];
        return (item.tokenId, item.seller, item.owner, item.price, item.sold);
    }

    function getMyListings() public view returns (MarketItem[] memory) {
        uint256 total = _tokenIds;
        uint256 count = 0;

        for (uint256 i = 0; i < total; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender && !idToMarketItem[i + 1].sold) {
                count++;
            }
        }

        MarketItem[] memory items = new MarketItem[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < total; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender && !idToMarketItem[i + 1].sold) {
                items[index] = idToMarketItem[i + 1];
                index++;
            }
        }

        return items;
    }

    function mintOnly(string memory tokenURI) public payable whenNotPaused onlyAllowed returns (uint256) {
        _trackUser(msg.sender);
        if (msg.value != mintingFee) revert InsufficientPayment();

        adminFunds += mintingFee;

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        return newTokenId;
    }

    function getMarketItemOwner(uint256 tokenId) public view returns (address) {
        return idToMarketItem[tokenId].owner;
    }

    function getTotalTokens() public view returns (uint256) {
        return _tokenIds;
    }

    function updatePrice(uint256 tokenId, uint256 newPrice) public {
        MarketItem storage item = idToMarketItem[tokenId];
        if (item.seller != msg.sender) revert OnlySeller();
        if (item.owner != address(this)) revert ItemNotListed();
        if (item.sold) revert ItemAlreadySold();
        if (newPrice <= 0) revert InvalidPrice();

        item.price = newPrice;
    }

    function getAdminFunds() public view onlyOwner returns (uint256) {
        return adminFunds;
    }

    function pauseContract() public onlyOwner {
        _pause();
    }

    function unpauseContract() public onlyOwner {
        _unpause();
    }

    function _trackUser(address user) internal {
        if (!userTracked[user]) {
            allUsers.push(user);
            userTracked[user] = true;
        }
    }

    function getAllUsers() public view onlyOwner returns (address[] memory) {
        return allUsers;
    }
}
