import { useSelector } from "react-redux";
import Chart from "react-apexcharts";

import Banner from "./Banner";
import { priceChartSelector } from "../store/selectors";
import { options, placeholder } from "./PriceChart.config";

import arrowDown from "../assets/down-arrow.svg";
import arrowUp from "../assets/up-arrow.svg";

import panik from "../assets/panik.png";
import kalmStonks from "../assets/kalmStonks.jpeg";


const PriceChart = () => {
    const account = useSelector(state => state.provider.account);
    const symbols = useSelector(state => state.tokens.symbols);
    const priceChart = useSelector(priceChartSelector);

    return (
        <div className="component exchange__chart">
            <div className='component__header flex-between'>
                <div className='flex'>
        
                    <h2>{`${symbols[0]}/${symbols[1]}`}</h2>
        
                    {priceChart ?
                        (<div className='flex'>
                            {priceChart.lastPriceChange === "-" ?
                                (<div className="flex">
                                    <img src={arrowDown} alt="Arrow down" />
                                    <span className='up'>{priceChart.lastPrice}&nbsp;
                                        (NOT STONKS)&nbsp;&nbsp;&nbsp;</span>
                                    <img src={panik} className="stonked shake-chunk shake-slow shake-constant" alt="meme" />
                                </div>)
                                :
                                (<div className="flex">
                                    <img src={arrowUp} alt="Arrow up" />
                                    <span className='up'>{priceChart.lastPrice}&nbsp;
                                    (STONKSIFY)&nbsp;&nbsp;&nbsp;</span>
                                    <img src={kalmStonks} className="stonked" alt="meme" />
                                </div>)
                            }
                        </div>) :
                        (<div className="flex">
                        </div>)

                    }
        
                </div>
            </div>
            {/* Price chart goes here */}

            {!account ? 
             (<Banner text="Please connect metamask" />) :
             (<Chart
                type="candlestick"
                options={options}
                series={priceChart ? priceChart.series : placeholder}
                width="100%"
                height="100%"
              />)}

            
        </div>
    );
}
  
export default PriceChart;
  