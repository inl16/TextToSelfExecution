import React, { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import MigrationContract from "./Migration.json";
import "./Migration.css";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

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
            bets.push({ account, amount: amount || defaultAmount, direction });
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

// Example usage:
const texts = [
    "Account 1 bets that the price of ETH will go up. Account 2 bets that the price of ETH will go down. Each bets 0.1 ETH. The winner of the ETH gets the contract.",
    "Account 1 bets 0.1 ETH that the price of ETH will decrease. Account 2 bets 0.1 ETH that the price of ETH will increase. The winner of the ETH gets the contract.",
];

texts.forEach((text) => console.log(extractBettingInfo(text)));

const MigrationActions = () => {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState("");
    const [textInput, setTextInput] = useState(""); // State to store the input from the text box
    const [parseResults, setParseResults] = useState([]); // To store and display parsed results
    const [parsedBets, setParsedBets] = useState([]);
    const [contract, setContract] = useState(null);
    const [betInfo, setBetInfo] = useState([]);
    const [eventTriggered, setEventTriggered] = useState(false); // Add this line

    const [betAmount, setBetAmount] = useState("");
    const [betHigher, setBetHigher] = useState(true);
    const [feedback, setFeedback] = useState("");
    const [initialPrice, setInitialPrice] = useState("");
    const [secondPrice, setSecondPrice] = useState("");
    const [roundIdInput, setRoundIdInput] = useState("");
    const [bettingRoundDetails, setBettingRoundDetails] = useState(null);
    const [roundWinners, setRoundWinners] = useState([]);
    const [socket, setSocket] = useState(null);
    const [output, setOutput] = useState("");
    const [countdown, setCountdown] = useState(null);

    const triggerSeleniumScript = async () => {
        try {
            // Assuming your Node.js backend is running on http://localhost:4000
            const response = await fetch(
                "http://localhost:8000/start-selenium",
                {
                    method: "POST",
                }
            );
            const data = await response.json();
            console.log(data.message); // Handle response from the backend
        } catch (error) {
            console.error("Error triggering Selenium script:", error);
        }
    };

    const navigate = useNavigate();
    useEffect(() => {
        // Establish the socket connection in a separate useEffect
        const newSocket = io("http://localhost:4000");
        setSocket(newSocket);

        newSocket.on("script-output", (data) => {
            // Append the new data to the existing output
            setOutput((prevOutput) => prevOutput + data);
        });

        // Cleanup function to disconnect the socket when the component unmounts
        return () => newSocket.disconnect();
    }, []);

    const runScript = () => {
        socket.emit("run-script");
        setCountdown(50);
        setEventTriggered(false);
    };

    const parsetext = () => {
        const results = extractBettingInfo(textInput);
        setParseResults(results); // Update state with parsed bets
        // Optionally, trigger Selenium script here:
        triggerSeleniumScript();
    };

    useEffect(() => {
        let interval = null;

        if (countdown > 0) {
            interval = setInterval(() => {
                setCountdown((currentCountdown) => currentCountdown - 1);
            }, 1000);
        } else if (countdown === 0) {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [countdown]);

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

    const fetchInitialPrice = useCallback(async () => {
        if (!contract) {
            console.error(
                "Contract not loaded, make sure you are connected to Ethereum."
            );
            return;
        }
        try {
            const price = await contract.methods.initialPrice().call();
            setInitialPrice(web3.utils.fromWei(price, "ether"));
        } catch (error) {
            console.error("Error fetching initial price:", error);
        }
    }, [contract, web3]);

    const fetchSecondPrice = useCallback(async () => {
        if (!contract) {
            console.error(
                "Contract not loaded, make sure you are connected to Ethereum."
            );
            return;
        }
        try {
            const price = await contract.methods.secondPrice().call();
            setSecondPrice(web3.utils.fromWei(price, "ether"));
        } catch (error) {
            console.error("Error fetching second price:", error);
        }
    }, [contract, web3]);

    // useEffect(() => {
    //     if (contract && web3) {
    //         fetchInitialPrice();
    //     }
    // }, [fetchInitialPrice, contract, web3]);

    const activateBetting = async () => {
        if (!contract) {
            alert(
                "Contract not loaded, make sure you are connected to Ethereum."
            );
            return;
        }
        try {
            await contract.methods.activateBetting().send({ from: account });
            setFeedback("Betting has been activated!");
        } catch (error) {
            console.error("Error activating betting:", error);
            setFeedback(
                "Failed to activate betting. See console for more details."
            );
        }
    };

    const fetchBettingRoundDetails = useCallback(async () => {
        if (!contract || roundIdInput === "") {
            setFeedback("Contract not loaded or no round ID provided.");
            return;
        }
        try {
            const details = await contract.methods
                .getBettingRoundDetails(roundIdInput)
                .call();
            // Assuming details are returned correctly
            setBettingRoundDetails({
                initialPrice: web3.utils.fromWei(details.initialPrice, "ether"),
                finalPrice: web3.utils.fromWei(details.finalPrice, "ether"),
                priceIncreased: details.priceIncreased,
            });
        } catch (error) {
            console.error("Error fetching betting round details:", error);
            setFeedback("Failed to fetch betting round details.");
        }
    }, [contract, roundIdInput, web3]);

    const fetchRoundWinners = useCallback(async () => {
        if (!contract || roundIdInput === "") {
            setFeedback("Contract not loaded or no round ID provided.");
            return;
        }
        try {
            const winners = await contract.methods
                .getRoundWinners(roundIdInput)
                .call();
            setRoundWinners(winners);
        } catch (error) {
            console.error("Error fetching round winners:", error);
            setFeedback("Failed to fetch round winners.");
        }
    }, [contract, roundIdInput]);

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

    const placeBet = async () => {
        if (!contract) {
            setFeedback(
                "Contract not loaded, make sure you are connected to Ethereum."
            );
            return;
        }
        if (!betAmount) {
            setFeedback("Please enter a bet amount.");
            return;
        }
        try {
            await contract.methods.placeBet(betHigher).send({
                from: account,
                value: web3.utils.toWei(betAmount, "ether"),
            });
            setFeedback(
                `Bet of ${betAmount} ETH placed for ${
                    betHigher ? "higher" : "lower"
                }.`
            );
            setBetAmount(""); // Optionally clear the input field after the bet
        } catch (error) {
            console.error("Error placing bet:", error);
            setFeedback(`Failed to place bet: ${error.message}`);
        }
    };

    return (
        <div className="migration-actions">
            <h2>Grid Migration Machine V1.0.0</h2>
            <h2>Text to Self-Execution</h2>
            {/* <div style={{ marginBottom: "20px", width: "100%" }}>
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
                <button
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
                </button>
            </div> */}
            {parseResults.length > 0 && (
                <div>
                    <h3>Parsed Betting Info:</h3>
                    <ul>
                        {parseResults.map((result, index) => (
                            <li key={index}>
                                Account {index + 1}: {result.account} bets{" "}
                                {result.amount} ETH that the price will{" "}
                                {result.direction}.
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <button
                id="run-script-button"
                onClick={runScript}
                style={
                    {
                        /* button styles omitted for brevity */
                    }
                }
            >
                Run Script
            </button>
            {/* Countdown display */}
            {countdown !== null && (
                <div>
                    <p style={{ textAlign: "center" }}>
                        Trigger event will occur in {countdown} seconds.
                    </p>
                    {countdown === 0 && (
                        <p style={{ textAlign: "center" }}>
                            Trigger event occurred!
                        </p>
                    )}
                </div>
            )}
            <div>
                {initialPrice && (
                    <div style={{ textAlign: "center" }}>
                        <h3>Initial Price</h3>
                        <p>
                            {`$${initialPrice
                                .replace(/[0]/g, "")
                                .replace(".", "")
                                .slice(0, 4)}.${initialPrice
                                .replace(/[0]/g, "")
                                .replace(".", "")
                                .slice(4)}`}
                        </p>
                    </div>
                )}
                <button onClick={fetchInitialPrice}>Fetch Initial Price</button>
            </div>
            <div>
                {secondPrice && (
                    <p style={{ textAlign: "center" }}>
                        Second Price:{" "}
                        {`$${secondPrice
                            .replace(/[0]/g, "")
                            .replace(".", "")
                            .slice(0, 4)}.${secondPrice
                            .replace(/[0]/g, "")
                            .replace(".", "")
                            .slice(4)}`}
                    </p>
                )}
                <button onClick={fetchSecondPrice}>Fetch Second Price</button>
            </div>
            <div>
                {/* <button onClick={activateBetting}>Activate Betting</button> */}
                <button onClick={checkBettingStatus}>
                    Check Betting Status
                </button>
            </div>
            <div>
                <h3>Place Your Bet</h3>
                <input
                    type="text"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="Bet Amount in ETH"
                />
                <select
                    value={betHigher}
                    onChange={(e) => setBetHigher(e.target.value === "true")}
                >
                    <option value="true">Higher</option>
                    <option value="false">Lower</option>
                </select>
                {feedback && <p style={{ textAlign: "center" }}>{feedback}</p>}

                <button onClick={placeBet}>Place Bet</button>
            </div>
            <div>
                <input
                    type="text"
                    value={roundIdInput}
                    onChange={(e) => setRoundIdInput(e.target.value)}
                    placeholder="Enter Round ID"
                />
                <button onClick={fetchBettingRoundDetails}>
                    View Betting Round Details
                </button>
                <button onClick={fetchRoundWinners}>View Round Winners</button>
            </div>
            {bettingRoundDetails && (
                <div>
                    <h3>Betting Round Details</h3>
                    {bettingRoundDetails ? (
                        <ul
                            style={{
                                textAlign: "center",
                                listStyle: "none",
                                padding: 0,
                            }}
                        >
                            <li>
                                Initial Price:
                                {` $${bettingRoundDetails.initialPrice
                                    .replace(/[0]/g, "")
                                    .replace(".", "")
                                    .slice(
                                        0,
                                        4
                                    )}.${bettingRoundDetails.initialPrice
                                    .replace(/[0]/g, "")
                                    .replace(".", "")
                                    .slice(4)}`}
                            </li>
                            <li>
                                Final Price:
                                {` $${bettingRoundDetails.finalPrice
                                    .replace(/[0]/g, "")
                                    .replace(".", "")
                                    .slice(
                                        0,
                                        4
                                    )}.${bettingRoundDetails.finalPrice
                                    .replace(/[0]/g, "")
                                    .replace(".", "")
                                    .slice(4)}`}
                            </li>
                            <li>
                                Price Increased:{" "}
                                {bettingRoundDetails.priceIncreased.toString()}
                            </li>
                        </ul>
                    ) : (
                        <p>No details fetched</p>
                    )}
                </div>
            )}
            {roundWinners && roundWinners.length > 0 && (
                <div>
                    <h3>Round Winners</h3>
                    {roundWinners.length > 0 ? (
                        <ul
                            style={{
                                listStyle: "none",
                                textAlign: "center",
                                padding: 0,
                            }}
                        >
                            {roundWinners.map((winner, index) => (
                                <li key={index}>
                                    Contract Self-Executed. {winner} won the
                                    round via trigger event.
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No winners fetched</p>
                    )}
                </div>
            )}
            {/* If you're using routing */}
            {/* <button onClick={() => navigate("/")}>Back to Home Page</button> */}
        </div>
    );
};

export default MigrationActions;
