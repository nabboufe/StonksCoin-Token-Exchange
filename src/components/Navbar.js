import logo from "../assets/stonks_logo.png";
import eth from "../assets/eth.svg"

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { loadAccount } from "../store/interactions";

import { createAvatar } from "@dicebear/avatars";
import * as style from "@dicebear/avatars-bottts-sprites";

import config from '../config.json';

const Navbar = () => {
    const provider = useSelector(state => state.provider.connection);
    const account = useSelector(state => state.provider.account);
    const balance = Number(useSelector(state => state.provider.balance));
    const chainId = useSelector(state => state.provider.chainId);
    const truth = chainId === 31337;    
    
    let svg = createAvatar(style, {
        seed: account,
        radius: 50,
        colors: ["blue", "cyan", "deepOrange", "deepPurple", "green",
                 "lightBlue", "lightGreen", "red", "purple"]
    }); 
    let svgObj = new Blob([svg], { type: "image/svg+xml" });
    let url = URL.createObjectURL(svgObj);

    const dispatch = useDispatch();

    const connectHandler = async () => {
        await loadAccount(provider, dispatch);
    }

    const networkHandler = async (e) => {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: e.target.value }] 
        });
        console.log(chainId);
    }

    return(
        <div className="exchange__header grid">

            <div className="exchange__header--brand flex">
                <img src={logo} className="logo" alt="StonksCoin logo" />
                <h1>StonksCoin Token Exchange</h1>
            </div>

            <div className="exchange__header--networks flex">
                <img src={eth} className="logo" alt="StonksCoin Logo" />

                { chainId && (
                    <select
                        name="networks"
                        id="networks"
                        value={config[chainId] ? `0x${chainId.toString(16)}` : '0'}
                        onChange={networkHandler}
                    >
                        <option value="0" disabled>Select Network</option>
                        <option value="0x7A69">Localhost</option>
                        <option value="0x2a">Kovan</option>
                    </select>
                ) }

            </div>

            <div className="exchange__header--account flex">
                <p>
                    <small>My Balance :</small>
                    { balance ? balance.toFixed(4) : "0" }
                </p>
                {
                    account ?
                        ( <a 
                            href={truth ? "./" : `${config[chainId].explorerURL}/address/${account}`}
                            target={truth ? "_self" : "_blank"}
                            rel="noreferrer"
                          >
                            { account.slice(0, 5) + '...' + account.slice(-4) }
                            <img src={url} alt="user avatar" />
                          </a> )
                            :
                        ( <button
                            className="button"
                            onClick={connectHandler}
                          >
                            Connect
                          </button> )
                }
            </div>

        </div>
    );
}  
  
export default Navbar;
