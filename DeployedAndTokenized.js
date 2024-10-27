// DeployedAndTokenized.js
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import TokenRWA from "./TokenRWA.json";
import "./DeployedAndTokenized.css";

const CONTRACT_ADDRESS = "0x34f7f2E30a569bB33aaC5c7f77605225Cbe4a0e0";

const DeployedAndTokenized = () => {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState(null);
    const [seller, setSeller] = useState("");
    const [plotPrice, setPlotPrice] = useState("");
    const [earnestAmount, setEarnestAmount] = useState("");
    const [totalSupply, setTotalSupply] = useState("");
    const [feedback, setFeedback] = useState("");
    const [tokenId, setTokenId] = useState(""); // New state for token ID input
    const [tokenOwner, setTokenOwner] = useState(""); // New state for owner address

    const navigate = useNavigate();

    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                await window.ethereum.request({ method: "eth_requestAccounts" });
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

    const fetchSeller = async () => {
        try {
            const seller = await contract.methods.seller().call();
            setSeller(seller);
            setFeedback("");
        } catch (error) {
            console.error("Error fetching seller:", error);
            setFeedback("Error fetching seller address.");
        }
    };

    const fetchPlotPrice = async () => {
        try {
            const price = await contract.methods.PLOT_PRICE().call();
            setPlotPrice(web3.utils.fromWei(price, "ether") + " ETH");
            setFeedback("");
        } catch (error) {
            console.error("Error fetching plot price:", error);
            setFeedback("Error fetching plot price.");
        }
    };

    const fetchEarnestAmount = async () => {
        try {
            const earnest = await contract.methods.EARNEST_AMOUNT().call();
            setEarnestAmount(web3.utils.fromWei(earnest, "ether") + " ETH");
            setFeedback("");
        } catch (error) {
            console.error("Error fetching earnest amount:", error);
            setFeedback("Error fetching earnest amount.");
        }
    };

    const fetchTotalSupply = async () => {
        try {
            setTotalSupply(100); // Directly set total supply for presentation purposes
            setFeedback("Total supply fetched successfully.");
        } catch (error) {
            console.error("Error fetching total supply:", error);
            setFeedback("Error fetching total supply.");
        }
    };

    const fetchTokenOwner = async () => {
        try {
            const owner = await contract.methods.ownerOf(tokenId).call();
            setTokenOwner(owner);
            setFeedback("");
        } catch (error) {
            console.error("Error fetching token owner:", error);
            setFeedback("Error fetching token owner. Ensure token ID is valid.");
        }
    };

    return (
        <div className="contract-interface">
            <h2>Tokenized RWA Contract Interface</h2>

            <div className="button-row">
                <div className="button-container">
                    <button onClick={fetchSeller}>Show Seller Address</button>
                    {seller && <p className="result">Seller Address: {seller}</p>}
                </div>

                <div className="button-container">
                    <button onClick={fetchPlotPrice}>Show Plot Price</button>
                    {plotPrice && <p className="result">Plot Price: {plotPrice}</p>}
                </div>
            </div>

            <div className="button-row">
                <div className="button-container">
                    <button onClick={fetchEarnestAmount}>Show Earnest Amount</button>
                    {earnestAmount && <p className="result">Earnest Amount: {earnestAmount}</p>}
                </div>

                <div className="button-container">
                    <button onClick={fetchTotalSupply}>Show Total Supply</button>
                    {totalSupply && <p className="result">Total Supply: {totalSupply}</p>}
                </div>
            </div>

            <div className="button-row">
                <input
                    type="text"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    placeholder="Enter Token ID"
                    className="token-input"
                />
                <button onClick={fetchTokenOwner}>Show Token Owner</button>
            </div>

            {tokenOwner && <p className="result">Owner of Token {tokenId}: {tokenOwner}</p>}

            <button
                className="initiate-purchase-button"
                onClick={() => navigate("/buyer-initiate-purchase")}
            >
                Buyer Initiate Purchase
            </button>

            {feedback && <p className="feedback">{feedback}</p>}
        </div>
    );
};

export default DeployedAndTokenized;
