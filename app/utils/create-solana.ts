import nacl from "tweetnacl";
import { derivePath } from "ed25519-hd-key";
import { mnemonicToSeedSync } from "bip39";
import bs58 from "bs58";

export async function createSolanaAcc(mnemonics : string, ind : number) {
    const seed = mnemonicToSeedSync(mnemonics);

    const path = `m/44'/501'/${ind}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;

    const keyPair = nacl.sign.keyPair.fromSeed(derivedSeed);
    return {
        publicKey : bs58.encode(Buffer.from(keyPair.publicKey)),
        privateKey : bs58.encode(Buffer.from(keyPair.secretKey))
    }
}