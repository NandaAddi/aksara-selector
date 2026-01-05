// ... (Bagian atas kode import dan setup server biarkan sama) ...

// Endpoint Photos (DIOPTIMALKAN)
app.post('/api/photos', async (req, res) => {
  const { folderUrl } = req.body;
  const folderId = getFolderIdFromUrl(folderUrl);

  if (!folderId) return res.status(400).json({ error: 'Link folder tidak valid' });

  try {
    const auth = getAuth();
    if (!auth) throw new Error("Credential Google tidak ditemukan di Server.");
    
    const service = google.drive({ version: 'v3', auth });
    
    let allFiles = [];
    let pageToken = null;
    let loopCount = 0;

    // LOOPING PENGAMBILAN DATA
    do {
      // Safety break: Cegah looping tak terbatas jika data ribuan (Vercel limit 10s)
      if (loopCount > 5) break; 

      const response = await service.files.list({
        q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed = false`,
        // OPTIMASI 1: Ambil hanya field yang perlu saja (id, name, thumbnailLink) untuk hemat bandwidth
        fields: 'nextPageToken, files(id, name, thumbnailLink)', 
        // OPTIMASI 2: Set ke MAX (1000). Defaultnya cuma 100.
        pageSize: 1000, 
        pageToken: pageToken,
      });

      const files = response.data.files;
      if (files && files.length > 0) {
        // Manipulasi link thumbnail agar resolusi tinggi
        const highResFiles = files.map(f => ({
            id: f.id,
            name: f.name,
            // Trik Google Drive: ubah parameter ukuran gambar
            thumbnailLink: f.thumbnailLink ? f.thumbnailLink.replace(/=s\d+/, '=s800') : '' 
        }));
        allFiles.push(...highResFiles);
      }
      
      pageToken = response.data.nextPageToken;
      loopCount++;
      
    } while (pageToken); // Ulangi jika masih ada halaman selanjutnya

    console.log(`Berhasil mengambil ${allFiles.length} foto.`);
    res.json(allFiles);

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ... (Sisa kode export default app biarkan sama) ...
