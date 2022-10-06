const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token", () => {
    const tokens = (n) => ethers.utils.parseUnits(n.toString(), 'ether');
    let token;

    beforeEach(async () => {
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy('StonksCoin', 'STK', '1000000');
    });

    describe('Deployement', () => {
        const name = 'StonksCoin';
        const symbol = 'STK';
        const decimals = 18;
        const totalSupply = tokens('1000000');

        it("has correct name", async () => {
            expect(await token.name()).to.equal(name);
        });
        it("has correct symbol", async () => {
            expect(await token.symbol()).to.equal(symbol);
        });
        it("has correct decimals", async () => {
            expect(await token.decimals()).to.equal(decimals);
        });
        it("has correct totalSupply", async () => {
            expect(await token.totalSupply()).to.equal(totalSupply);
        });
    })
});
