// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract TokenRWA is ERC721, ReentrancyGuard, Ownable {
    uint256 public constant TOTAL_SUPPLY = 100;
    uint256 public constant PLOT_PRICE = 0.1 ether;
    uint256 public constant EARNEST_AMOUNT = 0.02 ether;

    struct Escrow {
        uint256 earnestPaid;
        uint256 remainingBalance;
        address buyer;
        bool isActive;
        bool isApproved;
    }

    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => bool) private _tokenExists;
    address public seller;

    // Updated constructor to accept an owner address and pass it to Ownable
    constructor(address owner) ERC721("LandPlotToken", "LPT") Ownable(owner) {
        seller = owner;

        for (uint256 i = 1; i <= TOTAL_SUPPLY; i++) {
            _safeMint(seller, i);
            _tokenExists[i] = true;
        }
    }

    function isValidToken(uint256 tokenId) public view returns (bool) {
        return tokenId > 0 && tokenId <= TOTAL_SUPPLY && _tokenExists[tokenId];
    }

    function initiatePurchase(uint256 tokenId) external payable nonReentrant {
        require(isValidToken(tokenId), "Invalid token ID");
        require(ownerOf(tokenId) == seller, "Token not for sale");
        require(msg.value == EARNEST_AMOUNT, "Incorrect earnest amount");
        require(!escrows[tokenId].isActive, "Escrow already active for this token");

        escrows[tokenId] = Escrow({
            earnestPaid: msg.value,
            remainingBalance: PLOT_PRICE - msg.value,
            buyer: msg.sender,
            isActive: true,
            isApproved: false
        });
    }

    function approvePurchase(uint256 tokenId) external onlyOwner {
        require(isValidToken(tokenId), "Invalid token ID");
        Escrow storage escrow = escrows[tokenId];
        require(escrow.isActive, "No active escrow for this token");
        require(!escrow.isApproved, "Purchase already approved");

        escrow.isApproved = true;
    }

    function completePurchase(uint256 tokenId) external payable nonReentrant {
        require(isValidToken(tokenId), "Invalid token ID");
        Escrow storage escrow = escrows[tokenId];

        require(escrow.isActive, "No active escrow for this token");
        require(escrow.isApproved, "Purchase not approved by seller");
        require(escrow.buyer == msg.sender, "Not the buyer of this token");
        require(msg.value == escrow.remainingBalance, "Incorrect remaining balance");

        // Mark escrow as inactive
        escrow.isActive = false;

        // Transfer ownership and funds
        _transfer(seller, escrow.buyer, tokenId);
        payable(seller).transfer(escrow.earnestPaid + msg.value);

        delete escrows[tokenId];
    }

    function cancelPurchase(uint256 tokenId) external nonReentrant {
        require(isValidToken(tokenId), "Invalid token ID");
        Escrow storage escrow = escrows[tokenId];

        require(escrow.isActive, "No active escrow to cancel");
        require(escrow.buyer == msg.sender || msg.sender == seller, "Not authorized to cancel");

        // Mark escrow as inactive
        escrow.isActive = false;

        // Refund earnest money
        payable(escrow.buyer).transfer(escrow.earnestPaid);

        delete escrows[tokenId];
    }
}
