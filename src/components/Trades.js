import { useSelector } from "react-redux";

import sort from "../assets/sort.svg";

import { filledOrdersSelector } from "../store/selectors";
import Banner from "./Banner";

const Trades = () => {
    const filledOrders = useSelector(filledOrdersSelector);
    const symbols = useSelector(state => state.tokens.symbols);

    return (
        <div className="component exchange__trades">
            <div className='component__header flex-between'>
                <h2>Trades</h2>
            </div>
  
            <table>
                <thead>
                    {filledOrders && filledOrders[0] ?
                        <tr>
                            <th>
                                Time
                                <img src={sort} alt="Sort" />
                            </th>
                            <th>
                                {symbols ? symbols[0] : "Undefined"}
                                <img src={sort} alt="Sort" />
                            </th>
                            <th>
                                {symbols ? `${symbols[0]}/${symbols[1]}`
                                    : "undefined/undefined"}
                                <img src={sort} alt="Sort" />                            
                            </th>
                        </tr> :
                        ""
                    }
                </thead>
                <tbody>
                    {filledOrders && filledOrders[0] ?
                        filledOrders.map((order, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        {order.formattedTimestamp}
                                    </td>
                                    <td
                                        style={{ color: order.orderTypeClass }}
                                    >
                                        {order.token0Amount}
                                    </td>
                                    <td>
                                        {order.tokenPrice}
                                    </td>
                                </tr>
                            )
                        })
                        : 
                        <Banner text="No fulfilled orders" />
                    }
                </tbody>
            </table>
        </div>
    );
}

export default Trades;
