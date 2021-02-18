import React, { useEffect, useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";

import { Body, Button, Header, NetworkContainer } from "./components";
import Home from "./components/Home";
import Token from "./components/Token";
import Swap from "./components/Swap";
import logo from "./ethereumLogo.png";
import useWeb3Modal from "./hooks/useWeb3Modal";
import { getBalance, getTokenBalance,  getBNB, getEth, getDai } from "./utils"

import { addresses, abis } from "@project/contracts";
import { TOKEN_DATA } from "./graphql/subgraph";
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import { ethers } from "ethers";
import { initNode } from "./connext";

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}

function About() {
  return <h2>About</h2>;
}

function Users() {
  return <h2>Users</h2>;
}

function App({chainInfos}) {
  const [ bnbPrice, setBnbPrice ] = useState(false);
  const [ ethPrice, setEthPrice ] = useState(false);
  const [ daiPrice, setDaiPrice ] = useState(false);
  const [ account, setAccount ] = useState(false);
  const [ balance, setBalance ] = useState(false);
  const [node, setNode] = useState(false);
  useEffect(() => {
    const init = async () => {
      const _node = await initNode();
      setNode(_node);
    };
    init();
  }, []);
  getBNB().then(r => {
    setBnbPrice(r.binancecoin.usd)
    chainInfos[0].unitPrice = r.binancecoin.usd
  })
  getEth().then(r => {
    setEthPrice(r.ethereum.usd)
    chainInfos[1].unitPrice = r.ethereum.usd
  })
  getDai().then(r => {
    setDaiPrice(r.dai.usd)
    chainInfos[2].unitPrice = r.dai.usd
  })

  if(chainInfos.length === 3){
    console.log(
      chainInfos[0].name,bnbPrice,
      chainInfos[1].name,ethPrice,
      chainInfos[2].name,daiPrice
    )
  }
  console.log('*******', {TOKEN_DATA, chainInfos:chainInfos[0]})
  const { loading, error, data } = useQuery(TOKEN_DATA, {
    client:chainInfos[0].client
  });

  const { loading:loading1, error:error1, data:data1 } = useQuery(TOKEN_DATA, {
    client:chainInfos[1].client
  });
  const { loading:loading2, error:error2, data:data2 } = useQuery(TOKEN_DATA, {
    client:chainInfos[2].client
  });
  console.log({
    data, data1, data2
  })
  let combined = []
  if(data1 && data2){
  //   for (let i = 0; i < data?.tokens?.length; i++) {
  //     const d = data?.tokens[i];
  //     d.exchangeName = chainInfos[0].exchangeName
  //     if(d.symbol.match(/DAI/)){
  //       console.log(0, d.symbol)
  //     }
  //     if(d.symbol.match(/BTC/)){
  //       console.log(0, d.symbol)
  //     }
  //     if(d.symbol.match(/ETH/)){
  //       console.log(0, d.symbol)
  //     }

      for (let j = 0; j < data2?.tokens?.length; j++) {
        const d2 = data2?.tokens[j];
        d2.exchangeName = chainInfos[2].exchangeName
        // if(i == 0 && d2.symbol.match(/DAI/)){
        //   console.log(2, d2.symbol)
        // }
        // if(i == 0 && d2.symbol.match(/BTC/)){
        //   console.log(2, d2.symbol)
        // }
        // if(i == 0 && d2.symbol.match(/ETH/)){
        //   console.log(2, d2.symbol)
        // }
  
        // if(d.symbol === d2.symbol){
          for (let k = 0; k < data1?.tokens?.length; k++) {
            const d1 = data1?.tokens[k];
            d1.exchangeName = chainInfos[1].exchangeName
            // console.log('*****', d.symbol, d1.symbol, d2.symbol, {i, j, k, d, d1})
            console.log('*****', d1.symbol, d2.symbol, {j, k, d1, d2})
            if(d1.symbol === d2.symbol){
              combined.push({
                symbol:d1.symbol,
                // data:[d, d1, d2]
                data:[null, d1, d2]
              })    
            }
          }
        // }
      }
    }
  // }
  console.log('*** App', {data, data1, data2, combined})
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  const [showModal, setShowModal] = React.useState(false);
  // React.useEffect(() => {
  //   if (!loading && !error && data && data.transfers) {
  //     console.log({ transfers: data.transfers });
  //   }
  // }, [loading, error, data]);

  // return (
  //   <>
  //     <button onClick={() => setShowModal(true)}>Hello World</button>
  //     <ConnextModal
  //       showModal={showModal}
  //       onClose={() => setShowModal(false)}
  //       onReady={params => console.log('MODAL IS READY =======>', params)}
  //       depositAddress={''}
  //       withdrawalAddress={'0x5A384227B65FA093DEC03Ec34e111Db80A040615'}
  //       routerPublicIdentifier="vector7tbbTxQp8ppEQUgPsbGiTrVdapLdU5dH7zTbVuXRf1M4CEBU9Q"
  //       depositAssetId={'0xbd69fC70FA1c3AED524Bb4E82Adc5fcCFFcD79Fa'}
  //       depositChainId={5}
  //       depositChainProvider="https://goerli.infura.io/v3/10c3a0fa44b94deba2a896658844a49c"
  //       withdrawAssetId={'0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1'}
  //       withdrawChainId={80001}
  //       withdrawChainProvider="https://rpc-mumbai.matic.today"
  //     />
  //   </>
  // );

  const chainId = provider?._network?.chainId
  if(provider?._network?.chainId){
    window.provider = provider
  }
  let currentChain, balanceToDisplay
  if(chainId){
    currentChain = chainInfos.filter(c => c.chainId === chainId )[0]
  }
  window.ethers = ethers
  if(provider?.getSigner){
    let signer = provider.getSigner()
    provider.listAccounts().then(a => {
      setAccount(a[0])
      if(currentChain){
        getBalance(currentChain.rpcUrl, a[0]).then(b => {
          setBalance(ethers.utils.formatEther(b))
        })    
      }
    })
  }
  if(balance){
    balanceToDisplay = parseFloat(balance).toFixed(2)
  }
  return (
    <Router>
      <div>
        <Header>
          <Link
            to={`/`}
            style={{ textDecoration: "none", fontSize: "xx-large" }}
          >
            🐰
          </Link>
          <NetworkContainer>
            {currentChain && (
              <div>
                Connected to {currentChain.name} as {account.slice(0, 5)}... (
                {balanceToDisplay} ${currentChain.tokenSymbol})
              </div>
            )}
            <WalletButton
              provider={provider}
              loadWeb3Modal={loadWeb3Modal}
              logoutOfWeb3Modal={logoutOfWeb3Modal}
            />
          </NetworkContainer>
        </Header>
        <Switch>
          <Route path="/token/:symbol">
            <Token chainInfos={chainInfos} combined={combined} />
          </Route>
          <Route path="/exchanges/:from-:to/token/:symbol">
            <Swap
              chainInfos={chainInfos}
              currentChain={currentChain}
              combined={combined}
              account={account}
              connextNode={node}
            />
          </Route>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/users">
            <Users />
          </Route>
          <Route path="/">
            <Home chainInfos={chainInfos} combined={combined} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
