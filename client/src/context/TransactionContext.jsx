import React, { useEffect, useState, useMemo } from "react"
import { ethers } from "ethers"

import { contractABI, contractAddress } from "../utils/constant"

const { ethereum } = window

export const TransactionContext = React.createContext()
const getETHContract = () => {
	const provider = new ethers.providers.Web3Provider(ethereum)
	const signer = provider.getSigner()
	const TransactionContract = new ethers.Contract(
		contractAddress,
		contractABI,
		signer
	)
	return TransactionContract
}
export const TransactionProvider = ({ children }) => {
	const [formData, setformData] = useState({
		addressTo: "",
		keyword: "",
		amount: "",
		message: "",
	})
	const [currentAccount, setCurrentAccount] = useState("")
	const [isLoading, setisLoading] = useState(false)
	const [transactionCount, settransactionCount] = useState(
		localStorage.getItem("transactionCount")
	)
	const [transactions, setTransactions] = useState([])
	const getAllTransactions = async () => {
		try {
			if (ethereum) {
				const transactionsContract = getETHContract()
				const availableTransactions =
					await transactionsContract.getAllTransactions()
				const structuredTransactions = availableTransactions.map(
					(transaction) => ({
						addressTo: transaction.receiver,
						addressFrom: transaction.sender,
						timestamp: new Date(
							transaction.timestamp.toNumber() * 1000
						).toLocaleString(),
						message: transaction.message,
						keyword: transaction.keyword,
						amount: parseInt(transaction.amount._hex) / 10 ** 18,
					})
				)
				setTransactions(structuredTransactions)
			} else {
				console.log("Ethereum is not present")
			}
		} catch (error) {
			console.log(error)
		}
	}
	const checkIfWalletConnected = async () => {
		try {
			if (!ethereum) {
				return alert("Please connect to Metamask")
			}
			const accounts = await ethereum.request({ method: "eth_accounts" })
			if (accounts.length) {
				setCurrentAccount(accounts[0])
				getAllTransactions()
			} else {
				console.log("No accounts found")
			}
		} catch (error) {
			console.log(error)
			throw new Error("No Etherum object")
		}
	}
	const checkIfTransactionExist = async () => {
		try {
			const transactionContract = getETHContract()
			const transactionCount = await transactionContract.getTransactionCount()
			window.localStorage.setItem("transactionCount", transactionCount)
		} catch (error) {}
	}
	useEffect(() => {
		checkIfWalletConnected()
		checkIfTransactionExist()
	}, [])
	const connectWallet = async () => {
		try {
			if (!ethereum) {
				return alert("Please connect to Metamask")
			}
			console.log(ethereum)
			const accounts = await ethereum.request({ method: "eth_requestAccounts" })
			if (accounts) {
				await window.ethereum.request({
					method: "wallet_requestPermissions",
					params: [
						{
							eth_accounts: {},
						},
					],
				})
			}
			setCurrentAccount(accounts[0])
		} catch (error) {
			console.log(error)
			throw new Error("No Etherum object")
		}
	}
	const sendTransaction = async () => {
		try {
			if (!ethereum) {
				return alert("Please connect to Metamask")
			}
			//get date from form
			const { addressTo, amount, keyword, message } = formData
			const rawAmount = ethers.utils.parseEther(amount)
			const TransactionContract = getETHContract()
			setisLoading(true)
			await ethereum.request({
				method: "eth_sendTransaction",
				params: [
					{
						from: currentAccount,
						to: addressTo,
						gas: "0x7530",
						value: rawAmount._hex,
					},
				],
			})
			const transactionHash = await TransactionContract.addToBlockchain(
				addressTo,
				rawAmount,
				message,
				currentAccount,
				keyword
			)
			await transactionHash.wait()
			setisLoading(false)
			const transactionCount = await TransactionContract.getTransactionCount()
			settransactionCount(transactionCount.toNumber())
			window.reload()
		} catch (error) {
			console.log(error)
		}
	}
	return (
		<TransactionContext.Provider
			value={{
				connectWallet,
				currentAccount,
				transactions,
				formData,
				isLoading,
				setformData,
				sendTransaction,
			}}>
			{children}
		</TransactionContext.Provider>
	)
}
