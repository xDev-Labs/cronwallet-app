import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { v4 as uuidv4 } from "uuid";
import { signSolanaTransaction } from "../wallet/wallet";

export const initSmartAccountInstruction = async (userWallet: String): Promise<{ smartAccountAddress: string, encodedTransaction: string }> => {
    const smartAccountId = uuidv4();
    const { smartAccountIdBytes, smartAccountPda, guardianRegistryPda } = generateSmartAccount(smartAccountId);
    console.log('Smart Account PDA:', smartAccountPda.toBase58());
    console.log('Guardian Registry PDA:', guardianRegistryPda.toBase58());

    // Create connection to Solana
    const connection = new Connection(process.env.EXPO_PUBLIC_SOLANA_RPC_URL || "", "confirmed");

    // Discriminator for the initSmartAccount instruction
    const discriminator = new Uint8Array([
        197,
        104,
        227,
        40,
        18,
        165,
        132,
        193
    ]);
    const instructionData = new Uint8Array([
        ...discriminator,
        ...smartAccountIdBytes
    ]);

    let userWalletPublicKey = new PublicKey(userWallet);
    let serverPublicKey = new PublicKey("3Exg1bwcYyQP926DF321hoojVqMZNAkNZgfhsNmEyzfC");

    // Create the instruction with account ordering that matches Anchor's expectations
    // Order: smart_account, guardian_registry, fee_payer, authority, system_program
    const instruction = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
            { pubkey: smartAccountPda, isSigner: false, isWritable: true },
            { pubkey: guardianRegistryPda, isSigner: false, isWritable: true },
            { pubkey: serverPublicKey, isSigner: true, isWritable: true }, // fee_payer
            { pubkey: userWalletPublicKey, isSigner: true, isWritable: true }, // authority
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: Buffer.from(instructionData)
    });

    // Create and sign transaction
    const transaction = new Transaction().add(instruction);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = serverPublicKey;

    console.log('Instruction Data (hex):', Buffer.from(instructionData).toString('hex'));
    console.log('Smart Account ID (UUID):', smartAccountId);
    console.log('Smart Account ID bytes length:', smartAccountIdBytes.length);
    console.log('Smart Account ID bytes:', Array.from(smartAccountIdBytes));
    console.log('Expected 16 bytes?', smartAccountIdBytes.length === 16);

    // Partially sign the transaction (only with wallet, not fee payer)
    let signedTransaction = await signSolanaTransaction(transaction);

    // Serialize with requireAllSignatures: false since fee payer hasn't signed yet
    const serializedTransaction = signedTransaction.serialize({ requireAllSignatures: false });
    const encodedTransaction = Buffer.from(serializedTransaction).toString("base64");

    return { smartAccountAddress: smartAccountPda.toBase58(), encodedTransaction: encodedTransaction };
}

let PROGRAM_ID = new PublicKey("5j3KULcknCtpEPnLP8QnyQiBKrEw33rqfinYG7i8w46w");

const generateSmartAccount = (smartAccountId: string) => {

    const smartAccountIdBytes = Buffer.from(
        smartAccountId.replace(/-/g, ""),
        "hex"
    );

    const [smartAccountPda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_account"), smartAccountIdBytes],
        PROGRAM_ID
    );

    const [guardianRegistryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("guardian_registry"), smartAccountPda.toBuffer()],
        PROGRAM_ID
    );

    return { smartAccountId, smartAccountIdBytes, smartAccountPda, guardianRegistryPda, bump };
};
