import crypto from "crypto";

export class Encryption {
  private readonly key: Buffer;

  constructor() {
    const rawKey = process.env["ENCRYPTION_KEY"];

    if (!rawKey) {
      throw new Error("ENCRYPTION_KEY is required for KYC encryption");
    }

    if (!/^[0-9a-fA-F]{64}$/.test(rawKey)) {
      throw new Error(
        "ENCRYPTION_KEY must be a 64-character hex string for AES-256-CBC",
      );
    }

    this.key = Buffer.from(rawKey, "hex");
  }

  public encrypt(plainText: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plainText, "utf8"),
      cipher.final(),
    ]);

    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
  }

  public decrypt(stored: string): string {
    const parts = stored.split(":");

    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error("Encrypted value must be in <iv>:<ciphertext> format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const ciphertext = Buffer.from(parts[1], "hex");

    if (iv.length !== 16) {
      throw new Error("Encrypted value contains an invalid IV");
    }

    const decipher = crypto.createDecipheriv("aes-256-cbc", this.key, iv);
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  }
}
