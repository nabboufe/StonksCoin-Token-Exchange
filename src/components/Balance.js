import STKlogo from "../assets/stonks_logo.png";
import CClogo from "../assets/coincoin_logo.png";
import mEthlogo from "../assets/eth.svg"

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { loadBalance, transfertTokens } from "../store/interactions";

const Balance = () => {
    const [tokenOneAmount, setTokenOneAmount] = useState("");
    const [tokenTwoAmount, setTokenTwoAmount] = useState("");
    const [tabsStyle, setTabsStyle] = useState(["tab--active", "", "Deposit"]);

    const provider = useSelector(state => state.provider.connection);
    const exchange = useSelector(state => state.exchange.contract);
    const tokens = useSelector(state => state.tokens.contracts);
    const symbols = useSelector(state => state.tokens.symbols);

    const account = useSelector(state => state.provider.account);
    const tokenBalance = useSelector(state => state.tokens.balances);
    const exchangeBalance = useSelector(state => state.exchange.balances);

    const transferInProgress = useSelector(state => state.exchange.transferInProgress);
    const dispatch = useDispatch();

    useEffect(() => {
        if (exchange && tokens && tokens[0] && tokens[1] && account) {
            loadBalance(exchange, tokens, account, dispatch);
        }
    }, [exchange, tokens, account, transferInProgress, dispatch]);

    const tokenChange = async (e, token) => {
        let nan = isNaN(e.target.value);

        if (token.address === tokens[0].address) {
            setTokenOneAmount({ value: nan ? tokenOneAmount.value : e.target.value });
        } if (token.address === tokens[1].address) {
            setTokenTwoAmount({ value: nan ? tokenTwoAmount.value : e.target.value });
        }
    }

    const formHandler = async (e, token) => {
        e.preventDefault();

        if (token.address === tokens[0].address) {
            transfertTokens(
                provider,
                exchange,
                tabsStyle[2],
                token,
                tokenOneAmount.value,
                dispatch
            ); setTokenOneAmount({ value: "" });
        } else if (token.address === tokens[1].address) {
            transfertTokens(
                provider,
                exchange,
                tabsStyle[2],
                token,
                tokenTwoAmount.value,
                dispatch
            ); setTokenTwoAmount({ value: "" });
        }
    }

    const switchButton = (e) => {
        if (e.target.innerText === "Deposit") {
            if (tabsStyle[0] !== "tab--active") {
                setTabsStyle(["tab--active", "", "Deposit"]);
            }
        }
        if (e.target.innerText === "Withdraw") {
            if (tabsStyle[1] !== "tab--active") {
                setTabsStyle(["", "tab--active", "Withdraw"]);
            }
        }
    }

    return (
        <div className='component exchange__transfers'>
            <div className='component__header flex-between'>
                <h2>Balance</h2>
                <div className='tabs'>
                    <button onClick={switchButton} className={`tab ${tabsStyle[0]}`}>Deposit</button>
                    <button onClick={switchButton} className={`tab ${tabsStyle[1]}`}>Withdraw</button>
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
  
                <form onSubmit={(e) => formHandler(e, tokens[0])}>
                    <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
                    <input
                        placeholder="0.000"
                        type="text"
                        id="token0"
                        value={tokenOneAmount.value}
                        onChange={(e) => tokenChange(e, tokens[0])}
                    />
                    <button className='button' type='submit'>
                        <span>{tabsStyle[2]}</span>
                    </button>
                </form>
            </div>
  
            <hr />
  
            {/* Deposit/Withdraw Component 2 (mETH) */}
  
            <div className='exchange__transfers--form'>
                <div className='flex-between'>
                    <p>
                        <small>Token</small>
                        <br />
                        <img
                            className="currency"
                            src={ symbols[1] === "CC" ? CClogo : mEthlogo }
                            alt="Token Logo"
                        />
                        {symbols && symbols[1]}
                    </p>
                    <p>
                        <small>Wallet</small>
                        <br />
                        {tokenBalance && tokenBalance[1]}
                    </p>
                    <p>
                        <small>Exchange</small>
                        <br />
                        {exchangeBalance && exchangeBalance[1]}
                    </p>
                </div>
  
                <form onSubmit={(e) => formHandler(e, tokens[1])}>
                    <label htmlFor="token1">{symbols && symbols[1]} Amount</label>
                    <input
                        placeholder="0.000"
                        type="text"
                        id="token1"
                        value={tokenTwoAmount.value}
                        onChange={(e) => tokenChange(e, tokens[1])}
                    />
  
                    <button className='button' type='submit'>
                        <span>{tabsStyle[2]}</span>
                    </button>
                </form>
    
            </div>

            <hr />

        </div>
    );
}

export default Balance;
