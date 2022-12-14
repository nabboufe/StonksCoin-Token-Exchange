import { ethers } from 'ethers';

import TOKEN_ABI from '../abis/Token.json';
import EXCHANGE_ABI from '../abis/Exchange.json';

export const loadProvider = (dispatch) => {
    console.log(window.ethereum);
    const connection = new ethers.providers.Web3Provider(window.ethereum);
    dispatch({ type: 'PROVIDER_LOADED', connection });

    return connection;
}

export const loadNetwork = async (provider, dispatch) => {
    const { chainId } = await provider.getNetwork();
    dispatch({ type: 'NETWORK_LOADED', chainId });
    
    return chainId;
}

export const loadAccount = async (provider, dispatch) => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = ethers.utils.getAddress(accounts[0]);
    dispatch({ type: 'ACCOUNT_LOADED', account });

    let balance = await provider.getBalance(account);
    balance = ethers.utils.formatEther(balance);
    dispatch({ type: 'ACCOUNT_BALANCE_LOADED', balance });

    return account;
}

export const loadTokens = async (provider, addresses, dispatch) => {
    let token1 = new ethers.Contract(addresses[0], TOKEN_ABI, provider);
    let symbol1 = await token1.symbol();

    let token2 = new ethers.Contract(addresses[1], TOKEN_ABI, provider);
    let symbol2 = await token2.symbol();

    dispatch({
        type: 'TOKEN_LOADED',
        token: [token1, token2],
        symbol: [symbol1, symbol2]
    });

    return [token1, token2];
}

export const loadExchange = async (provider, address, dispatch) => {
    const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
    dispatch({ type: 'EXCHANGE_LOADED', exchange });

    return exchange;
}

export const loadBalance = async (exchange, tokens, account, dispatch) => {
    let walletBalance = await tokens[0].balanceOf(account);
    let depositBalance = await exchange.deposit(tokens[0].address, account);
    walletBalance = ethers.utils.formatUnits(walletBalance, 18);
    depositBalance = ethers.utils.formatUnits(depositBalance, 18);

    dispatch({ type: "TOKEN1_BALANCE_LOADED", walletBalance });
    dispatch({ type: "EXCHANGE_TOKEN1_BALANCE_LOADED", depositBalance });

    walletBalance = await tokens[1].balanceOf(account);
    depositBalance = await exchange.deposit(tokens[1].address, account);
    walletBalance = ethers.utils.formatUnits(walletBalance, 18);
    depositBalance = ethers.utils.formatUnits(depositBalance, 18);

    dispatch({ type: "TOKEN2_BALANCE_LOADED", walletBalance });
    dispatch({ type: "EXCHANGE_TOKEN2_BALANCE_LOADED", depositBalance });
}

export const suscribeToEvents = (exchange, dispatch) => {
    exchange.on("Deposit", (_token, _user, _amount, _balance, event ) => {
        dispatch({ type: "TRANSFER_SUCCESS", event });
    });
    exchange.on("Withdraw", (_token, _user, _amount, _balance, event ) => {
        dispatch({ type: "TRANSFER_SUCCESS", event });
    });
    exchange.on("Order", (orderingUser, timestamp, id, _tokenGive,
        _amountGive, _tokenGet, _amountGet, event) => {

        const order = event.args;
        dispatch({ type: "ORDER_SUCCESS", order, event });
    });
    exchange.on("Cancel", (orderingUser, timestamp, id, _tokenGive,
            _amountGive, _tokenGet, _amountGet, event) => {

        const order = event.args;
        dispatch({ type: "CANCEL_SUCCESS", order, event });
    });
    exchange.on("Trade", (orderingUser, fulfillingUser, timestamp, id,
            _tokenGive, amountGive, _tokenGet, _amountGet, event) => {

        const order = event.args;
        dispatch({ type: "TRADE_SUCCESS", order, event });
    });
}

export const transfertTokens = async (
        provider, exchange, transferType,
        token, _amount, dispatch) => {

    let transaction;
    dispatch({ type: "TRANSFER_REQUEST" });
 
    console.log("ah oui oui", _amount.toString());

    try {
        const signer = await provider.getSigner();
        const amount = ethers.utils.parseUnits(_amount.toString(), 18);

        if (transferType === "Deposit") {
            transaction = await token.connect(signer).approve(exchange.address, amount, {gasLimit: 5000000});
            await transaction.wait();
            transaction = await exchange.connect(signer).depositToken(token.address, amount, {gasLimit: 5000000});
        } 
        else if (transferType === "Withdraw") {
            transaction = await exchange.connect(signer).withdrawToken(token.address, amount, {gasLimit: 5000000});
        }
        await transaction.wait();
    } 
    catch (error) {
        console.error(error);
        dispatch({ type: "TRANSFER_FAIL" });
    }
}

export const makeBuyOrder = async (
        provider, exchange, tokens, order, dispatch) => {
    
    const tokenGive = tokens[1].address;
    const amountGive = ethers.utils.parseUnits((order.amount * order.price).toString(), 18)

    const tokenGet = tokens[0].address;
    const amountGet = ethers.utils.parseUnits(order.amount.toString(), 18);

    dispatch({ type: "ORDER_REQUEST" });

    try {
        const signer = await provider.getSigner();
        const transaction = await exchange.connect(signer)
            .makeOrder(tokenGive, amountGive, tokenGet, amountGet);
        await transaction.wait();
    } catch (error) {
        console.error(error);
        dispatch({ type: "ORDER_FAIL" });
    }
}

export const makeSellOrder = async (
        provider, exchange, tokens, order, dispatch) => {

    const tokenGive = tokens[0].address;
    const amountGive = ethers.utils.parseUnits(order.amount.toString(), 18)

    const tokenGet = tokens[1].address;
    const amountGet = ethers.utils.parseUnits((order.amount * order.price).toString(), 18);

    dispatch({ type: "ORDER_REQUEST" });

    try {
        const signer = await provider.getSigner();
        const transaction = await exchange.connect(signer)
            .makeOrder(tokenGive, amountGive, tokenGet, amountGet);
        await transaction.wait();
    } catch (error) {
        console.error(error);
        dispatch({ type: "ORDER_FAIL" });
    }
}

export const loadAllOrders = async (provider, exchange, dispatch) => {
    const block = await provider.getBlockNumber();

    const cancelStream = await exchange.queryFilter("Cancel", block - 3000, block);
    const cancelledOrders = cancelStream.map(event => event.args);
    dispatch({ type: "CANCELLED_ORDERS_LOADED", cancelledOrders });

    const tradeStream = await exchange.queryFilter("Trade", block - 3000, block);
    const filledOrders = tradeStream.map(event => event.args);
    dispatch({ type: "FILLED_ORDERS_LOADED", filledOrders });


    const orderStream = await exchange.queryFilter("Order", block - 3000, block);
    const allOrders = orderStream.map(event => event.args);
    dispatch({ type: "ALL_ORDERS_LOADED", allOrders });
}

export const cancelOrder = async (provider, exchange, ID, dispatch) => {
    dispatch({ type: "CANCEL_REQUEST" });

    try {
        const signer = await provider.getSigner();
        const transaction = await exchange.connect(signer).cancelOrder(ID);
        await transaction.wait();
    } catch (error) {
        console.error(error);
        dispatch({ type: "CANCEL_FAIL" });
    }
}

export const makeTrade = async (provider, exchange, ID, dispatch) => {
    dispatch({ type: "TRADE_REQUEST" });

    try {
        const signer = await provider.getSigner();
        const transaction = await exchange.connect(signer).fillOrder(ID);
        await transaction.wait();
    } catch (error) {
        console.error(error);
        dispatch({ type: "TRADE_FAIL" })
    }
}
