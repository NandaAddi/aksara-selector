import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

/* ==================================================================================
   1. DATABASE SETUP (OPTIMIZED FOR SERVERLESS/VERCEL)
   ================================================================================== */
const MONGODB_URI = process.env.MONGODB_URI;

// Menggunakan Global Cache agar koneksi tidak putus-nyambung terus menerus
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error('⚠️ MONGODB_URI tidak ditemukan di Environment Variables Vercel!');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ Terhubung ke MongoDB");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// --- MODEL USER ---
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Cek models agar tidak error saat hot-reload
const User = mongoose.models.User || mongoose.model('User', UserSchema);

/* ==================================================================================
   2. AUTH ROUTE (LOGIN & REGISTER)
   ================================================================================== */

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    await connectToDatabase(); // <--- Wajib connect dulu

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Semua kolom wajib diisi!' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: 'Email sudah terdaftar!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ 
        message: 'Registrasi berhasil!', 
        user: { name: newUser.name, email: newUser.email } 
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: `Gagal Register: ${error.message}` });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    await connectToDatabase(); // <--- Wajib connect dulu

    const { email, password } = req.body;
    
    // Cari user
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ error: 'Email tidak ditemukan!' });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: 'Password salah!' });
    }

    // Kirim data user
    res.json({ 
        id: user._id, 
        given_name: user.name, 
        email: user.email, 
        picture: null 
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: `Gagal Login: ${error.message}` });
  }
});

/* ==================================================================================
   3. GOOGLE DRIVE SETUP (UPDATED DEBUGGING)
   ================================================================================== */
const getAuth = () => {
    // Cek Environment Variable
    if (process.env.GOOGLE_CREDENTIALS) {
        try {
            const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
            return new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/drive.readonly'],
            });
        } catch (e) {
            throw new Error("Format GOOGLE_CREDENTIALS di Vercel Settings salah (Bukan JSON valid).");
        }
    }
    throw new Error("Environment Variable 'GOOGLE_CREDENTIALS' tidak ditemukan di Vercel.");
};

const getFolderIdFromUrl = (url) => {
  if (!url) return null;
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
};

// API PHOTOS
app.post('/api/photos', async (req, res) => {
  try {
    const { folderUrl } = req.body;
    
    // Validasi Folder ID
    const folderId = getFolderIdFromUrl(folderUrl);
    if (!folderId) {
        return res.status(400).json({ error: 'Link Google Drive tidak valid.' });
    }

    // Validasi Auth
    let auth;
    try {
        auth = getAuth();
    } catch (authError) {
        console.error("Auth Error:", authError.message);
        return res.status(500).json({ error: authError.message }); 
    }
    
    const service = google.drive({ version: 'v3', auth });
    
    // Fetch Data (Looping)
    let allFiles = [];
    let pageToken = null;
    let loopCount = 0;

    do {
      if (loopCount > 5) break; 
      
      const response = await service.files.list({
        q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed = false`,
        fields: 'nextPageToken, files(id, name, thumbnailLink)', 
        pageSize: 1000, 
        pageToken: pageToken,
      });

      const files = response.data.files;
      if (files && files.length > 0) {
        const highResFiles = files.map(f => ({
            id: f.id,
            name: f.name,
            thumbnailLink: f.thumbnailLink ? f.thumbnailLink.replace(/=s\d+/, '=s800') : '' 
        }));
        allFiles.push(...highResFiles);
      }
      pageToken = response.data.nextPageToken;
      loopCount++;
    } while (pageToken);

    console.log(`Success: ${allFiles.length} photos`);
    res.json(allFiles);

  } catch (error) {
    console.error("API Crash:", error);
    
    if (error.message && error.message.includes('permissions')) {
        return res.status(500).json({ error: "Bot email belum dijadikan Viewer di folder Drive ini." });
    }

    res.status(500).json({ error: `Server Error: ${error.message}` });
  }
});

app.get('/api', (req, res) => res.send("Aksara API Ready"));

// WAJIB EXPORT DEFAULT UNTUK VERCEL
export default app;
