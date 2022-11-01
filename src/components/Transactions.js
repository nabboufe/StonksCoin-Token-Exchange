import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
    myOpenOrdersSelector,
    myFilledOrderSelector
} from "../store/selectors";
import { cancelOrder } from "../store/interactions";

import Banner from "./Banner";

import sort from "../assets/sort.svg";

const Transactions = () => {
    const [switchState, setSwitchState] = useState(["tab--active", "", "Orders"])

    const symbols = useSelector(state => state.tokens.symbols);
    const myOpenOrders = useSelector(myOpenOrdersSelector);
    const myFilledOrders = useSelector(myFilledOrderSelector);

    const provider = useSelector(state => state.provider.connection);
    const exchange = useSelector(state => state.exchange.contract);
    
    const dispatch = useDispatch();
    
    const switchButton = (e) => {
        if (e.target.innerText === "Orders") {
            if (switchState[0] !== "tab--active") {
                setSwitchState(["tab--active", "", "Orders"]);
            }
        }
        if (e.target.innerText === "Trades") {
            if (switchState[1] !== "tab--active") {
                setSwitchState(["", "tab--active", "Trades"]);
            }
        }
    }

    const cancelHandler = (order) => {
        cancelOrder(provider, exchange, order.id, dispatch)
    }

    return (
        <div className="component exchange__transactions">
            { switchState[2] === "Orders" ?
                <div>
                    <div className='component__header flex-between'>
                        <h2>My Orders</h2>
            
                        <div className='tabs'>

                            <button
                                className={`tab ${switchState[0]}`}
                                onClick={switchButton}
                            >
                                Orders
                            </button>

                            <button
                                className={`tab ${switchState[1]}`}
                                onClick={switchButton}
                            >
                                Trades
                            </button>

                        </div>
                    </div>
        
                    <table>
                        {myOpenOrders && myOpenOrders[0] ?
                            <thead>
                                <tr>
                                <th>{symbols && symbols[0]}</th>
                                <th>
                                    {symbols && `${symbols[0]}/${symbols[1]}`}
                                    <img src={sort} alt="Sort" />
                                </th>
                                <th></th>
                                </tr>
                            </thead>
                        : <thead></thead>}


                        <tbody>
                            {myOpenOrders && myOpenOrders[0] ?
                                myOpenOrders.map((order, index) => {
                                    return (<tr key={index}>
                                                <td style={{ color: order.orderTypeClass }}>
                                                    {order.token0Amount}
                                                </td>

                                                <td>
                                                    {order.tokenPrice}
                                                </td>

                                                <td>
                                                    <button
                                                        className="button--sm"
                                                        onClick={() => cancelHandler(order)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </td>
                                            </tr>);
                                }) :
                                <Banner text="No open order" />
                            }
                        </tbody>
                    </table>
                </div>
                
                :

                <div>

                    <div className='component__header flex-between'>
                        <h2>My Transactions</h2>
            
                        <div className='tabs'>
                            <button
                                onClick={switchButton}
                                className={`tab ${switchState[0]}`}
                            >
                                Orders
                            </button>
                            <button
                                onClick={switchButton}
                                className={`tab ${switchState[1]}`}
                            >
                                Trades
                            </button>
                        </div>
                    </div>

                    <table>
                        <thead>
                            {myFilledOrders && myFilledOrders[0] ?
                                <tr>
                                    <th>
                                        Time
                                        <img src={sort} alt="Sort" />
                                    </th>

                                    <th>
                                        {symbols && symbols[0]}
                                        <img src={sort} alt="Sort" />
                                    </th>

                                    <th>
                                        {symbols[0] && `${symbols[0]}/${symbols[1]}`}
                                        <img src={sort} alt="Sort" />
                                    </th>
                                </tr> : <tr></tr>}
                        </thead>

                        <tbody>
                            {myFilledOrders && myFilledOrders[0] ?
                                myFilledOrders.map((order, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>
                                                {order.formattedTimestamp}
                                            </td>
                                            <td style={{ color: `${order.orderTypeClass}` }}>
                                                {`${order.orderSign}${order.token0Amount}`}
                                            </td>
                                            <td>
                                                {order.tokenPrice}
                                            </td>
                                        </tr>
                                    );
                                }) : <Banner text="No open order" />}
                        </tbody>
                    </table>

                </div>
            }
        </div>
    )
}
  
export default Transactions;
