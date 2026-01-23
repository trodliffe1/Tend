import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';

const ITERATIONS = 100000;
const KEY_SIZE = 256 / 32; // 256-bit key

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

async function generateSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return bytesToHex(bytes);
}

async function generateIV(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return bytesToHex(bytes);
}

function deriveKey(password: string, salt: string): CryptoJS.lib.WordArray {
  return CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
    keySize: KEY_SIZE,
    iterations: ITERATIONS,
  });
}

export interface EncryptedPayload {
  encrypted: string;
  salt: string;
  iv: string;
}

export async function encryptData(
  data: object,
  password: string
): Promise<EncryptedPayload> {
  const salt = await generateSalt();
  const iv = await generateIV();
  const key = deriveKey(password, salt);

  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    key,
    {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  return {
    encrypted: encrypted.toString(),
    salt,
    iv,
  };
}

export function decryptData<T = object>(
  encrypted: string,
  password: string,
  salt: string,
  iv: string
): T | null {
  try {
    const key = deriveKey(password, salt);
    const decrypted = CryptoJS.AES.decrypt(
      encrypted,
      key,
      {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
    if (!decryptedStr) {
      return null;
    }

    return JSON.parse(decryptedStr) as T;
  } catch {
    return null;
  }
}
