// import { TransactionResponse } from '@ethersproject/providers'
// import { Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { /* useCallback,*/ useMemo } from 'react'
import { /* useAppDispatch,*/ useAppSelector } from 'state/hooks'

// import { addTransaction, TransactionInfo, TransactionType } from './actions'
// import { TransactionDetails } from './reducer'

// MOD imports
import { EnhancedTransactionDetails } from '../reducer'
// import { TransactionDetails } from '@src/state/transactions/reducer'
// import { TransactionType } from '@src/state/transactions/actions'

// helper that can take a ethers library transaction response and add it to the list of transactions
/* export function useTransactionAdder(): (response: TransactionResponse, info: TransactionInfo) => void {
  const { chainId, account } = useWeb3React()
  const dispatch = useAppDispatch()

  const logMonitoringEvent = useTransactionMonitoringEventCallback()

  return useCallback(
    (response: TransactionResponse, info: TransactionInfo) => {
      if (!account) return
      if (!chainId) return

      const { hash } = response
      if (!hash) {
        throw Error('No transaction hash found.')
      }
      dispatch(addTransaction({ hash, from: account, info, chainId }))

      logMonitoringEvent(info, response)
    },
    [account, chainId, dispatch, logMonitoringEvent]
  )
} */

// returns all the transactions for the current chain
export function useAllTransactions(): { [txHash: string]: EnhancedTransactionDetails } {
  const { chainId } = useWeb3React()

  const state = useAppSelector((state) => state.transactions)

  return chainId ? state[chainId] ?? {} : {}
}

/* export function useTransaction(transactionHash?: string): TransactionDetails | undefined {
  const allTransactions = useAllTransactions()

  if (!transactionHash) {
    return undefined
  }

  return allTransactions[transactionHash]
} */

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = useAllTransactions()

  if (!transactionHash || !transactions[transactionHash]) return false

  return !transactions[transactionHash].receipt
}

/* export function useIsTransactionConfirmed(transactionHash?: string): boolean {
  const transactions = useAllTransactions()

  if (!transactionHash || !transactions[transactionHash]) return false

  return Boolean(transactions[transactionHash].receipt)
} */

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx: EnhancedTransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval(tokenAddress: string | undefined, spender: string | undefined): boolean {
  const allTransactions = useAllTransactions()
  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some((hash) => {
        const tx = allTransactions[hash]
        if (!tx) return false
        if (tx.receipt) {
          return false
        } else {
          const approval = tx.approval
          if (!approval) return false
          return approval.spender === spender && approval.tokenAddress === tokenAddress && isTransactionRecent(tx)
        }
      }),
    [allTransactions, spender, tokenAddress]
  )
}

// watch for submissions to claim
// return null if not done loading, return undefined if not found
/* export function useUserHasSubmittedClaim(account?: string): {
  claimSubmitted: boolean
  claimTxn: TransactionDetails | undefined
} {
  const allTransactions = useAllTransactions()

  // get the txn if it has been submitted
  const claimTxn = useMemo(() => {
    const txnIndex = Object.keys(allTransactions).find((hash) => {
      const tx = allTransactions[hash]
      return tx.info.type === TransactionType.CLAIM && tx.info.recipient === account
    })
    return txnIndex && allTransactions[txnIndex] ? allTransactions[txnIndex] : undefined
  }, [account, allTransactions])

  return { claimSubmitted: Boolean(claimTxn), claimTxn }
} */
