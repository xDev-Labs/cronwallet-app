import type {
  CreateTransactionDto,
  Transaction,
  UpdateTransactionDto,
} from "@/lib/types/transaction.types";

/**
 * Maps backend transaction response to our Transaction model
 * Handles both old and new backend response formats
 */
export function mapBackendTransactionToTransaction(
  backendTransaction: any
): Transaction {
//   console.log("Backend Transaction Data:", backendTransaction);

  // Handle case where backendTransaction is undefined or null
  if (!backendTransaction) {
    console.error("Backend transaction data is undefined or null");
    throw new Error("Backend transaction data is missing");
  }

  return {
    transaction_hash: backendTransaction.transaction_hash,
    sender_uid: backendTransaction.sender_uid,
    receiver_uid: backendTransaction.receiver_uid,
    amount: backendTransaction.amount || 0,
    token: backendTransaction.token || [],
    chain_id: backendTransaction.chain_id || 1,
    status: backendTransaction.status || "pending",
    created_at: backendTransaction.created_at,
    completed_at: backendTransaction.completed_at,
  };
}

/**
 * Maps our Transaction model to backend create format
 */
export function mapTransactionToBackendCreate(
  transaction: CreateTransactionDto
): any {
  return {
    transaction_hash: transaction.transaction_hash,
    sender_uid: transaction.sender_uid,
    receiver_uid: transaction.receiver_uid,
    amount: transaction.amount,
    token: transaction.token,
    chain_id: transaction.chain_id,
    status: transaction.status || "pending",
  };
}

/**
 * Maps our Transaction model to backend update format
 */
export function mapTransactionToBackendUpdate(
  transaction: UpdateTransactionDto
): any {
  const updateData: any = {};

  if (transaction.sender_uid !== undefined)
    updateData.sender_uid = transaction.sender_uid;
  if (transaction.receiver_uid !== undefined)
    updateData.receiver_uid = transaction.receiver_uid;
  if (transaction.amount !== undefined) updateData.amount = transaction.amount;
  if (transaction.token !== undefined) updateData.token = transaction.token;
  if (transaction.chain_id !== undefined)
    updateData.chain_id = transaction.chain_id;
  if (transaction.status !== undefined) updateData.status = transaction.status;
  if (transaction.completed_at !== undefined)
    updateData.completed_at = transaction.completed_at;

  return updateData;
}

/**
 * Maps frontend transaction data to CreateTransactionDto
 */
export function mapFrontendToCreateDto(transactionData: {
  transaction_hash: string;
  sender_uid: string;
  receiver_uid: string;
  amount: number;
  token: Array<{ amount: string; token_address: string }>;
  chain_id: number;
  status?: "pending" | "completed" | "failed";
}): CreateTransactionDto {
  return {
    transaction_hash: transactionData.transaction_hash,
    sender_uid: transactionData.sender_uid,
    receiver_uid: transactionData.receiver_uid,
    amount: transactionData.amount,
    token: transactionData.token,
    chain_id: transactionData.chain_id,
    status: transactionData.status || "pending",
  };
}
