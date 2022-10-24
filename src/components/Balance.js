import STKlogo from "../assets/stonks_logo.png";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { loadBalance, transfertTokens } from "../store/interactions";

const Balance = () => {
    const provider = useSelector(state => state.provider.connection);
    const exchange = useSelector(state => state.exchange.contract);
    const tokens = useSelector(state => state.tokens.contracts);
    const account = useSelector(state => state.provider.account);
    const symbols = useSelector(state => state.tokens.symbols);
    const tokenBalance = useSelector(state => state.tokens.balances);
    const exchangeBalance = useSelector(state => state.exchange.balances);
    const transferInProgress = useSelector(state => state.exchange.transferInProgress);

    const [tokenOneAmount, setTokenOneAmount] = useState(0);

    const dispatch = useDispatch();

    useEffect(() => {
        if (exchange && tokens && tokens[0] && tokens[1] && account) {
            loadBalance(exchange, tokens, account, dispatch);
        }
    }, [exchange, tokens, account, transferInProgress, dispatch]);

    const tokenChange = async (e, token) => {
        if (token.address === tokens[0].address) {
            await setTokenOneAmount({
                value: e.target.value,
            });
        }
    }

    const depositHandler = async (e, token) => {
        e.preventDefault();

        if (token.address === tokens[0].address) {
            transfertTokens(
                provider,
                exchange,
                "Deposit",
                token,
                tokenOneAmount.value,
                dispatch
            );
            setTokenOneAmount({ value: 0 });
        }
    }

    return (
        <div className='component exchange__transfers'>
            <div className='component__header flex-between'>
                <h2>Balance</h2>
                <div className='tabs'>
                    <button className='tab tab--active'>Deposit</button>
                    <button className='tab'>Withdraw</button>
                </div>
            </div>
  
            {/* Deposit/Withdraw Component 1 (DApp) */}
  
            <div className='exchange__transfers--form'>
                <div className='flex-between'>
                    <p>
                        <small>Token</small>
                        <br />
                        <img className="currency" src={STKlogo} alt="Token Logo"/>
                        {symbols && symbols[0]}
                    </p>
                    <p>
                        <small>Wallet</small>
                        <br />
                        {tokenBalance && tokenBalance[0]}
                    </p>
                    <p>
                        <small>Exchange</small>
                        <br />
                        {exchangeBalance && exchangeBalance[0]}
                    </p>
                </div>
  
                <form onSubmit={(e) => depositHandler(e, tokens[0])}>
                    <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
                    <input
                        placeholder="0.000"
                        type="number"
                        id='token0'
                        min="0"
                        value={tokenOneAmount.value === 0 ? '' : tokenOneAmount.value }
                        onChange={(e) => tokenChange(e, tokens[0])}
                    />
                    <button className='button' type='submit'>
                        <span>Deposit</span>
                    </button>
                </form>
            </div>
  
            <hr />
  
            {/* Deposit/Withdraw Component 2 (mETH) */}
  
            <div className='exchange__transfers--form'>
                <div className='flex-between'>
                </div>
  
                <form>
                    <label htmlFor="token1"></label>
                    <input type="text" id='token1' placeholder='0.0000'/>
  
                    <button className='button' type='submit'>
                        <span></span>
                    </button>
                </form>
    
            </div>

            <hr />

        </div>
    );
}

export default Balance;
  