import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('database.sqlite');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE,
    password TEXT,
    balance REAL DEFAULT 0,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    daily_earning REAL,
    total_income REAL,
    validity_days INTEGER,
    referral_commission REAL,
    image_url TEXT,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS user_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    package_id INTEGER,
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    last_claim_at DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(package_id) REFERENCES packages(id)
  );

  CREATE TABLE IF NOT EXISTS deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL,
    transaction_id TEXT UNIQUE,
    method TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL,
    method TEXT,
    account_number TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS gift_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    amount REAL,
    max_claims INTEGER,
    claimed_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gift_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    code_id INTEGER,
    claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(code_id) REFERENCES gift_codes(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Default Settings
const defaultSettings = [
  { key: 'bkash_number', value: '01700000000' },
  { key: 'nagad_number', value: '01800000000' },
  { key: 'app_notice', value: 'Welcome to Hopwed Investment App!' },
  { key: 'deposit_status', value: 'on' },
  { key: 'withdraw_status', value: 'on' }
];

const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
defaultSettings.forEach(s => insertSetting.run(s.key, s.value));

// Create Admin if not exists
const adminPhone = '01712345678';
const adminPass = 'admin123';
const existingAdmin = db.prepare('SELECT * FROM users WHERE phone = ?').get(adminPhone);
if (!existingAdmin) {
  const hashedPass = bcrypt.hashSync(adminPass, 10);
  db.prepare('INSERT INTO users (phone, password, role) VALUES (?, ?, ?)').run(adminPhone, hashedPass, 'admin');
}

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Middleware to verify JWT
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  };

  // Auth Routes
  app.post('/api/register', (req, res) => {
    const { phone, password } = req.body;
    try {
      const hashedPass = bcrypt.hashSync(password, 10);
      const result = db.prepare('INSERT INTO users (phone, password) VALUES (?, ?)').run(phone, hashedPass);
      const user = db.prepare('SELECT id, phone, role FROM users WHERE id = ?').get(result.lastInsertRowid) as any;
      const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, JWT_SECRET);
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ user });
    } catch (err) {
      res.status(400).json({ error: 'Phone number already registered' });
    }
  });

  app.post('/api/login', (req, res) => {
    const { phone, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as any;
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, JWT_SECRET);
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ user: { id: user.id, phone: user.phone, role: user.role } });
  });

  app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/me', authenticate, (req: any, res) => {
    const user = db.prepare('SELECT id, phone, balance, role FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  });

  // User App Routes
  app.get('/api/packages', authenticate, (req, res) => {
    const packages = db.prepare('SELECT * FROM packages WHERE status = "active"').all();
    res.json(packages);
  });

  app.post('/api/buy-package', authenticate, (req: any, res) => {
    const { packageId } = req.body;
    const pkg = db.prepare('SELECT * FROM packages WHERE id = ?').get(packageId) as any;
    const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.user.id) as any;

    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    if (user.balance < pkg.price) return res.status(400).json({ error: 'Insufficient balance' });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + pkg.validity_days);

    const transaction = db.transaction(() => {
      db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(pkg.price, req.user.id);
      db.prepare('INSERT INTO user_packages (user_id, package_id, expires_at, last_claim_at) VALUES (?, ?, ?, ?)').run(
        req.user.id, packageId, expiresAt.toISOString(), new Date().toISOString()
      );
    });
    transaction();
    res.json({ success: true });
  });

  app.get('/api/my-packages', authenticate, (req: any, res) => {
    const packages = db.prepare(`
      SELECT up.*, p.name, p.daily_earning, p.total_income 
      FROM user_packages up 
      JOIN packages p ON up.package_id = p.id 
      WHERE up.user_id = ?
    `).all(req.user.id);
    res.json(packages);
  });

  app.post('/api/claim-earning', authenticate, (req: any, res) => {
    const { userPackageId } = req.body;
    const up = db.prepare('SELECT up.*, p.daily_earning FROM user_packages up JOIN packages p ON up.package_id = p.id WHERE up.id = ? AND up.user_id = ?').get(userPackageId, req.user.id) as any;
    
    if (!up) return res.status(404).json({ error: 'Package not found' });
    
    const lastClaim = new Date(up.last_claim_at);
    const now = new Date();
    const diffHours = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) return res.status(400).json({ error: 'You can claim once every 24 hours' });

    const transaction = db.transaction(() => {
      db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(up.daily_earning, req.user.id);
      db.prepare('UPDATE user_packages SET last_claim_at = ? WHERE id = ?').run(now.toISOString(), userPackageId);
    });
    transaction();
    res.json({ success: true, earning: up.daily_earning });
  });

  app.post('/api/deposit', authenticate, (req: any, res) => {
    const { amount, transactionId, method } = req.body;
    try {
      db.prepare('INSERT INTO deposits (user_id, amount, transaction_id, method) VALUES (?, ?, ?, ?)').run(
        req.user.id, amount, transactionId, method
      );
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: 'Transaction ID already used' });
    }
  });

  app.post('/api/withdraw', authenticate, (req: any, res) => {
    const { amount, method, accountNumber } = req.body;
    const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.user.id) as any;
    
    if (user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

    const transaction = db.transaction(() => {
      db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(amount, req.user.id);
      db.prepare('INSERT INTO withdrawals (user_id, amount, method, account_number) VALUES (?, ?, ?, ?)').run(
        req.user.id, amount, method, accountNumber
      );
    });
    transaction();
    res.json({ success: true });
  });

  app.get('/api/history/deposits', authenticate, (req: any, res) => {
    const history = db.prepare('SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(history);
  });

  app.get('/api/history/withdrawals', authenticate, (req: any, res) => {
    const history = db.prepare('SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(history);
  });

  app.post('/api/claim-gift', authenticate, (req: any, res) => {
    const { code } = req.body;
    const gift = db.prepare('SELECT * FROM gift_codes WHERE code = ?').get(code) as any;
    
    if (!gift) return res.status(404).json({ error: 'Invalid gift code' });
    if (gift.claimed_count >= gift.max_claims) return res.status(400).json({ error: 'Gift code expired' });
    
    const alreadyClaimed = db.prepare('SELECT * FROM gift_claims WHERE user_id = ? AND code_id = ?').get(req.user.id, gift.id);
    if (alreadyClaimed) return res.status(400).json({ error: 'You already claimed this gift' });

    const transaction = db.transaction(() => {
      db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(gift.amount, req.user.id);
      db.prepare('UPDATE gift_codes SET claimed_count = claimed_count + 1 WHERE id = ?').run(gift.id);
      db.prepare('INSERT INTO gift_claims (user_id, code_id) VALUES (?, ?)').run(req.user.id, gift.id);
    });
    transaction();
    res.json({ success: true, amount: gift.amount });
  });

  app.get('/api/settings', (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsObj = settings.reduce((acc: any, s: any) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    res.json(settingsObj);
  });

  app.get('/api/notices', (req, res) => {
    const notices = db.prepare('SELECT * FROM notices ORDER BY created_at DESC LIMIT 5').all();
    res.json(notices);
  });

  // Admin Routes
  app.get('/api/admin/users', authenticate, isAdmin, (req, res) => {
    const users = db.prepare('SELECT id, phone, balance, role, created_at FROM users').all();
    res.json(users);
  });

  app.get('/api/admin/users/search', authenticate, isAdmin, (req, res) => {
    const { phone } = req.query;
    const user = db.prepare('SELECT id, phone, balance, role, created_at FROM users WHERE phone = ?').get(phone);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const userPackages = db.prepare(`
      SELECT up.*, p.name 
      FROM user_packages up 
      JOIN packages p ON up.package_id = p.id 
      WHERE up.user_id = ?
    `).all((user as any).id);
    
    const deposits = db.prepare('SELECT * FROM deposits WHERE user_id = ?').all((user as any).id);
    const withdrawals = db.prepare('SELECT * FROM withdrawals WHERE user_id = ?').all((user as any).id);
    
    res.json({ user, packages: userPackages, deposits, withdrawals });
  });

  app.post('/api/admin/users/update-balance', authenticate, isAdmin, (req, res) => {
    const { userId, amount, type } = req.body; // type: 'add' or 'subtract'
    if (type === 'add') {
      db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, userId);
    } else {
      db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(amount, userId);
    }
    res.json({ success: true });
  });

  app.post('/api/admin/packages', authenticate, isAdmin, (req, res) => {
    const { name, price, daily_earning, total_income, validity_days, referral_commission, image_url } = req.body;
    db.prepare(`
      INSERT INTO packages (name, price, daily_earning, total_income, validity_days, referral_commission, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, price, daily_earning, total_income, validity_days, referral_commission, image_url);
    res.json({ success: true });
  });

  app.put('/api/admin/packages/:id', authenticate, isAdmin, (req, res) => {
    const { id } = req.params;
    const { name, price, daily_earning, total_income, validity_days, referral_commission, image_url, status } = req.body;
    db.prepare(`
      UPDATE packages SET name=?, price=?, daily_earning=?, total_income=?, validity_days=?, referral_commission=?, image_url=?, status=?
      WHERE id=?
    `).run(name, price, daily_earning, total_income, validity_days, referral_commission, image_url, status, id);
    res.json({ success: true });
  });

  app.get('/api/admin/deposits', authenticate, isAdmin, (req, res) => {
    const deposits = db.prepare(`
      SELECT d.*, u.phone 
      FROM deposits d 
      JOIN users u ON d.user_id = u.id 
      ORDER BY d.created_at DESC
    `).all();
    res.json(deposits);
  });

  app.post('/api/admin/deposits/action', authenticate, isAdmin, (req, res) => {
    const { depositId, action } = req.body; // action: 'approve' or 'reject'
    const deposit = db.prepare('SELECT * FROM deposits WHERE id = ?').get(depositId) as any;
    
    if (!deposit || deposit.status !== 'pending') return res.status(400).json({ error: 'Invalid deposit' });

    if (action === 'approve') {
      const transaction = db.transaction(() => {
        db.prepare('UPDATE deposits SET status = "approved" WHERE id = ?').run(depositId);
        db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(deposit.amount, deposit.user_id);
      });
      transaction();
    } else {
      db.prepare('UPDATE deposits SET status = "rejected" WHERE id = ?').run(depositId);
    }
    res.json({ success: true });
  });

  app.get('/api/admin/withdrawals', authenticate, isAdmin, (req, res) => {
    const withdrawals = db.prepare(`
      SELECT w.*, u.phone 
      FROM withdrawals w 
      JOIN users u ON w.user_id = u.id 
      ORDER BY w.created_at DESC
    `).all();
    res.json(withdrawals);
  });

  app.post('/api/admin/withdrawals/action', authenticate, isAdmin, (req, res) => {
    const { withdrawalId, action } = req.body; // action: 'approve' or 'reject'
    const withdrawal = db.prepare('SELECT * FROM withdrawals WHERE id = ?').get(withdrawalId) as any;
    
    if (!withdrawal || withdrawal.status !== 'pending') return res.status(400).json({ error: 'Invalid withdrawal' });

    if (action === 'approve') {
      db.prepare('UPDATE withdrawals SET status = "approved" WHERE id = ?').run(withdrawalId);
    } else {
      const transaction = db.transaction(() => {
        db.prepare('UPDATE withdrawals SET status = "rejected" WHERE id = ?').run(withdrawalId);
        db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(withdrawal.amount, withdrawal.user_id);
      });
      transaction();
    }
    res.json({ success: true });
  });

  app.post('/api/admin/settings', authenticate, isAdmin, (req, res) => {
    const { key, value } = req.body;
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
    res.json({ success: true });
  });

  app.post('/api/admin/notices', authenticate, isAdmin, (req, res) => {
    const { content } = req.body;
    db.prepare('INSERT INTO notices (content) VALUES (?)').run(content);
    res.json({ success: true });
  });

  app.post('/api/admin/gift-codes', authenticate, isAdmin, (req, res) => {
    const { code, amount, max_claims } = req.body;
    db.prepare('INSERT INTO gift_codes (code, amount, max_claims) VALUES (?, ?, ?)').run(code, amount, max_claims);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
