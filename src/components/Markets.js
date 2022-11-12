import config from "../config.json";
import { useSelector, useDispatch } from "react-redux";

import { loadTokens } from "../store/interactions";

const Markets = () => {
    const provider = useSelector(state => state.provider.connection);
    const chainId = useSelector(state => state.provider.chainId);

    const STKAddress = config[chainId].StonksCoin.address;
    const CCAddress = config[chainId].CoinCoin.address;
    const MATICAddress = config[chainId].MATIC.address;

    const dispatch = useDispatch();
    const marketHandler = async (event) => {
        await loadTokens(provider, event.target.value.split(','), dispatch);
    }
    
    return(
        <div className='component exchange__markets'>
            <div className='component__header'>
                <h2>Select Market</h2>
            </div>
                <select
                    name="market"
                    id="market"
                    onChange={marketHandler}
                >
                    <option value={`${STKAddress},${MATICAddress}`}>STK / MATIC</option>
                    <option value={`${STKAddress},${CCAddress}`}>STK / CC</option>
                </select>
            <hr />
        </div>
    )
}

export default Markets;
