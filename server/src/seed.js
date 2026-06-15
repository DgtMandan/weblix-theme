import 'dotenv/config';
import { connectDB } from './config/db.js';
import { ensureAdminUser } from './services/adminBootstrapService.js';
import { User } from './models/User.js';

await connectDB();
await ensureAdminUser();
await User.deleteOne({ email: 'admin@weblix.test' });
process.exit(0);
