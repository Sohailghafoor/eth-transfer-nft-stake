// import logo from "./logo.svg";
import "./App.css";
import React, { useState } from "react";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import collection from "./contract/Collection.json";
import nftStaking from "./contract/NFTStaking.json";
import { ethers } from "ethers";
// import Web3 from "web3";

function App() {
  const [address, setAddress] = useState(0);
  const [providers, setProviders] = useState("");

  const [contract, setContract] = useState({});

  const API_URL = process.env.REACT_APP_API_URL;
  const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
  const web3 = createAlchemyWeb3(API_URL);

  ///
  // Check Provider
  const getProvider = () => {
    console.log("Here is the Check Of MetaMask");
    if (window.ethereum) {
      const provider = window.ethereum;

      if (provider?.isMetaMask) {
        return provider;
      }
    }

    window.open("https://metamask.io", "_blank");
  };
  // Connect MetaMask Wallet
  async function connect() {
    const provider = getProvider();
    const resp = await provider.request({
      method: "eth_requestAccounts",
    });
    console.log("Here is the Key Address of MetaMask", resp);
    setProviders(provider);
    setAddress(resp[0]);
  }
  // Deposit Eth into Master Wallet
  const deposit = async () => {
    const transactionParameters = {
      // nonce: "0x00", // customizable by user during MetaMask confirmation.
      //Set Your Master Wallet Address to Deposit the Ether from your MataMask Wallet
      to: "0x7a0B7dc32E19383A8c6043EB2F2e4F1B0D28eF28", // Master Wallet Required except during contract publications.
      from: address, // must match user's active address.
      //set here the value of Ether By Passing the ETH value as a argument in the deposit Funtion     gasLimit: web3.utils.toHex(1000000),
      value: "38D7EA4C68000", // Only required to send ether to the recipient from the initiating external account.  gasPrice: web3.utils.toHex(web3.utils.toWei('0', 'gWei')),
      gas: "21000",
      chainId: "0x5", // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
    };
    const txHash = await providers
      .request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      })
      .then((txHash) => console.log(txHash))
      .catch((error) => console.error);
    console.log("here is the transfer", txHash);
  };
  // WithDraw Eth From Master Wallet into Your Wallet
  const withdraw = async () => {
    const myAddress = "0x7a0B7dc32E19383A8c6043EB2F2e4F1B0D28eF28"; //Master Wallet Address  //TODO: replace this address with your own public address

    const nonce = await web3.eth.getTransactionCount(myAddress); // nonce starts counting from 0
    console.log(nonce);

    const transaction = {
      to: address, // faucet address to return eth
      value: 100000000000000000, // 0.01 ETH            //////////////  value: web3.utils.toWei("0.001", "ether")
      gas: 21000,
      nonce: nonce,
      // optional data field to send message or execute smart contract
    };

    const signedTx = await web3.eth.accounts.signTransaction(
      transaction,
      PRIVATE_KEY
    );
    ///////////////////////////////////web3.js for transactionsss ///// we can also use this for contract calling fucntions
    web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
      function (error, hash) {
        if (!error) {
          console.log(
            "🎉 The hash of your transaction is: ",
            hash,
            "\n Check Alchemy's Mempool to view the status of your transaction!"
          );
        } else {
          console.log(
            "Something went wrong while submitting your transaction:\n",
            error
          );
        }
      }
    );
  };
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////        Smart Contract Section        ///////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Contracts for Collection and For Stake

  const CollectionAddress = "0xFfD1640DB3B08cb1FD99bC489f43FbF5EDd0813c";
  const NFTStaking = "0x0eCA68fFAA92f80e4Ea37F8B0A94F5827Dd2473b";

  const claim = async () => {
    // Claim Your NFT From Collection
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(address);
    const cont = new ethers.Contract(CollectionAddress, collection.abi, signer);
    setContract(cont);
    console.log("Here is your Contract", cont);

    try {
      const respon = await contract.claimNFT(
        "0x7a0B7dc32E19383A8c6043EB2F2e4F1B0D28eF28", //master wallet
        address, //user wallet
        "3", //tokenID
        {
          gasLimit: 21000,
        }
      ); //passing arguments for max DeployCapitalReserve limit by owner/Admin
      console.log("respon:", respon);
    } catch (err) {
      console.log("error: ", err);
    }
  };
  // Aproved your NFT for Staking from Collection
  const approves = async () => {
    // Claim Your NFT From Collection
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(address);
    const cont = new ethers.Contract(CollectionAddress, collection.abi, signer);
    setContract(cont);
    console.log("Here is your Contract", cont);
    try {
      // staking contract // tokenID
      const respon = await contract.approve(NFTStaking, "3"); // user Address and approval from collection
      console.log("respon:", respon);
    } catch (err) {
      console.log("error: ", err);
    }
  };
  ///////////////////////////////////////////////////// now Staking Contract functionality

  const stakes = async () => {
    // Claim Your NFT From Collection
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(address);
    const cont = new ethers.Contract(NFTStaking, nftStaking.abi, signer);
    setContract(cont);
    console.log("Here is your Contract", cont);

    try {
      const respon = await contract.stake(
        "3", // Calim NFT from master wallet to
        "10",
        {
          gasLimit: 210000,
        } // token ID
      ); //passing arguments for max DeployCapitalReserve limit by owner/Admin
      console.log("respon:", respon);
    } catch (err) {
      console.log("error: ", err);
    }
  };
  const unstake = async () => {
    // Claim Your NFT From Collection
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(address);
    const cont = new ethers.Contract(NFTStaking, nftStaking.abi, signer);
    setContract(cont);
    console.log("Here is your Contract", cont);

    try {
      const respon = await contract.unstake(
        address, // Calim NFT from master wallet to
        "0",
        {
          gasLimit: 21000,
        } // token ID
      ); //passing arguments for max DeployCapitalReserve limit by owner/Admin
      console.log("respon:", respon);
    } catch (err) {
      console.log("error: ", err);
    }
  };
  return (
    <div className="App">
      <header className="App-header">
        <div>
          <button onClick={connect}>Click for MetaMask Connectivity</button>
        </div>
        <div>
          <button onClick={deposit}>
            Click for Deposit into Master Wallet
          </button>
        </div>
        <div>
          <button onClick={withdraw}>
            WithDraw To Master Account to your MataMask Account
          </button>
        </div>
      </header>
      <div className="App-header">
        <button onClick={claim}>Claim Your NFT</button>

        <div>
          <button onClick={approves}>Approve Your NFT for Staking</button>
        </div>
        <div>
          <button onClick={stakes}>Stake Your NFT</button>
        </div>

        <div>
          <button onClick={unstake}>UnStake Your NFT</button>
        </div>
      </div>
    </div>
  );
}

export default App;
