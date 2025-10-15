import * as CryptoJS from 'crypto-js';
export async function encryptMnemonics(password: string, mnemonics: string) {
  if (!window.crypto || !window.crypto.subtle) {
    console.warn('Web Crypto API not supported, falling back to CryptoJS');
    const ciphertext = CryptoJS.AES.encrypt(mnemonics, password).toString();
    return {
      cipherText: ciphertext,
      iv: '', 
      salt: '', 
    };
  }
  try {
    const enc = new TextEncoder();

    // Create a salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    console.log('Salt generated:', salt);

    // Encode password to make a key
    const baseKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    console.log('Base key imported');

    // Derive key with salt
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
      ['encrypt', 'decrypt']
    );
    console.log('Key derived');

    // Create an initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(12));
    console.log('IV generated:', iv);

    // Encrypt mnemonics
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      enc.encode(mnemonics)
    );
    console.log('Encryption successful');

    // Convert to Base64
    const toBase64 = (buf: ArrayBuffer) => {
      const bytes = new Uint8Array(buf);
      const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
      return btoa(binary);
    };

    return {
      cipherText: toBase64(encrypted),
      iv: toBase64(iv.buffer),
      salt: toBase64(salt.buffer),
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Encryption failed:', error.message);
      throw new Error(`Encryption failed: ${error.message}`);
    } else {
      console.error('Encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }
}