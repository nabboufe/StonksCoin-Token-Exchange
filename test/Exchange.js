const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Exchange", () => {
    let deployer, feeAccount, accounts, exchange, user1;
    const addressZero = "0x0000000000000000000000000000000000000000";
    const feePercent = 5;
    const tokens = (n) =>
        ethers.utils.parseUnits(n.toString(), 'ether');
    
    const amount = tokens(1000);
    const check = tokens(1000);
    const supply = 1000000;
    const totalSupply = tokens(supply);

    
    beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        user1 = accounts[2];

        const Token = await ethers.getContractFactory("Token");
        token1 = await Token.deploy('StonksCoin', 'STK', '1000000');

        token1.connect(deployer).transfer(user1.address, amount);

        const Exchange = await ethers.getContractFactory("Exchange");
        exchange = await Exchange.deploy(
            feeAccount.address, feePercent);
    });

    describe("Deployment", () => {
        it("tracks the fee account", async () => {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address);
        });
        it("tracks the fee percent", async () => {
            expect(await exchange.feePercent()).to.equal(feePercent);
        });
    });

    describe("Depositing tokens", () => {
        let event;

        beforeEach(async () => {
            const approval = await token1.connect(user1)
                .approve(exchange.address, amount);
            const transaction = await exchange.connect(user1)
                .depositToken(token1.address, amount);

            const result = await transaction.wait();
            event = result.events[1];
        })

        describe("Success", () => {
            it("track token deposit", async () => {
                expect(await token1.balanceOf(exchange.address)).to.equal(amount);
                expect(await token1.balanceOf(user1.address)).to.equal(tokens(0));
                expect(await exchange.deposit(token1.address, user1.address)).to.equal(amount);
            });
            it("emit Deposit event", async () => {
                expect(await event.event).to.equal("Deposit");
                expect(await event.args._token).to.equal(token1.address);
                expect(await event.args._user).to.equal(user1.address);
                expect(await event.args._balance).to.equal(amount);
                expect(await event.args._amount).to.equal(amount);
            });
        })
        describe("Failure", () => {
            it("throw if token transfer's not approved by owner", async () => {
                token1.connect(deployer).transfer(user1.address, 1);
                await expect(exchange.connect(user1)
                    .depositToken(token1.address, 1)).to.be.reverted;
            });
        })
    })
})