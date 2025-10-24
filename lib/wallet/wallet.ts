import 'react-native-get-random-values';

import { Keypair, Transaction } from "@solana/web3.js";
import * as bip39 from 'bip39';
import slip10 from 'micro-key-producer/slip10.js';
import * as Keychain from 'react-native-keychain';


// Helper function to sign a Solana transaction
export async function signSolanaTransaction(transaction: Transaction): Promise<Transaction> {

  const credentials = await Keychain.getGenericPassword({
    service: 'bip39_seed_phrase',
    authenticationPrompt: {
      title: 'Authenticate to access your seed phrase',
      cancel: 'Cancel',
    },
  });
  if(credentials){
    const seed = bip39.mnemonicToSeedSync(credentials.password);
    const hdMaster = slip10.fromMasterSeed(new Uint8Array(seed));
    const derived = hdMaster.derive("m/44'/501'/0'/0'");
    const privateKey = Uint8Array.from(derived.privateKey);
    const keypair = Keypair.fromSeed(privateKey);

    transaction.sign(keypair);
  
    return transaction;
  }else{
    throw new Error('No credentials found');
  }  
}