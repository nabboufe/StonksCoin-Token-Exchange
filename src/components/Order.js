import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { makeBuyOrder, makeSellOrder } from "../store/interactions";

const Order = () => {

    const provider = useSelector(state => state.provider.connection);
    const exchange = useSelector(state => state.exchange.contract);
    const tokens = useSelector(state => state.tokens.contracts);

    const [switchState, setSwitchState] = useState(["tab--active", "", "Buy"])
    const [amount, setAmount] = useState(0);
    const [price, setPrice] = useState(0);

    const dispatch = useDispatch();
    const handleForm = (e) => {
        e.preventDefault();

        if (switchState[2] === "Buy") {
            makeBuyOrder(
                provider,
                exchange,
                tokens,
                {amount: amount.value,
                 price: price.value},
                dispatch
            );
        }
        else if (switchState[2] === "Sell") {
            makeSellOrder(
                provider,
                exchange,
                tokens,
                {amount: amount.value,
                 price: price.value},
                dispatch
            );
        }
        setAmount({ value: 0 });
        setPrice({ value: 0 });
    }

    const switchButton = (e) => {
        if (e.target.innerText === "Buy") {
            if (switchState[0] !== "tab--active") {
                setSwitchState(["tab--active", "", "Buy"]);
            }
        }
        if (e.target.innerText === "Sell") {
            if (switchState[1] !== "tab--active") {
                setSwitchState(["", "tab--active", "Sell"]);
            }
        }
    }

    return (
        <div className="component exchange__orders">
            <div className='component__header flex-between'>
                <h2>New Order</h2>
                <div className='tabs'>
                    <button
                        onClick={switchButton}
                        className={`tab ${switchState[0]}`}
                    >
                        Buy
                    </button>
                    <button
                        onClick={switchButton}
                        className={`tab ${switchState[1]}`}
                    >
                        Sell
                    </button>
                </div>
            </div>
  
            <form onSubmit={handleForm}>

                <label htmlFor="amount">
                    {switchState[2]} Amount
                </label>
                <input
                    onChange={(e) => setAmount({ value : e.target.value })}
                    value={amount.value === 0 ? "" : amount.value}
                    type="text"
                    id="amount"
                    placeholder="0.000"
                />
  
                <label htmlFor="price">
                    {switchState[2]} Price
                </label>
                <input
                    onChange={(e) => setPrice({ value : e.target.value })}
                    value={price.value === 0 ? "" : price.value}
                    type="text"
                    id="price"
                    min="0"
                    placeholder="0.000"
                />
  
                <button className='button button--filled' type='submit'>
                    <span>{`${switchState[2]} Order`}</span>
                </button>
            </form>
        </div>
    );
  }
  
  export default Order;