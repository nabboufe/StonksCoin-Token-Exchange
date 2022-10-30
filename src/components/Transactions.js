import { useSelector } from "react-redux";
import { myOpenOrdersSelector } from "../store/selectors";

import Banner from "./Banner";

import { useState, useEffect } from "react";

import sort from "../assets/sort.svg";

const Transactions = () => {
    const [switchState, setSwitchState] = useState(["tab--active", "", "Orders"])
    const symbols = useSelector(state => state.tokens.symbols);
    const myTransact = useSelector(myOpenOrdersSelector);

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

    return (
        <div className="component exchange__transactions">
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
                    {myTransact && myTransact[0] ?
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
                     : ""}


                    <tbody>
                        {myTransact && myTransact[0] ?
                            myTransact.map((order, index) => {
                                return (<tr key={index}>
                                            <td style={{ color: order.orderTypeClass }}>
                                                {order.token0Amount}
                                            </td>

                                            <td>
                                                {order.tokenPrice}
                                            </td>

                                            <td>
                                                {1}
                                            </td>
                                        </tr>);
                            }) :
                            <Banner text="No order available" />
                        }
                    </tbody>
                </table>
            </div>
    
            {/* <div> */}
                {/* <div className='component__header flex-between'> */}
                    {/* <h2>My Transactions</h2> */}
        
                    {/* <div className='tabs'> */}
                        {/* <button className='tab tab--active'>Orders</button> */}
                        {/* <button className='tab'>Trades</button> */}
                    {/* </div> */}
                {/* </div> */}
        
                {/* <table> */}
                    {/* <thead> */}
                        {/* <tr> */}
                            {/* <th></th> */}
                            {/* <th></th> */}
                            {/* <th></th> */}
                        {/* </tr> */}
                    {/* </thead> */}
                    {/* <tbody> */}
        
                        {/* <tr> */}
                            {/* <td></td> */}
                            {/* <td></td> */}
                            {/* <td></td> */}
                        {/* </tr> */}
        
                    {/* </tbody> */}
                {/* </table> */}
    
            {/* </div> */}
        </div>
    )
}
  
export default Transactions;
