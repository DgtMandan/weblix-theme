import 'dotenv/config';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';

const adminEmail = process.env.ADMIN_EMAIL || 'mandanyadav900@gmail.com';
const adminPassword = process.env.ADMIN_PASSWORD;
const adminName = process.env.ADMIN_NAME || 'Weblix Admin';

if (!adminPassword || adminPassword.length < 8) {
  console.error('ADMIN_PASSWORD is required and must be at least 8 characters.');
  process.exit(1);
}

await connectDB();

let admin = await User.findOne({ email: adminEmail }).select('+password');
if (!admin) {
  admin = new User({ email: adminEmail, provider: 'local' });
}

admin.name = adminName;
admin.password = adminPassword;
admin.role = 'admin';
admin.provider = 'local';
admin.isEmailVerified = true;
await admin.save();

await User.deleteOne({ email: 'admin@weblix.test' });

console.log(`Admin ready: ${adminEmail}`);
process.exit(0);
