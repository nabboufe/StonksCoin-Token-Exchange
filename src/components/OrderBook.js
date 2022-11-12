import { useSelector, useDispatch } from "react-redux";

import { orderBookSelector } from "../store/selectors";
import { makeTrade } from "../store/interactions";

import sort from "../assets/sort.svg";

const OrderBook = () => {
    const provider = useSelector(state => state.provider.connection);
    const exchange = useSelector(state => state.exchange.contract);
    const symbols = useSelector(state => state.tokens.symbols);
    const orderBook = useSelector(orderBookSelector);

    const dispatch = useDispatch();

    const fillOrderHandler = (order) => {
        makeTrade(provider, exchange, order.id, dispatch);
    }

    return (
        <div className="component exchange__orderbook">
            <div className='component__header flex-between'>
                <h2>Order Book</h2>
            </div>
    
            <div className="flex">
    
                {!orderBook ? (<p className="flex-center">No Sell Orders</p>)
                            :
                    (<table className='exchange__orderbook--sell'>
                        
                        <caption>Selling</caption>

                        <thead>
                            <tr>
                                <th>
                                    {symbols && symbols[0]}
                                    <img src={sort} alt="Sort" />
                                </th>
                                <th>
                                    {symbols && symbols[0]}/{symbols && symbols[1]}
                                    <img src={sort} alt="Sort" />
                                </th>
                                <th>
                                    {symbols && symbols[1]}
                                    <img src={sort} alt="Sort" />
                                </th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {orderBook &&
                                orderBook.sellOrders.slice(-10, -1).map((order, index) => {
                                    return (
                                        <tr key={index} onClick={() => fillOrderHandler(order)}>
                                            <td style={{ color: order.orderTypeClass }}>
                                                {order.token0Amount}
                                            </td>

                                            <td style={{ color: order.orderTypeClass }}>
                                                {order.tokenPrice}
                                            </td>

                                            <td style={{ color: order.orderTypeClass }}>
                                                {order.token1Amount}
                                            </td>
                                        </tr>
                                    )
                                })}
                        </tbody>

                     </table>)}

            <div className='divider'></div>

                {!orderBook ? (<p className="flex-center">No Buy Orders</p>)
                            :
                    (<table className='exchange__orderbook--buy'>
                    
                        <caption>Buying</caption>

                        <thead>
                            <tr>
                                <th>
                                    {symbols && symbols[0]}
                                    <img src={sort} alt="Sort" />
                                </th>
                                <th>
                                    {symbols && symbols[0]}/{symbols && symbols[1]}
                                    <img src={sort} alt="Sort" />
                                </th>
                                <th>
                                    {symbols && symbols[1]}
                                    <img src={sort} alt="Sort" />
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {orderBook &&
                                orderBook.buyOrders.slice(-10, -1).map((order, index) => {
                                    return (
                                        <tr key={index} onClick={() => fillOrderHandler(order)}>
                                            <td style={{ color: order.orderTypeClass }}>
                                                {order.token0Amount}
                                            </td>

                                            <td style={{ color: order.orderTypeClass }}>
                                                {order.tokenPrice}
                                            </td>

                                            <td style={{ color: order.orderTypeClass }}>
                                                {order.token1Amount}
                                            </td>
                                        </tr>
                                    )
                                })}
                        </tbody>

                     </table>)}
            </div>
        </div>
    );
}
  
export default OrderBook;