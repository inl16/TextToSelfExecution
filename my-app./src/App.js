import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Migration from "./Migration"; // Adjust this path if necessary
import "./App.css"; // Assuming you have some global styles you want to apply
import Activate from "./Activate";
import Deployed from "./Deployed";

const App = () => {
    return (
        <Router>
            {/* <div> */}
            {/* <nav className="navigation-menu">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/migration">Migration</Link>
            </li>
          </ul>
        </nav> */}

            {/* Define the routes for your application */}
            <Routes>
                <Route path="/activate" element={<Activate />} />
                <Route path="/deployed" element={<Deployed />} />
                <Route path="/migration" element={<Migration />} />
                {/* Define a route for the home page or other components as needed */}
                <Route path="/" element={<Home />} />
            </Routes>
            {/* </div> */}
        </Router>
    );
};

// A simple Home component for demonstration
const Home = () => {
    return (
        <div>
            <h2>Home Page</h2>
            <p>
                Welcome to the Home Page. Navigate to different parts of the app
                using the links above.
            </p>
        </div>
    );
};

export default App;
