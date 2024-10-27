import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Deployed from "./Deployed";
import DeployedAndTokenized from "./DeployedAndTokenized";
import BuyerInitiatePurchase from "./BuyerInitiatePurchase";
import ViewEscrow from "./ViewEscrow";
import ApprovePurchase from "./ApprovePurchase";
import CompletePurchase from "./CompletePurchase"; // Import the new component

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Deployed />} />
                <Route
                    path="/deployed-and-tokenized"
                    element={<DeployedAndTokenized />}
                />
                <Route
                    path="/buyer-initiate-purchase"
                    element={<BuyerInitiatePurchase />}
                />
                <Route path="/view-escrow" element={<ViewEscrow />} />
                <Route path="/approve-purchase" element={<ApprovePurchase />} />
                <Route
                    path="/complete-purchase"
                    element={<CompletePurchase />}
                />{" "}
                {/* New route */}
            </Routes>
        </Router>
    );
}

export default App;
