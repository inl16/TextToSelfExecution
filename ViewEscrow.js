import React, { useState } from "react";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import TokenRWA from "./TokenRWA.json";
import "./ViewEscrow.css";

const CONTRACT_ADDRESS = "0x34f7f2E30a569bB33aaC5c7f77605225Cbe4a0e0"; // Replace with actual contract address

const ViewEscrow = () => {
    const [tokenId, setTokenId] = useState("");
    const [escrowData, setEscrowData] = useState(null);
    const [feedback, setFeedback] = useState("");
    const navigate = useNavigate();

    const fetchEscrowDetails = async () => {
        try {
            if (!window.ethereum) {
                alert("Please install MetaMask.");
                return;
            }

            const web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: "eth_requestAccounts" });

            const contract = new web3.eth.Contract(TokenRWA.abi, CONTRACT_ADDRESS);

            // Call the escrows mapping to get escrow data for the specified tokenId
            const data = await contract.methods.escrows(tokenId).call();
            setEscrowData({
                earnestPaid: web3.utils.fromWei(data.earnestPaid, "ether") + " ETH",
                remainingBalance: web3.utils.fromWei(data.remainingBalance, "ether") + " ETH",
                buyer: data.buyer,
                isActive: data.isActive,
                isApproved: data.isApproved,
            });
            setFeedback("");
        } catch (error) {
            console.error("Error fetching escrow details:", error);
            setFeedback("Failed to fetch escrow details. Ensure Token ID is valid.");
        }
    };

    return (
        <div className="escrow-interface">
            <h2>View Escrow Details</h2>
            <p>Enter the Token ID to view the escrow details for a specific land plot.</p>

            <input
                type="text"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Enter Token ID"
                className="token-input"
            />
            <button onClick={fetchEscrowDetails} className="view-button">
                View Escrow
            </button>

            {feedback && <p className="feedback">{feedback}</p>}

            {escrowData && (
                <div className="escrow-details">
                    <p><strong>Earnest Paid:</strong> {escrowData.earnestPaid}</p>
                    <p><strong>Remaining Balance:</strong> {escrowData.remainingBalance}</p>
                    <p><strong>Buyer Address:</strong> {escrowData.buyer}</p>
                    <p><strong>Escrow Active:</strong> {escrowData.isActive ? "Yes" : "No"}</p>
                    <p><strong>Purchase Approved:</strong> {escrowData.isApproved ? "Yes" : "No"}</p>
                </div>
            )}

            {/* Button to navigate to the seller's approve purchase page */}
            <button onClick={() => navigate("/approve-purchase")} className="approve-button">
                Approve Purchase
            </button>
        </div>
    );
};

export default ViewEscrow;
