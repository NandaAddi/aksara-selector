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

// --- DATABASE SETUP ---
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI).catch(err => console.error("MongoDB Error:", err));
}
const UserSchema = new mongoose.Schema({
  name: String, email: String, password: String
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// --- AUTH ROUTE (Login/Register) ---
app.post('/api/auth/register', async (req, res) => { /* ... kode sama ... */ });
app.post('/api/auth/login', async (req, res) => { /* ... kode sama ... */ });

// --- GOOGLE DRIVE SETUP (UPDATED DEBUGGING) ---
const getAuth = () => {
    // 1. Cek Environment Variable (Prioritas Vercel)
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

// --- API PHOTOS (UPDATED DEBUGGING) ---
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
    
    // Coba Fetch Data
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
    // TANGKAP ERROR DAN KIRIM KE FRONTEND
    console.error("API Crash:", error);
    
    // Cek error permission
    if (error.message && error.message.includes('permissions')) {
        return res.status(500).json({ error: "Bot email belum dijadikan Viewer di folder Drive ini." });
    }

    // Kirim pesan error asli biar ketahuan sebabnya
    res.status(500).json({ error: `Server Error: ${error.message}` });
  }
});

app.get('/api', (req, res) => res.send("Aksara API Ready"));

export default app;
