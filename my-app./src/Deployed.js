import React, { useState, useEffect } from "react";
import "./App.css";

const Deployed = () => {
    const [index, setIndex] = useState(0);
    const fullMessage1 = "SMART CONTRACT DEPLOYED ";
    const [displayedMessage1, setDisplayedMessage1] = useState("");

    const fullMessage2 = "AWAITING TRIGGER EVENT FOR SELF-EXECUTION";
    const [displayedMessage2, setDisplayedMessage2] = useState("");

    const delayBetweenMessages = 1000; // 1 second delay between messages
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        if (
            index <
            fullMessage1.length +
                fullMessage2.length +
                delayBetweenMessages / 100
        ) {
            const typingTimer = setTimeout(() => {
                if (index < fullMessage1.length) {
                    setDisplayedMessage1(fullMessage1.substring(0, index + 1));
                } else {
                    setDisplayedMessage2(
                        fullMessage2.substring(
                            0,
                            index -
                                fullMessage1.length -
                                delayBetweenMessages / 100 +
                                1
                        )
                    );
                }
                setIndex(index + 1);
            }, 100);

            return () => clearTimeout(typingTimer);
        } else {
            setTimeout(() => setShowButton(true), 500); // Delay before showing the button
        }
    }, [index, fullMessage1, fullMessage2, delayBetweenMessages]);

    return (
        <div className="App" style={{ backgroundColor: "black" }}>
            <header className="App-header" style={{ backgroundColor: "black" }}>
                <p>
                    {displayedMessage1}
                    {index < fullMessage1.length && (
                        <span className="cursor"></span>
                    )}
                </p>
                <p>
                    {displayedMessage2}
                    {index >= fullMessage1.length &&
                        index <
                            fullMessage1.length +
                                fullMessage2.length +
                                delayBetweenMessages / 100 && (
                            <span className="cursor"></span>
                        )}
                </p>
                {showButton && (
                    <button
                        className="tronButton"
                        onClick={() => {
                            // set path to /migration
                            window.location.href = "/migration";
                        }}
                    >
                        VIEW DEPLOYMENT
                    </button>
                )}
            </header>
        </div>
    );
};

export default Deployed;
