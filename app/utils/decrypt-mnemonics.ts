import * as CryptoJS from 'crypto-js';

export async function decryptMnemonics(password: string, encryptedData: { cipherText: string; iv: string; salt: string }) {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  try {
    // Check if data was encrypted with CryptoJS (empty iv and salt)
    if (!encryptedData.iv && !encryptedData.salt) {
      console.log('Decrypting with CryptoJS (AES-CBC)');
      const decrypted = CryptoJS.AES.decrypt(encryptedData.cipherText, password);
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        throw new Error('CryptoJS decryption failed: Invalid password or corrupted ciphertext');
      }
      
      return decryptedText;
    }

    // Decrypt with Web Crypto API (AES-GCM)
    console.log('Decrypting with Web Crypto API (AES-GCM)');
    
    const toUint8 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const salt = toUint8(encryptedData.salt);
    const iv = toUint8(encryptedData.iv);
    const cipherBytes = toUint8(encryptedData.cipherText);

    // Check if Web Crypto API is supported
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API is not supported, but data was encrypted with AES-GCM');
    }

    const baseKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const iterations = 150000;
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      cipherBytes
    );

    return dec.decode(decrypted);
  } catch (error) {
    if (error instanceof Error) {
        return null
    } else {
        return null
    }
  }
}