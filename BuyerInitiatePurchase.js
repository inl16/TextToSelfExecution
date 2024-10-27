import React, { useState } from "react";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import TokenRWA from "./TokenRWA.json";
import "./BuyerInitiatePurchase.css"; // Import the corresponding CSS file

const CONTRACT_ADDRESS = "0x34f7f2E30a569bB33aaC5c7f77605225Cbe4a0e0";

const BuyerInitiatePurchase = () => {
    const [tokenId, setTokenId] = useState("");
    const [feedback, setFeedback] = useState("");
    const EARNEST_AMOUNT = "0.02"; // Earnest amount in Ether
    const navigate = useNavigate();

    const initiatePurchase = async () => {
        try {
            if (!window.ethereum) {
                alert("Please install MetaMask.");
                return;
            }

            const web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const accounts = await web3.eth.getAccounts();

            const contract = new web3.eth.Contract(TokenRWA.abi, CONTRACT_ADDRESS);

            await contract.methods.initiatePurchase(tokenId).send({
                from: accounts[0],
                value: web3.utils.toWei(EARNEST_AMOUNT, "ether"),
            });

            setFeedback("Purchase initiated successfully!");
        } catch (error) {
            console.error("Error initiating purchase:", error);
            setFeedback("Failed to initiate purchase. Ensure token ID is valid and available.");
        }
    };

    return (
        <div className="purchase-interface">
            <h2>Initiate Purchase of Land Plot</h2>
            <p>Enter the Token ID for the plot you wish to purchase.</p>

            <input
                type="text"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Enter Token ID"
                className="token-input"
            />
            <button onClick={initiatePurchase} className="purchase-button">
                Initiate Purchase
            </button>

            {feedback && <p className="feedback">{feedback}</p>}

            {/* Button to navigate to the View Escrow page */}
            <button
                onClick={() => navigate("/view-escrow")}
                className="view-escrow-button"
            >
                View Escrow
            </button>
        </div>
    );
};

export default BuyerInitiatePurchase;
