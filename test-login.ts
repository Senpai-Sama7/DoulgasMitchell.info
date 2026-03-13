import { findAdminUserByEmail } from './src/lib/admin-compat.ts';
import { verifyPassword } from './src/lib/auth.ts';

async function test() {
  console.log('Testing fallback login...');
  const email = 'DouglasMitchell@ReliantAI.org';
  const password = 'tJjsbxr2P8a7afIuXGd9FVs5Kw9M';
  
  try {
    const user = await findAdminUserByEmail(email);
    console.log('User found:', user ? user.email : null);
    
    if (user && user.passwordHash) {
      const isValid = await verifyPassword(password, user.passwordHash);
      console.log('Password is valid:', isValid);
    }
  } catch (e) {
    console.error('Error during test:', e);
  } finally {
    process.exit();
  }
}

test();
