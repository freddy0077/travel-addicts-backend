import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const options = { 
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'travel-addict-api'
  };
  
  return (jwt.sign as any)(payload, secret, options);
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback-secret',
      { issuer: 'travel-addict-api' }
    ) as JWTPayload;
    
    return decoded;
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateBookingReference = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TA-${year}-${randomNum}`;
};

export const formatPriceFromPesewas = (pesewas: number): string => {
  const cedis = pesewas / 100;
  return `GH₵ ${cedis.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const convertCedisToPesewas = (cedis: number): number => {
  return Math.round(cedis * 100);
};

export const convertPesewasToCedis = (pesewas: number): number => {
  return pesewas / 100;
};
