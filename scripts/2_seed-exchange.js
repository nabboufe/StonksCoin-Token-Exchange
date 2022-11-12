const config = require("../src/config.json");

const { ethers } = require("hardhat");

const tokens = (n) => BigInt(ethers.utils.parseUnits(n.toString(), 'ether'));

const wait = async (sec) => {
    const ms = sec * 1000;
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const account = await ethers.getSigners();
    const { chainId } = await ethers.provider.getNetwork();
    console.log(`Using chainID: ${chainId}\n`);

    const user1 = account[0];
    const user2 = account[1];

    const amount = tokens(40000);

    const stonksAddress = config[chainId].StonksCoin.address;
    const coincoinAddress = config[chainId].CoinCoin.address;
    const mEthAddress = config[chainId].mEth.address;
    const exchangeAddress = config[chainId].Exchange.address;

    const StonksCoin = await ethers.getContractAt("Token", stonksAddress);
    const CoinCoin = await ethers.getContractAt("Token", coincoinAddress);
    const mEth = await ethers.getContractAt("Token", mEthAddress);
    const exchange = await ethers.getContractAt("Exchange", exchangeAddress);

    console.log(
        `StonksCoin Token fetched: ${StonksCoin.address}\n` +
        `CoinCoin Token fetched: ${CoinCoin.address}\n` +
        `mEth Token fetched: ${mEth.address}\n` +
        `Exchange fetched: ${exchange.address}\n`
    );

    let transaction, result;
    transaction = await CoinCoin.connect(user1).transfer(user2.address, amount);
    console.log(
        `Transferred ${amount} tokens from ${user1.address} to ${user2.address}`
    );

    transaction = await StonksCoin.connect(user1).approve(exchange.address, amount);
    await transaction.wait();
    console.log(`Approved ${amount} StonksCoin from ${user1.address}`);

    transaction = await exchange.connect(user1).depositToken(StonksCoin.address, amount);
    await transaction.wait();
    console.log(`Deposited ${amount} StonksCoin from ${user1.address}\n`);

    transaction = await CoinCoin.connect(user2).approve(exchange.address, amount);
    await transaction.wait();
    console.log(`Approved ${amount} CoinCoin from ${user2.address}`);

    transaction = await exchange.connect(user2).depositToken(CoinCoin.address, amount);
    await transaction.wait();
    console.log(`Deposited ${amount} CoinCoin from ${user2.address}`);

    transaction = await exchange.connect(user1).makeOrder(
        StonksCoin.address, tokens(200),
        CoinCoin.address, tokens(5)
    ); result = await transaction.wait();
    console.log(`${user1.address} made an order to give 200STK and receive 5CC`);

    let ID = result.events[0].args.id;
    transaction = await exchange.connect(user1).cancelOrder(ID);
    console.log(`${user1.address} cancelled order with ID: ${ID}\n`);

    let val1 = [];
    let val2 = [];

    //await wait(0.2);
    for(let i = 0; i <= 5; i++) {
        val1.push(80 + Math.floor(5 * (Math.random() + 1.5) + (i * 1.1)));
        val2.push(100 + Math.floor(10 * (Math.random() + 1.3) + (i * 1.7)));
        transaction = await exchange.connect(user1).makeOrder(
            StonksCoin.address, tokens(val1[i]),
            CoinCoin.address, tokens(val2[i])
        ); result = await transaction.wait()
        console.log(`${user1.address} made an order to give ${val1[i]}STK and receive ${val2[i]}CC`);

        if (i % 2 === 0) {
            ID = result.events[0].args.id;
            transaction = await exchange.connect(user2).fillOrder(ID);
            result = await transaction.wait();
        } await wait(0.1)
    }
    console.log('\n');
    for (let i = 0; i <= 5; i++) {
        transaction = await exchange.connect(user2).makeOrder(
            CoinCoin.address, tokens(val2[i]),
            StonksCoin.address, tokens(val1[i])
        ); result = await transaction.wait();
        console.log(`${user2.address} made an order to give ${val2[i]}CC and receive ${val1[i]}STK`);

        if (i % 2 === 0) {
            ID = result.events[0].args.id;
            transaction = await exchange.connect(user1).fillOrder(ID);
            result = await transaction.wait();
        } await wait(0.1);
    }
}

main()
  .catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
