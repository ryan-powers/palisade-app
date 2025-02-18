import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Hashes the phone number with a random salt each time
export async function hashPhone(phone: string): Promise<string> {
  return bcrypt.hash(phone, SALT_ROUNDS);
}

// Checks if a plaintext phone matches a stored bcrypt hash
export async function comparePhone(phone: string, phoneHash: string): Promise<boolean> {
  return bcrypt.compare(phone, phoneHash);
}
