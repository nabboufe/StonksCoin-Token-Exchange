const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const Token = await ethers.getContractFactory("Token");
  const Exchange = await ethers.getContractFactory("Exchange");
  const account = await ethers.getSigners();

  const stonkscoin = await Token.deploy("StonksCoin", "STK", "1000000");
  await stonkscoin.deployed();
  console.log(`StonksCoin deployed to : ${stonkscoin.address}`);

  const coincoin = await Token.deploy("CoinCoin", "CC", "1000000");
  await coincoin.deployed();
  console.log(`CoinCoin deployed to : ${coincoin.address}`);

  const mDai = await Token.deploy("mDai", "MD", "1000000");
  await mDai.deployed();
  console.log(`mDai deployed to : ${mDai.address}`);

  const exchange = await Exchange.deploy(account[1].address, 5);
  await exchange.deployed();
  console.log(`Exchange deployed to : ${exchange.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
