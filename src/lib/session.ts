import { createHash } from "node:crypto";
import { CompactEncrypt, compactDecrypt } from "jose";
import type { NextRequest } from "next/server";

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  const raw = createHash("sha256").update(secret).digest();
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptSession(payload: {
  accessToken: string;
}): Promise<string> {
  const key = await getKey();
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  return new CompactEncrypt(plaintext)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .encrypt(key);
}

export async function decryptSession(
  token: string,
): Promise<{ accessToken: string } | null> {
  try {
    const key = await getKey();
    const { plaintext } = await compactDecrypt(token, key);
    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch {
    return null;
  }
}

export async function getAccessTokenFromRequest(
  request: NextRequest,
): Promise<string | null> {
  const sid = request.cookies.get("sid")?.value;
  if (!sid) return null;
  const session = await decryptSession(sid);
  return session?.accessToken ?? null;
}
