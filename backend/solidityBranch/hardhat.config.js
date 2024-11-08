require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition");
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "c47c6ba5b3659070cdbf56d1b5fe29c4f5f138afe4ad5447781babafab6d47b9";

module.exports = {
  solidity: "0.8.19",
  networks: {
    arbitrum: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      accounts: [PRIVATE_KEY]
    },
    arbitrumLocal: {
      url: "http://localhost:8545",
      chainId: 412346,
      accounts: [PRIVATE_KEY]
    }
  }
};
