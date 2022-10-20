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

    const amount = tokens(10000);

    const stonksAddress = config[chainId].StonksCoin.address;
    const coincoinAddress = config[chainId].CoinCoin.address;
    const mDaiAddress = config[chainId].mDai.address;
    const exchangeAddress = config[chainId].Exchange.address;

    const StonksCoin = await ethers.getContractAt("Token", stonksAddress);
    const CoinCoin = await ethers.getContractAt("Token", coincoinAddress);
    const mDai = await ethers.getContractAt("Token", mDaiAddress);
    const exchange = await ethers.getContractAt("Exchange", exchangeAddress);

    console.log(
        `StonksCoin Token fetched: ${StonksCoin.address}\n` +
        `CoinCoin Token fetched: ${CoinCoin.address}\n` +
        `mDai Token fetched: ${mDai.address}\n` +
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

    await wait(1);

    transaction = await exchange.connect(user1).makeOrder(
        StonksCoin.address, tokens(200),
        CoinCoin.address, tokens(20)
    ); result = await transaction.wait()
    console.log(`${user1.address} made an order to give 200STK and receive 20CC`);

    ID = result.events[0].args.id;
    transaction = await exchange.connect(user2).fillOrder(ID);
    result = await transaction.wait();
    console.log(`Filled order from ${user1.address} by ${user2.address}\n`);
  
    await wait(1);
    
    transaction = await exchange.makeOrder(
        StonksCoin.address, tokens(100),
        CoinCoin.address, tokens(30)
    ); result = await transaction.wait();
    console.log(`${user1.address} made an order to give 100STK and receive 30CC`);


    ID = result.events[0].args.id;
    transaction = await exchange.connect(user2).fillOrder(ID);
    result = await transaction.wait();
    console.log(`Filled order from ${user1.address} by ${user2.address}\n`);

    await wait(1);

    transaction = await exchange.connect(user1).makeOrder(
        StonksCoin.address, tokens(400),
        CoinCoin.address, tokens(40)
    ); result = await transaction.wait();
    console.log(`${user1.address} made an order to give 400STK and receive 40CC`);

    ID = result.events[0].args.id;
    transaction = await exchange.connect(user2).fillOrder(ID);
    result = await transaction.wait();
    console.log(`Filled order from ${user1.address} by ${user2.address}\n`);
  
    await wait(1);

    for(let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(user1).makeOrder(
            StonksCoin.address, tokens(10 * i),
            CoinCoin.address, tokens(5 * i)
        ); result = await transaction.wait()
        console.log(`${user1.address} made an order to give ${10 * i}STK and receive ${5 * i}CC`);

        await wait(1)
    }
    console.log('\n');
    for (let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(user2).makeOrder(
            CoinCoin.address, tokens(5 * 1),
            StonksCoin.address, tokens(10 * i)
        ); result = await transaction.wait();
        console.log(`${user2.address} made an order to give ${5 * i}CC and receive ${10 * i}STK`);

        await wait(1)
    }
}

main()
  .catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
