import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import config from "../config.json";

import {
	loadProvider,
  	loadNetwork,
  	loadTokens,
  	loadExchange,
	loadAccount,
	loadBalance,
	suscribeToEvents,
	loadAllOrders
} from "../store/interactions";

import Navbar from "./Navbar.js";
import Markets from "./Markets.js";
import Balance from "./Balance.js";
import Order from "./Order.js";
import OrderBook from "./OrderBook.js";
import PriceChart from "./PriceChart.js";
import Trades from "./Trades.js";

function App() {

	const dispatch = useDispatch();

	const loadBlockchainData = async () => {
		// connect ethers to blockchain
		const provider = loadProvider(dispatch);
		// fetch current network chainId
		const chainId = await loadNetwork(provider, dispatch);

		// load Token smart contract
		const StonksCoin = config[chainId].StonksCoin;
		const CoinCoin = config[chainId].CoinCoin;
		const tokens = await loadTokens(provider, [StonksCoin.address, CoinCoin.address], dispatch);

		// load Exchange smart contract
		const Exchange = config[chainId].Exchange;
		const exchange = await loadExchange(provider, Exchange.address, dispatch);

		window.ethereum.on("chainChanged", () => {
			window.location.reload();
		});

		//fetch current account & balance from metamask when changed
		window.ethereum.on("accountsChanged",  () => {
			const account = loadAccount(provider, dispatch);
			loadBalance(exchange, tokens, account, dispatch);
		});

		//Fetch all orders: opened, filled, cancelled
		loadAllOrders(provider, exchange, dispatch);

		//listen to events
		suscribeToEvents(exchange, dispatch);
	}

	useEffect(() => {
    	loadBlockchainData();
  	});

  	return (
		<div>

			<Navbar />

			<main className="exchange grid">
				<section className="exchange__section--left grid">

					<Markets />
					<Balance />
					<Order />

				</section>
				<section className="exchange__section--right grid">

					<PriceChart />
					{/* Transactions */}
					<Trades />
					<OrderBook />

				</section>
			</main>

			{/* Alert */}

		</div>
	);
}

export default App;
