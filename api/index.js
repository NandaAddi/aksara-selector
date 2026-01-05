import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const app = express();

// Konfigurasi CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

/* ==================================================================================
   KONFIGURASI DATABASE (MONGODB)
   ================================================================================== */
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ Terhubung ke MongoDB"))
    .catch(err => console.error("❌ Gagal connect MongoDB:", err));
}

// Model User
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Cek apakah model sudah ada (untuk mencegah overwrite saat hot-reload serverless)
const User = mongoose.models.User || mongoose.model('User', UserSchema);

/* ==================================================================================
   ENDPOINT AUTH
   ================================================================================== */

// 1. REGISTER
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Semua kolom wajib diisi!' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email sudah terdaftar!' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: 'Registrasi berhasil!', user: { name: newUser.name, email: newUser.email } });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Email atau password salah!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Email atau password salah!' });

    res.json({ id: user._id, given_name: user.name, email: user.email, picture: null });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

/* ==================================================================================
   GOOGLE DRIVE API
   ================================================================================== */
// Ambil Credentials dari Env
const getAuth = () => {
    if (process.env.GOOGLE_CREDENTIALS) {
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        return new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
    }
    return null;
};

// Helper: Extract Folder ID
const getFolderIdFromUrl = (url) => {
  if (!url) return null;
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
};

// Endpoint Photos
app.post('/api/photos', async (req, res) => {
  const { folderUrl } = req.body;
  const folderId = getFolderIdFromUrl(folderUrl);

  if (!folderId) return res.status(400).json({ error: 'Link folder tidak valid' });

  try {
    const auth = getAuth();
    if (!auth) throw new Error("Credential Google tidak ditemukan di Server.");
    
    const service = google.drive({ version: 'v3', auth });
    
    // Ambil file dari Drive (Looping jika banyak)
    let allFiles = [];
    let pageToken = null;

    do {
      const response = await service.files.list({
        q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed = false`,
        fields: 'nextPageToken, files(id, name, thumbnailLink)', // thumbnailLink penting
        pageSize: 100, // Ambil 100 per batch
        pageToken: pageToken,
      });

      const files = response.data.files;
      if (files) {
        // Manipulasi link thumbnail agar resolusi tinggi
        const highResFiles = files.map(f => ({
            id: f.id,
            name: f.name,
            // Google Drive thumbnail hack: ubah =s220 menjadi =s1200 agar HD
            thumbnailLink: f.thumbnailLink ? f.thumbnailLink.replace(/=s\d+/, '=s1200') : '' 
        }));
        allFiles.push(...highResFiles);
      }
      pageToken = response.data.nextPageToken;
    } while (pageToken);

    res.json(allFiles);

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Default Route
app.get('/api', (req, res) => res.send("Aksara API is Running..."));

// EXPORT APP (PENTING: Gunakan export default karena "type": "module")
export default app;
