require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.POLYGON_MUMBAI,
      accounts: [process.env.WALLET_PRIVATE_KEY],
    },
  },
};


