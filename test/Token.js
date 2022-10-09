const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token", () => {
    const tokens = (n) => 
        ethers.utils.parseUnits(n.toString(), 'ether');

    const supply = 1000000;
    const addressZero = "0x0000000000000000000000000000000000000000";
    const totalSupply = tokens(supply);
    let token, accounts, deployer, receiver;

    beforeEach(async () => {
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy('StonksCoin', 'STK', '1000000');
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        receiver = accounts[1];
    });

    describe('Deployement', () => {
        const name = 'StonksCoin';
        const symbol = 'STK';
        const decimals = 18;

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
        it("assign total supply to deployer", async () => {
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
        });
    });

    describe("Sending Tokens", () => {
        describe("Success", () => {
            it("transfer token balances", async () => {
                const amount = 1000;
                const _value = tokens(amount);
                const rest = tokens(supply - amount);
    
                const transaction = await token.connect(deployer)
                    .transfer(receiver.address, _value);
                const result = transaction.wait();
    
                expect(await token.balanceOf(deployer.address))
                    .to.equal(rest);
                expect(await token.balanceOf(receiver.address))
                    .to.equal(_value);
            });
            it("emit a Transfer event", async () => {
                const transaction = await token.connect(deployer)
                    .transfer(receiver.address, tokens(0));
                const result = await transaction.wait();
                const event = result.events[0];
    
                expect(event.args._from).to.equal(deployer.address);
                expect(event.args._to).to.equal(receiver.address);
                expect(event.args._value).to.equal(tokens(0));
                expect(event.event).to.equal('Transfer');
            });
        })

        describe("Failure", async () => {
            it("rejects insufficient balances", async () => {
                const invalidAmount = supply + 1;
                const _value = tokens(invalidAmount);

                await expect(token.connect(deployer).
                    transfer(receiver.address, _value)).to.be.reverted;
            });
            it("has invalid recipient", async () => {
                await expect(token.connect(deployer)
                    .transfer(addressZero, '1')).to.be.reverted;
            });
        });
    });

    describe("Approving Tokens", () => {
        describe("Success", () => {
            it("allow for delegated token spending", async () =>{ 
                let _value = tokens(1000);
                let transaction = await token.connect(deployer)
                    .approve(receiver.address, _value);
                let result = await transaction.wait();

                expect(await token.allowance(deployer.address,
                    receiver.address)).to.equal(_value);
            });
            it("emit Approval event", async () =>{ 
                let _value = tokens(1000);
                let transaction = await token.connect(deployer)
                    .approve(receiver.address, _value);
                let result = await transaction.wait();
                let event = result.events[0];

                expect(event.args._owner).to.equal(deployer.address);
                expect(event.args.spender).to.equal(receiver.address);
                expect(event.args[2]).to.equal(_value);
                expect(event.event).to.equal("Approval");
            });
        });
        describe("Failure", () => {
            it("has invalid spender address", async () => {
                await expect(token.connect(deployer)
                    .approve(addressZero, "1")).to.be.reverted;
            })
        });
    });

    describe("Delegated Token Transfers", () => {
        beforeEach(async () => {
            let transaction = await token.connect(deployer)
                .approve(receiver.address, tokens(1000));
            let result = await transaction.wait();
        })

        describe("Success", () => {
            let _value, transaction, result, amount;

            beforeEach(async () => {
                amount = 1000;
                _value = tokens("1000");
                transaction = await token.connect(deployer)
                    .transferFrom(deployer.address, receiver.address, _value);
                result = await transaction.wait();
            });

            it("transfer tokens when allowed to", async () => {
                expect(await token.balanceOf(deployer.address))
                    .to.equal(tokens(supply - amount));
                expect(await token.balanceOf(receiver.address))
                    .to.equal(_value);
            });
            it("emit a Transfer event", async () => {
                let event = result.events[0];

                expect(event.args._from).to.equal(deployer.address);
                expect(event.args._to).to.equal(receiver.address);
                expect(event.args[2]).to.equal(_value);
                expect(event.event).to.equal("Transfer");
            });
            it("reduces allowance", async () => {
                expect(await token.allowance(deployer.address,
                    receiver.address)).to.equal("0");
            })
        });
        describe("Failure", () => {
            it("reject insufficient balance", async () => {
                await token.connect(deployer)
                    .approve(receiver.address, tokens(supply + 1));

                await expect(token.connect(deployer).transferFrom(deployer.address,
                    receiver.address, tokens(supply + 1))).to.be.reverted;
            });
            it("reject insufficient allowance", async () => {
                await expect(token.transferFrom(deployer.address,
                    receiver.address, tokens(1000 + 1))).to.be.reverted;
            })
        })
    })

});
