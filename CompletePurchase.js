// CompletePurchase.js
import React, { useState } from "react";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import TokenRWA from "./TokenRWA.json";
import "./CompletePurchase.css"; // Import the corresponding CSS file

const CONTRACT_ADDRESS = "0x34f7f2E30a569bB33aaC5c7f77605225Cbe4a0e0";

const CompletePurchase = () => {
    const [tokenId, setTokenId] = useState("");
    const [feedback, setFeedback] = useState("");
    const navigate = useNavigate();

    const completePurchase = async () => {
        try {
            if (!window.ethereum) {
                alert("Please install MetaMask.");
                return;
            }

            const web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const accounts = await web3.eth.getAccounts();

            const contract = new web3.eth.Contract(TokenRWA.abi, CONTRACT_ADDRESS);

            // Fetch the remaining balance for the token from the contract
            const escrow = await contract.methods.escrows(tokenId).call();
            const remainingBalance = escrow.remainingBalance;

            await contract.methods.completePurchase(tokenId).send({
                from: accounts[0],
                value: remainingBalance,
            });

            setFeedback("Purchase completed successfully!");
        } catch (error) {
            console.error("Error completing purchase:", error);
            setFeedback("Failed to complete purchase. Ensure token ID is valid and escrow is approved.");
        }
    };

    return (
        <div className="complete-purchase-interface">
            <h2>Complete Purchase of Land Plot</h2>
            <p>Enter the Token ID to complete the purchase.</p>

            <input
                type="text"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Enter Token ID"
                className="token-input"
            />
            <button onClick={completePurchase} className="complete-button">
                Complete Purchase
            </button>

            {feedback && <p className="feedback">{feedback}</p>}

            {/* Button to navigate to the Token RWA Interface page */}
            <button onClick={() => navigate("/deployed-and-tokenized")} className="rwa-interface-button">
                Back to Token RWA Interface Page
            </button>
        </div>
    );
};

export default CompletePurchase;
