import { User } from '../models/User.js';

export async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Weblix Admin';

  if (!email || !password) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD missing. Admin bootstrap skipped.');
    return;
  }

  if (password.length < 8) {
    console.warn('ADMIN_PASSWORD must be at least 8 characters. Admin bootstrap skipped.');
    return;
  }

  let admin = await User.findOne({ email }).select('+password');
  if (!admin) {
    admin = new User({ email, provider: 'local' });
  }

  admin.name = name;
  admin.password = password;
  admin.role = 'admin';
  admin.provider = 'local';
  admin.isEmailVerified = true;
  admin.twoFactorEnabled = process.env.ADMIN_TWO_FACTOR_ENABLED === 'false' ? false : admin.twoFactorEnabled;

  await admin.save();
  console.log(`Admin account ready: ${email}`);
}
