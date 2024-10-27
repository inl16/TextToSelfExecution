import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import "./Deployed.css";

const fullMessage1 = "SMART CONTRACT DEPLOYED";
const fullMessage2 = "THE ASSET HAS BEEN TOKENIZED";
const typingSpeed = 100; // Typing speed for messages (in ms)
const delayBetweenMessages = 1000; // 1 second delay between messages

const Deployed = () => {
    const [index, setIndex] = useState(0);
    const [displayedMessage1, setDisplayedMessage1] = useState("");
    const [displayedMessage2, setDisplayedMessage2] = useState("");
    const [showButton, setShowButton] = useState(false);

    const navigate = useNavigate(); // Initialize navigate for routing

    useEffect(() => {
        if (index < fullMessage1.length + fullMessage2.length + delayBetweenMessages / typingSpeed) {
            const typingTimer = setTimeout(() => {
                if (index < fullMessage1.length) {
                    setDisplayedMessage1(fullMessage1.substring(0, index + 1));
                } else {
                    setDisplayedMessage2(
                        fullMessage2.substring(
                            0,
                            index - fullMessage1.length - delayBetweenMessages / typingSpeed + 1
                        )
                    );
                }
                setIndex(index + 1);
            }, typingSpeed);

            return () => clearTimeout(typingTimer);
        } else {
            setTimeout(() => setShowButton(true), 500); // Delay before showing the button
        }
    }, [index]);

    return (
        <div className="App" style={{ backgroundColor: "black" }}>
            <header className="App-header">
                <p>
                    {displayedMessage1}
                    {index < fullMessage1.length && <span className="cursor"></span>}
                </p>
                <p>
                    {displayedMessage2}
                    {index >= fullMessage1.length && index < fullMessage1.length + fullMessage2.length + delayBetweenMessages / typingSpeed && (
                        <span className="cursor"></span>
                    )}
                </p>
                {showButton && (
                    <button
                        className="tronButton"
                        onClick={() => navigate("/deployed-and-tokenized")} // Use navigate to go to DeployedAndTokenized
                    >
                        VIEW DEPLOYMENT
                    </button>
                )}
            </header>
        </div>
    );
};

export default Deployed;
