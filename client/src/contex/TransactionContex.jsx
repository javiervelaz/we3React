import React, { useEffect , useState } from "react";
import { ethers } from 'ethers';

import { contractABI, contractAddress } from "../utils/constans";

export const TransactionContex = React.createContext();

const { ethereum } = window;

const getEthereumContract = () =>{
    const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

  return transactionsContract;
}

export const TransactionProvider = ({ children }) => {

    const [currentAccount, setCurrentAccount] = useState('');
    const [formData, setFormData ] = useState({ addressTo:'',amount: '', keyword:'', message:''});
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) =>{
        setFormData((prevState) =>({...prevState, [name]:e.target.value}))
    }

    const checkIfWalletIsConnected = async () =>{
        try {
            if(!ethereum) return alert ("Please install Metamask");

            const accounts = await ethereum.request({ method: 'eth_accounts'});

            if(accounts.length){
                setCurrentAccount(accounts[0])
                getAllTransactions()
                //get all transantions  
            }else{
                console.log('not accounts found')
            }
        } catch (error) {
            console.log(error)

            throw new Error("NO ethereum object") 
        }
        
    }

    const checkIfTransactionExists = async () =>{
        try {
            if (ethereum) {
                const transactionContract =  getEthereumContract();
                const transactionCount =  await transactionContract.getTransacionsCount();
    
                window.localStorage.setItem("transactionCount", transactionCount)
            }
            
        } catch (error) {
            console.log(error)

            throw new Error("NO ethereum object") 
        }
        
    }

    const getAllTransactions = async () =>{
        try {
            if(!ethereum) return alert ("Please install Metamask");
            const transactionContract =  getEthereumContract();
            const availableTransactions = await transactionContract.getAllTransations();

            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)
              }));

            console.log(structuredTransactions)

            setTransactions(structuredTransactions);
        } catch (error) {
            console.log(error)

            throw new Error("NO ethereum object") 
        }
        
    }

    const connectWallet = async () => {
        try {
            if(!ethereum) return alert ("Please install Metamask");
            const accounts = await ethereum.request({ method: 'eth_requestAccounts'});
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error)

            throw new Error("NO ethereum object") 
        }
    }

    const sendTransaction = async () => {
        try {
            if(!ethereum) return alert ("Please install Metamask");
            const { addressTo, amount, keyword, message } = formData;
            const transactionContract =  getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208',
                    value: parsedAmount._hex,
                }]
            });
            const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
            setIsLoading(true);
            console.log( `is loadinf - ${transactionHash.hash}` )
            await transactionHash.wait();  
            setIsLoading(false);
            console.log(`succsess - ${transactionHash.hash}`) 
            const transactionCount =  await transactionContract.getTransacionsCount();
            setTransactionCount(transactionCount.toNumber());  

        } catch (error) {
            console.log(error)

            throw new Error("NO ethereum object") 
        }
    }

    useEffect(()=>{
        checkIfWalletIsConnected(); 
        checkIfTransactionExists();
    },[])

    return (
        <TransactionContex.Provider value = {{ connectWallet, currentAccount ,formData, sendTransaction, handleChange,transactions, isLoading  }}>
            { children }
        </TransactionContex.Provider>
    )
}