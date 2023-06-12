import crypto from 'crypto'

function hashPassword (password: string, salt?: string): string {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return salt + ':' + hash;
}

export { hashPassword }
