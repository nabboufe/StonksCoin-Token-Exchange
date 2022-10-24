import config from "../config.json";
import { useSelector, useDispatch } from "react-redux";

import { loadTokens } from "../store/interactions";

const Markets = () => {
    const provider = useSelector(state => state.provider.connection);
    //const chainId = useSelector(state => state.provider.chainId);

    const STKAddress = config[31337].StonksCoin.address;
    const CCAddress = config[31337].CoinCoin.address;
    const mDaiAddress = config[31337].mDai.address;

    const dispatch = useDispatch();
    const marketHandler = async (event) => {
        console.log(event.target.value.split(','));
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
                    <option value={`${STKAddress},${CCAddress}`}>STK / CC</option>
                    <option value={`${STKAddress},${mDaiAddress}`}>STK / mDai</option>
                </select>
            <hr />
        </div>
    )
}

export default Markets;
