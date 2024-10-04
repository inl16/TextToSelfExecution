const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const MigrationModule = buildModule("MigrationModule", (m) => {
  // Pass the router address as a constructor argument here
  const token = m.contract("Migration", [
    "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0",
  ]);

  return { token };
});

module.exports = MigrationModule;