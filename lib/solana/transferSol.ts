import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { signSolanaTransaction } from "../wallet/wallet";
import { PROGRAM_ID, SERVER_PUBLIC_KEY } from "./initSmartAccount";

export const transferSol = async (amount: number, smartAccountAddress: string, to: string, ownerPublicKey: PublicKey) => {
    console.log('🚀 Starting SOL transfer...');
    console.log('Amount:', amount);
    console.log('Smart Account:', smartAccountAddress);
    console.log('Recipient:', to);
    console.log('Owner:', ownerPublicKey.toBase58());

    let smartAccountPublicKey = new PublicKey(smartAccountAddress);
    let recipientPublicKey = new PublicKey(to);

    let connection = new Connection(process.env.EXPO_PUBLIC_SOLANA_RPC_URL || "", "confirmed");

    let transaction = new Transaction();

    // Discriminator for pay_with_sol instruction
    const discriminator = new Uint8Array([90, 168, 147, 44, 140, 41, 241, 76]);
    console.log('🔑 Discriminator:', Array.from(discriminator));

    console.log('💰 Amount:', amount);
    // Encode amount as u64 (little-endian)
    const amountBuffer = new ArrayBuffer(8);
    const amountView = new DataView(amountBuffer);
    amountView.setBigUint64(0, BigInt(amount), true); // true for little-endian
    console.log('💰 Amount encoded as u64:', BigInt(amount).toString());

    // Combine discriminator and amount
    const dataArray = new Uint8Array(16); // 8 bytes discriminator + 8 bytes amount
    dataArray.set(discriminator, 0);
    dataArray.set(new Uint8Array(amountBuffer), 8);

    // Convert to Buffer for TransactionInstruction
    const instructionData = Buffer.from(dataArray);
    console.log('📦 Instruction data:', instructionData.toString('hex'));

    console.log('🏗️  Building transaction instruction...');
    console.log('Program ID:', PROGRAM_ID.toBase58());
    let transferTransactionIx = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
            { pubkey: smartAccountPublicKey, isSigner: false, isWritable: true }, // smart_account
            { pubkey: recipientPublicKey, isSigner: false, isWritable: true }, // dst_sol_account
            { pubkey: ownerPublicKey, isSigner: true, isWritable: false }, // owner (must sign)
        ],
        data: instructionData,
    });
    console.log('✅ Transaction instruction created');

    transaction.add(transferTransactionIx);
    console.log('📝 Instruction added to transaction');

    let { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    console.log('🔗 Recent blockhash:', blockhash);

    transaction.feePayer = SERVER_PUBLIC_KEY;
    console.log('💳 Fee payer:', SERVER_PUBLIC_KEY.toBase58());

    console.log('✍️  Signing transaction...');
    let signedTransaction = await signSolanaTransaction(transaction, true);
    console.log('✅ Transaction signed');

    const serializedTransaction = signedTransaction.serialize({ requireAllSignatures: false });
    console.log('📤 Transaction serialized, size:', serializedTransaction.length, 'bytes');

    const encodedTransaction = Buffer.from(serializedTransaction).toString("base64");
    console.log('🎉 Transaction encoded successfully');
    console.log('Encoded transaction length:', encodedTransaction.length);

    return encodedTransaction;
}