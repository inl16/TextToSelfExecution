// ApprovePurchase.js
import React, { useState } from "react";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import TokenRWA from "./TokenRWA.json";
import "./ApprovePurchase.css";

const CONTRACT_ADDRESS = "0x34f7f2E30a569bB33aaC5c7f77605225Cbe4a0e0";

const ApprovePurchase = () => {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState(null);
    const [tokenId, setTokenId] = useState("");
    const [feedback, setFeedback] = useState("");

    const navigate = useNavigate();

    // Initialize Web3 and contract on component mount
    useState(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                setWeb3(web3Instance);

                const accounts = await web3Instance.eth.getAccounts();
                setAccount(accounts[0]);

                const contractInstance = new web3Instance.eth.Contract(
                    TokenRWA.abi,
                    CONTRACT_ADDRESS
                );
                setContract(contractInstance);
            } else {
                alert("Please install MetaMask to use this feature.");
            }
        };

        initWeb3();
    }, []);

    const handleApprovePurchase = async () => {
        if (!contract || !tokenId) {
            setFeedback("Please enter a valid token ID.");
            return;
        }

        try {
            await contract.methods
                .approvePurchase(tokenId)
                .send({ from: account });
            setFeedback(`Purchase for token ID ${tokenId} has been approved.`);
        } catch (error) {
            console.error("Error approving purchase:", error);
            setFeedback("Error approving purchase.");
        }
    };

    return (
        <div className="approve-purchase-interface">
            <h2>Approve Purchase</h2>
            <input
                type="text"
                className="token-input"
                placeholder="Enter Token ID"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
            />
            <button className="approve-button" onClick={handleApprovePurchase}>
                Approve Purchase
            </button>
            {feedback && <p className="feedback">{feedback}</p>}

            <button
                className="complete-purchase-button"
                onClick={() => navigate("/complete-purchase")}
            >
                Proceed to Complete Purchase
            </button>
        </div>
    );
};

export default ApprovePurchase;
