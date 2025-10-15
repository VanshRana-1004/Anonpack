import { randomBytes } from "crypto";
import { keccak256 } from "ethereum-cryptography/keccak";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { bytesToHex } from "ethereum-cryptography/utils";

export async function createEthereumAcc(mnemonics : string,ind : number){

    const privateKey = randomBytes(32);
    const publicKey = secp256k1.getPublicKey(privateKey);
    const address = bytesToHex(keccak256(publicKey.slice(1)).slice(-20));

    return {
        address: '0x' + address,
        privateKey: '0x' + bytesToHex(privateKey)
    };

}