const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Exchange", () => {
    let deployer, feeAccount, accounts, exchange, user1;
    const feePercent = 5;
    const tokens = (n) =>
        BigInt(ethers.utils.parseUnits(n.toString(), 'ether'));
    
    const amount = tokens(1000);
    
    beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        user1 = accounts[2];
        user2 = accounts[3];

        const Token = await ethers.getContractFactory("Token");
        token1 = await Token.deploy('StonksCoin', 'STK', '1000000');
        token2 = await Token.deploy('CoinCoin', 'CC', '1000000');

        token1.connect(deployer).transfer(user1.address, amount);
        token2.connect(deployer).transfer(user2.address, amount);

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
            console.log("eventName:", result.events[0].event);
            event = result.events[1];
        });

        describe("Success", () => {
            it("track token deposit", async () => {
                expect(await token1.balanceOf(exchange.address)).to.equal(amount);
                expect(await token1.balanceOf(user1.address)).to.equal(tokens(0));
                expect(await exchange.deposit(token1.address, user1.address)).to.equal(amount);
            });
            it("emit Deposit event", async () => {
                expect(event.event).to.equal("Deposit");
                expect(event.args._token).to.equal(token1.address);
                expect(event.args._user).to.equal(user1.address);
                expect(event.args._balance).to.equal(amount);
                expect(event.args._amount).to.equal(amount);
            });
        });
        describe("Failure", () => {
            it("reject token transfer not approved by owner", async () => {
                token1.connect(deployer).transfer(user1.address, 1);
                await expect(exchange.connect(user1)
                    .depositToken(token1.address, 1)).to.be.reverted;
            });
        });
    });

    describe("Withdraw token", () => {
        let event;

        beforeEach(async () => {
            const approval = await token1.connect(user1)
                .approve(exchange.address, amount);
            const transaction = await exchange.connect(user1)
                .depositToken(token1.address, amount);
            const withdraw = await exchange.connect(user1)
                .withdrawToken(token1.address, amount);
            const result = await withdraw.wait();
            event = result.events[1];
        });

        describe("Success", async () => {
            it("withdraw token funds", async () => {
                expect(await token1.balanceOf(exchange.address)).to.equal(tokens(0));
                expect(await token1.balanceOf(user1.address)).to.equal(amount);
                expect(await exchange.deposit(token1.address, user1.address)).to.equal(tokens(0));
            });
            it("emit Deposit event", async () => {
                expect(event.event).to.equal("Withdraw");
                expect(event.args._token).to.equal(token1.address);
                expect(event.args._user).to.equal(user1.address);
                expect(event.args._balance).to.equal(tokens(0));
                expect(event.args._amount).to.equal(amount);
            });
        });
        describe("Failure", async () => {
            it("reject withdraw when amount is greater than deposit", async () => {
                await expect(exchange.connect(user1)
                    .withdrawToken(token1.address, amount)).to.be.reverted;
            });
        });
    });

    describe("Making orders", () => {
        let event;
        let amountGive = tokens(100);
        let amountGet = tokens(50);

        describe("Success", async () => {
            beforeEach(async () => {
                const approval = await token1.connect(user1)
                    .approve(exchange.address, amount);
                await approval.wait();

                const transaction = await exchange.connect(user1)
                    .depositToken(token1.address, amount);
                await transaction.wait();

                const order = await exchange.connect(user1)
                    .makeOrder(token1.address, amountGive,
                               token2.address, amountGet);
                let result = await order.wait();
                event = result.events[0];
            });

            it("track token order", async () => {
                const order = await exchange.orders(0);

                expect(order._tokenGive).to.equal(token1.address);
                expect(order._amountGive).to.equal(amountGive);
                expect(order._tokenGet).to.equal(token2.address);
                expect(order._amountGet).to.equal(amountGet);
            });
            it("emit Order event", async () => {
                expect(event.event).to.equal("Order");
                expect(event.args._tokenGive).to.equal(token1.address);
                expect(event.args._amountGive).to.equal(amountGive);
                expect(event.args._tokenGet).to.equal(token2.address);
                expect(event.args._amountGet).to.equal(amountGet);
                expect(event.args.timestamp).to.at.least(1);
                expect(event.args.id).to.equal(0);
            });
        });
        describe("Failure", async () => {
            it("reject order when amount is greater than deposit", async () => {
                    await expect(exchange.connect(user1).makeOrder(
                        token1.address, tokens(1001),
                        token2.address, amountGet)).to.be.reverted;
            });
        });
    });

    describe("Order actions", () => {
        let event;
        let orderID;
        let amountGive = tokens(100);
        let amountGet = tokens(50);

        beforeEach(async () => {
            const approval1 = await token1.connect(user1)
                .approve(exchange.address, amount);
            await approval1.wait();

            const approval2 = await token2.connect(user2)
                .approve(exchange.address, amount);
            await approval2.wait();

            const transaction1 = await exchange.connect(user1)
                .depositToken(token1.address, amount);
            await transaction1.wait();
    
            const transaction2 = await exchange.connect(user2)
                .depositToken(token2.address, amount);
            await transaction2.wait();

            const order = await exchange.connect(user1)
                .makeOrder(token1.address, amountGive,
                        token2.address, amountGet);
            
            orderID = (await order.wait()).events[0].args.id;
        });
        describe("Cancelling orders", () => {
            describe("Success", () => {
                beforeEach(async () => {
                    const cancel = await exchange.connect(user1)
                        .cancelOrder(0);
                    let result = await cancel.wait();
                    event = result.events[0];
                });

                it("cancel desired order", async () => {
                    expect(await exchange.orderCancelled(0)).to.equal(true);
                });
                it("emit Cancel event", async () => {
                    expect(event.event).to.equal('Cancel');
                    expect(event.args._tokenGive).to.equal(token1.address);
                    expect(event.args._amountGive).to.equal(amountGive);
                    expect(event.args._tokenGet).to.equal(token2.address);
                    expect(event.args._amountGet).to.equal(amountGet);
                    expect(event.args.timestamp).to.at.least(1);
                    expect(event.args.id).to.equal(0);
                });
            });
            describe("Failure", () => {
                it("reject unauthorized user to cancel order", async () => {
                    const order = await exchange.connect(user1)
                        .makeOrder(token1.address, amountGive,
                            token2.address, amountGet);

                    await expect(exchange.connect(user2).cancelOrder(0)).to.be.reverted;
                });
                it("reject cancelling non-existant order", async () => {
                    const order = await exchange.connect(user1)
                        .makeOrder(token1.address, amountGive,
                            token2.address, amountGet);

                    await expect(exchange.connect(user2).cancelOrder(10)).to.be.reverted;
                });
            });

            describe("Filling orders", () => {
                let feeValue;
                let user2loss;
                describe("Success", () => {
                    beforeEach(async () => {
                        const fill = await exchange.connect(user2).fillOrder(orderID);
                        const result = await fill.wait()
                        feeValue = (amountGet * BigInt(5)) / BigInt(100);
                        user2loss = feeValue + amountGet;
    
                        event = result.events[0];
                    });

                    it("trade tokens successfully", async () => {
                        expect(await exchange.deposit(token1.address, user1.address))
                            .to.equal(amount - amountGive);
                        expect(await exchange.deposit(token2.address, user2.address))
                            .to.equal(amount - user2loss);
                        expect(await exchange.deposit(token2.address, feeAccount.address))
                            .to.equal(feeValue);
                        expect(await exchange.deposit(token2.address, user1.address))
                            .to.equal(amountGet);
                        expect(await exchange.deposit(token1.address, user2.address))
                            .to.equal(amountGive);
                    });

                    it("emit Trade event", async () => {
                        expect(event.event).to.equal('Trade');
                        expect(event.args.orderingUser).to.equal(user1.address);
                        expect(event.args.fulfillingUser).to.equal(user2.address);
                        expect(event.args._tokenGive).to.equal(token1.address);
                        expect(event.args._amountGive).to.equal(amountGive);
                        expect(event.args._tokenGet).to.equal(token2.address);
                        expect(event.args._amountGet).to.equal(amountGet);
                        expect(event.args.timestamp).to.at.least(1);
                        expect(event.args.id).to.equal(0);
                    });
                });
                describe("Failure", () => {
                    it("reject when order does not exist", async () => {
                        await expect(exchange.connect(user1).fillOrder(1))
                            .to.be.reverted;
                    });
                    it("reject when order has been cancelled", async () => {
                        await exchange.connect(user1).cancelOrder(0);
                        await expect(exchange.connect(user2).fillOrder(0))
                            .to.be.reverted;
                    });
                    it("reject when order has already been fulfilled", async () => {
                        await exchange.connect(user2).fillOrder(0);
                        await expect(exchange.connect(user2).fillOrder(0))
                            .to.be.reverted;
                    });
                    it("reject when ordering and fulfilling users are the same", async () => {
                        await expect(exchange.connect(user1).fillOrder(0))
                            .to.be.reverted;
                    });
                    it("reject if fulfilling user has no enought fund to trade and pay fee", async () => {
                        const order = await exchange.connect(user1)
                                        .makeOrder(token1.address, amountGive,
                                            token2.address, amount);
                        
                        await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;
                    })
                });
            });
        });
    });
});