import { createSelector } from "reselect";
import moment from "moment";
import { get, groupBy, reject, maxBy, minBy } from "lodash";

import { ethers } from "ethers";

const GREEN = "#25CE8F";
const RED = "#F45353";

const tokens = state => get(state, "tokens.contracts");
const cancelledOrders = state => get(state, "exchange.cancelledOrders.data", []);
const filledOrders = state => get(state, "exchange.filledOrders.data", []);
const allOrders = state => get(state, "exchange.allOrders.data", []);

const openOrders = state => {
    const all = allOrders(state);
    const filled = filledOrders(state);
    const cancelled = cancelledOrders(state);

    const openOrders = reject(all, (order) => {
        const orderFilled = filled.some((o) => o.id.toString()
            === order.id.toString());
        const orderCancelled = cancelled.some((o) => o.id.toString()
            === order.id.toString());
        return orderFilled || orderCancelled;
    })

    return openOrders;
}

const decorateOrder = (order, tokens) => {
    let token0Amount, token1Amount;

    if (order._tokenGive === tokens[1].address) {
        token0Amount = order._amountGive;
        token1Amount = order._amountGet;
    } else {
        token0Amount = order._amountGet;
        token1Amount = order._amountGive;
    }

    const precision = 100000;
    let tokenPrice = (token1Amount / token0Amount);
    tokenPrice = Math.round(tokenPrice * precision) / precision;
    return ({
        ...order,
        formattedTimestamp: moment.unix(order.timestamp).format("h:mm:ssa d MMM D"),
        token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
        token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
        tokenPrice,
    })
}

const decorateOrderBookOrder = (order, tokens) => {
    const orderType = order._tokenGive === 
        tokens[1].address ? "buy" : "sell";

    return ({
        ...order,
        orderType,
        orderTypeClass: (orderType === "buy" ? GREEN : RED),
        orderFillAction: (orderType === "buy" ? "sell" : "buy")
    })
}

const decorateOrderBookOrders = (orders, tokens) => {
    return(
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateOrderBookOrder(order, tokens)
            return order;
        })
    )
}

export const orderBookSelector = createSelector(
        openOrders, tokens, (orders, tokens) => {
    
    if (!tokens[0] || !tokens[1]) { return ; }

    //filter by selected market (tokens)    
    orders = orders.filter(
        (order) =>  order._tokenGive === tokens[0].address ||
                    order._tokenGive === tokens[1].address);
    orders = orders.filter(
        (order) =>  order._tokenGet === tokens[0].address ||
                    order._tokenGet === tokens[1].address);

    //Decorate orders
    orders = decorateOrderBookOrders(orders, tokens);
    orders = groupBy(orders, "orderType");

    const buyOrders = get(orders, 'buy', []);
    const sellOrders = get(orders, 'sell', []);

    orders = {
        ...orders,
        buyOrders: buyOrders.sort((a, b) =>
            b.tokenPrice - a.tokenPrice),
        sellOrders: sellOrders.sort((a, b) =>
            b.tokenPrice - a.tokenPrice)
    }

    return orders;
})

//Chart selector

const buildGraphData = (orders) => {
    orders = groupBy(orders, (order) =>
        moment.unix(order.timestamp).startOf("minutes").format()
    )
    const times = Object.keys(orders);
    console.log(times);
    const graphData = times.map((time) => {

        const group = orders[time];
        const open = group[0];
        const high = maxBy(group, "tokenPrice");
        const low = minBy(group, "tokenPrice");
        const close = group[group.length - 1];

        return({
            x: new Date(time),
            y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
        })
    })
    return graphData;
}

export const priceChartSelector = createSelector(
        filledOrders,
        tokens,
        (orders, tokens) => {
    
    if (!tokens[0] || !tokens[1]) { return ; }

    orders = orders.filter(
        (order) =>  order._tokenGive === tokens[0].address ||
                    order._tokenGive === tokens[1].address);
    orders = orders.filter(
        (order) =>  order._tokenGet === tokens[0].address ||
                    order._tokenGet === tokens[1].address);
    
    orders = orders.map((order) => decorateOrder(order, tokens));

    const lastOrder = orders[orders.length - 1];
    const lastPrice = get(lastOrder, "tokenPrice", 0);

    const secondLastOrder = orders[orders.length - 2];
    const secondLastPrice = get(secondLastOrder, "tokenPrice", 0);

    return {
        lastPrice,
        lastPriceChange: (lastPrice >= secondLastPrice ? "+" : "-"),
        series : [{
            data: buildGraphData(orders)
        }]
    };
})

const decorateFilledOrder = (order, previousOrder) => {
    let isHigher = previousOrder.tokenPrice <= order.tokenPrice;

    return ({
        ...order,
        orderTypeClass: isHigher ? GREEN : RED,
    });
}

const decorateFilledOrders = (orders, tokens) => {
    let previousOrder = orders[0];

    return (
        orders.map((order) => {
            order = decorateOrder(order, tokens);
            order = decorateFilledOrder(order, previousOrder)
            previousOrder = order;
            return order;
        })
    );
}

export const filledOrdersSelector = createSelector(
        filledOrders,
        tokens,
        (orders, tokens) => {

    if (!tokens[0] || !tokens[1]) { return ; }

    orders = orders.filter(
        (order) =>  order._tokenGive === tokens[0].address ||
                    order._tokenGive === tokens[1].address);
    orders = orders.filter(
        (order) =>  order._tokenGet === tokens[0].address ||
                    order._tokenGet === tokens[1].address);
    
    orders = orders.sort((a, b) => a.timestamp - b.timestamp);
    orders = decorateFilledOrders(orders, tokens);
    orders = orders.sort((a, b) => b.timestamp - a.timestamp);

    return orders;
})
