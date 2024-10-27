const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const TokenizedRWA = buildModule("TokenRWA", (m) => {
    // Deploy the contract with the specified owner address
    const token = m.contract("TokenRWA", [
        "0x7FC3785B57B9f314296591B68ccB0fe9fAc54D49" // Pass the address to set as the owner
    ]);

    return { token };
});

module.exports = TokenizedRWA;
