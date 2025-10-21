import { apiService } from "@/lib/services/api";
import { storage } from "@/lib/storage/storage";
import type { Transaction } from "@/lib/types/transaction.types";
import { mapBackendTransactionToTransaction } from "@/lib/utils/transactionMapping";

/**
 * Fetches the last 10 transactions for a user and stores them in local storage
 */
export async function fetchAndStoreUserTransactions(
  userId: string
): Promise<Transaction[]> {
  try {
    console.log("Fetching transactions for user:", userId);

    // Fetch transactions from backend
    const response = await apiService.getTransactionsByUserId(userId, 1, 10);

    if (response.success && response.data) {
      console.log("Backend transactions response:", response.data);

      // Map backend transactions to our Transaction model
      const transactions: Transaction[] = response.data.transactions.map(
        (backendTx: any) => mapBackendTransactionToTransaction(backendTx)
      );

      console.log("Mapped transactions:", transactions);

      // Store in local storage
      await storage.saveLatestTransactions(transactions);

      console.log("Transactions stored successfully");
      return transactions;
    } else {
      console.warn("No transactions found or API call failed");
      return [];
    }
  } catch (error) {
    console.error("Error fetching and storing transactions:", error);
    throw error;
  }
}

/**
 * Gets transactions from local storage, with fallback to API if empty
 */
export async function getUserTransactions(
  userId: string
): Promise<Transaction[]> {
  try {
    // First try to get from local storage
    const localTransactions = await storage.getLatestTransactions();

    if (localTransactions.length > 0) {
      console.log(
        "Returning transactions from local storage:",
        localTransactions.length
      );
      return localTransactions;
    }

    // If no local transactions, fetch from API
    console.log("No local transactions found, fetching from API");
    return await fetchAndStoreUserTransactions(userId);
  } catch (error) {
    console.error("Error getting user transactions:", error);
    return [];
  }
}

/**
 * Refreshes transactions from API and updates local storage
 */
export async function refreshUserTransactions(
  userId: string
): Promise<Transaction[]> {
  try {
    console.log("Refreshing transactions for user:", userId);
    return await fetchAndStoreUserTransactions(userId);
  } catch (error) {
    console.error("Error refreshing transactions:", error);
    throw error;
  }
}

/**
 * Adds a new transaction to local storage
 */
export async function addUserTransaction(
  transaction: Transaction
): Promise<void> {
  try {
    await storage.addTransaction(transaction);
    console.log("Transaction added to local storage");
  } catch (error) {
    console.error("Error adding transaction to storage:", error);
    throw error;
  }
}
