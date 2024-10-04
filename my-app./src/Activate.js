import React, { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import MigrationContract from "./Migration.json";
import "./Migration.css";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const Activate = () => {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [textInput, setTextInput] = useState(""); // State to store the input from the text box
    const [parseResults, setParseResults] = useState([]); // To store and display parsed results

    function extractBettingInfo(text) {
        // Regex patterns to match different sentence structures.
        const pattern1 =
            /Account (\d+) bets(?: (\d+(\.\d+)?) ETH)? that the price of ETH will (go up|go down|increase|decrease)/g;
        const pattern2 =
            /Account (\d+) bets (\d+(\.\d+)?) ETH that the price of ETH will (go up|go down|increase|decrease)/g;
        const eachBetsPattern = /Each bets (\d+(\.\d+)?) ETH/g;

        let bets = [];
        let eachBetsMatch = eachBetsPattern.exec(text);
        let defaultAmount = eachBetsMatch ? eachBetsMatch[1] : "0.1"; // Default amount if specified by "Each bets X ETH"

        // Function to add or update bet information
        const addOrUpdateBet = (account, amount, direction) => {
            const index = bets.findIndex((bet) => bet.account === account);
            if (index > -1) {
                bets[index].amount = amount || bets[index].amount;
                bets[index].direction = direction;
            } else {
                bets.push({
                    account,
                    amount: amount || defaultAmount,
                    direction,
                });
            }
        };

        let matches;
        while ((matches = pattern1.exec(text)) !== null) {
            const account = `Account ${matches[1]}`;
            const amount = matches[2] || defaultAmount;
            const direction =
                matches[4].includes("increase") || matches[4].includes("up")
                    ? "up"
                    : "down";
            addOrUpdateBet(account, amount, direction);
        }

        while ((matches = pattern2.exec(text)) !== null) {
            const account = `Account ${matches[1]}`;
            const amount = matches[2]; // Amount is always specified in this pattern
            const direction =
                matches[4].includes("increase") || matches[4].includes("up")
                    ? "up"
                    : "down";
            addOrUpdateBet(account, amount, direction);
        }

        return bets;
    }

    const parsetext = () => {
        const results = extractBettingInfo(textInput);
        setParseResults(results); // Update state with parsed bets
        // Optionally, trigger Selenium script here:
        // triggerSeleniumScript();
    };

    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                try {
                    await window.ethereum.request({
                        method: "eth_requestAccounts",
                    });
                    const web3Instance = new Web3(window.ethereum);
                    setWeb3(web3Instance);
                    const accounts = await web3Instance.eth.getAccounts();
                    setAccount(accounts[0]);
                    const contractInstance = new web3Instance.eth.Contract(
                        MigrationContract.abi,
                        "0x538a9c6fe6038791117EEd7a3fAFA6Efe60Ec7c3" // Replace with your actual contract address
                    );
                    setContract(contractInstance);
                } catch (error) {
                    alert(
                        "Failed to load web3, accounts, or contract. Check console for details."
                    );
                    console.error("Initialization error:", error);
                }
            } else {
                alert("Please install MetaMask!");
            }
        };
        initWeb3();
    }, []);

    const [loading, setLoading] = useState(false);

    const activateBetting = async () => {
        if (!contract) {
            alert(
                "Contract not loaded, make sure you are connected to Ethereum."
            );
            return;
        }
        try {
            setLoading(true);
            await contract.methods.activateBetting().send({ from: account });
            // setFeedback("Betting has been activated!");
            setLoading(false);
            window.location.href = "/deployed";
        } catch (error) {
            setLoading(false);

            console.error("Error activating betting:", error);
            setFeedback(
                "Failed to activate betting. See console for more details."
            );
        }
    };

    const checkBettingStatus = async () => {
        if (!contract) {
            console.error(
                "Contract not loaded, make sure you are connected to Ethereum."
            );
            return;
        }
        try {
            const status = await contract.methods.bettingActive().call();
            const statusMessage = `Betting is currently ${
                status ? "active" : "not active"
            }.`;
            setFeedback(statusMessage);
        } catch (error) {
            console.error("Error checking betting status:", error);
        }
    };

    return (
        <div className="migration-actions">
            <h2>Grid Migration Machine V1.0.0</h2>
            <h2>Text to Self-Execution</h2>
            <div style={{ marginBottom: "20px", width: "100%" }}>
                <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter script or command here..."
                    style={{
                        width: "calc(100% - 20px)",
                        height: "150px",
                        backgroundColor: "#000",
                        color: "#fff",
                        border: "1px solid #fff",
                        borderRadius: "4px",
                        padding: "10px",
                        fontFamily: "monospace",
                    }}
                />
                {/* <button
                    id="start-driver"
                    onClick={parsetext}
                    style={{
                        display: "block",
                        width: "100%",
                        marginTop: "10px",
                        padding: "10px 0",
                        backgroundColor: "#444",
                        color: "#fff",
                        border: "1px solid #fff",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Self-Execute
                </button> */}
            </div>

            <div>
                <button onClick={activateBetting}>
                    {loading ? "Deployment in progress" : "Deploy"}
                </button>
                {/* <button onClick={checkBettingStatus}>
                    Check Betting Status
                </button> */}
                {/* <button
                    onClick={() => {
                        window.location.href = "/deployed";
                    }}
                >
                    Continue
                </button> */}
            </div>
        </div>
    );
};

export default Activate;
