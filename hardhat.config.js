require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const privateKey1 = process.env.PRIVATE_KEY_1 || "";
const privateKey2 = process.env.PRIVATE_KEY_2 || "";
const gorliAPI = process.env.GORLI_API_KEY || "";
const polygonAPI = process.env.POLYGON_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    localhost: {},
    goerli: {
      url: `https://goerli.infura.io/v3/${gorliAPI}`,
      accounts: [privateKey1, privateKey2]
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${polygonAPI}`,
      accounts: [privateKey1, privateKey2]
    },
  },

};
