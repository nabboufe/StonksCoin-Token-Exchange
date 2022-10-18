import '../App.css';
import TOKEN_ABI from '../abis/Token.json';
import config from '../config.json';
import { ethers } from 'ethers';
import React, { useEffect } from 'react';

function App() {

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    console.log(chainId);

    const STKAddress = config[chainId].StonksCoin.address;
    const token = new ethers.Contract(STKAddress, TOKEN_ABI, provider);
    const symbol = await token.symbol();

    console.log(token.address);
    console.log(symbol);
  }

  useEffect(() => {
    loadBlockchainData();
  });

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
