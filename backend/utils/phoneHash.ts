// 📍 FILE: backend/utils/hashPhone.ts
import crypto from "crypto";

// ✅ Hashes phone number consistently for user lookups
export function hashPhone(phone: string): string {
  return crypto.createHash("sha256").update(phone).digest("hex");
}

