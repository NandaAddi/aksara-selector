import React, { useState, useEffect } from 'react';
import { 
  Check, ExternalLink, X, Eye, ArrowRight, LogOut, Copy, 
  Link as LinkIcon, ZoomIn, Loader2, Image as ImageIcon, 
  Sparkles, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

/* ==================================================================================
   KONFIGURASI GLOBAL
   ================================================================================== */
const GOOGLE_CLIENT_ID = "963212157034-pqg657cicgnmtikm59v04rdi46fo1cqc.apps.googleusercontent.com"; 

/* --- STYLES & BACKGROUND --- */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Manrope:wght@300;400;600;800&display=swap');
    .font-serif { font-family: 'Cormorant Garamond', serif; }
    .font-sans { font-family: 'Manrope', sans-serif; }
    .glass-card {
      background: rgba(20, 20, 20, 0.6);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }
    @keyframes enter {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-enter { animation: enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    
    /* Hide Scrollbar for Lightbox */
    .no-scroll { overflow: hidden; }
  `}</style>
);

const CinematicBackground = () => (
  <div className="fixed inset-0 bg-[#0a0a0a] overflow-hidden -z-10">
    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2942&auto=format&fit=crop')] bg-cover bg-center opacity-20 transform scale-110 blur-sm grayscale" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
  </div>
);

/* ==================================================================================
   1. LOGIN PANEL
   ================================================================================== */
const LoginPanel = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const googleLogin = useGoogleLogin({
    onSuccess: async (res) => {
      setIsLoading(true);
      try {
        const user = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', { 
            headers: { Authorization: `Bearer ${res.access_token}` }
        });
        onLogin(user.data);
      } catch (e) { 
          setIsLoading(false); 
          alert('Login Google Gagal: ' + e.message); 
      }
    },
    onError: () => setIsLoading(false)
  });

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const BASE_API = ''; 

    try {
        if (isRegister) {
            await axios.post(`${BASE_API}/api/auth/register`, {
                name: formData.name, email: formData.email, password: formData.password
            });
            alert("Registrasi Berhasil! Silakan Login.");
            setIsRegister(false); setFormData({ name: '', email: '', password: '' });
        } else {
            const res = await axios.post(`${BASE_API}/api/auth/login`, {
                email: formData.email, password: formData.password
            });
            onLogin(res.data);
        }
    } catch (err) {
        alert(err.response?.data?.error || "Terjadi kesalahan koneksi.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-sans relative">
      <GlobalStyles /> <CinematicBackground />
      <div className="w-full max-w-md relative z-10 animate-enter text-center">
        <div className="glass-card rounded-[32px] p-10 relative overflow-hidden">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-serif text-3xl italic">A</span>
            </div>
            <h1 className="font-serif text-3xl text-white mb-1">Aksara Picture</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.3em]">
                {isRegister ? 'Create Account' : 'Admin Access'}
            </p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4 mb-8 text-left">
            {isRegister && (
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-3">Full Name</label>
                    <input name="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleChange} required 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:bg-white/10 transition-all text-sm" />
                </div>
            )}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-3">Email</label>
                <input name="email" type="email" placeholder="admin@aksara.com" value={formData.email} onChange={handleChange} required 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:bg-white/10 transition-all text-sm" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-3">Password</label>
                <input name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:bg-white/10 transition-all text-sm" />
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-white hover:bg-gray-200 text-black py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider mt-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {isLoading ? <Loader2 className="animate-spin mx-auto" size={16}/> : (isRegister ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="px-4 text-white/30 bg-[#1a1a1a]/0 backdrop-blur-md">Or continue with</span>
            </div>
          </div>

          <button onClick={() => googleLogin()} disabled={isLoading} className="w-full bg-transparent border border-white/20 hover:bg-white/10 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-3 transition-all mb-6">
             <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" /><path fill="currentColor" d="M12 4.63c1.61 0 3.06.56 4.21 1.64l3.16-3.16C17.45 1.18 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
             Google Account
          </button>

          <p className="text-white/40 text-xs">
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-white hover:underline font-bold ml-1 transition-all">
                {isRegister ? 'Log In' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

/* ==================================================================================
   2. ADMIN PANEL
   ================================================================================== */
const AdminPanel = ({ user, onPreviewClient, onLogout }) => {
  const [folderUrl, setFolderUrl] = useState('');
  const [clientName, setClientName] = useState('');
  const [photographerWa, setPhotographerWa] = useState('');
  const [limit, setLimit] = useState(10);
  const [generatedLink, setGeneratedLink] = useState('');

  const handleGenerate = () => {
    if (!folderUrl || !clientName) {
        alert("Mohon isi Nama Client dan Link Google Drive.");
        return;
    }
    const baseUrl = window.location.origin + '/select';
    const params = new URLSearchParams({
        client: clientName, folder: folderUrl, wa: photographerWa, limit: limit
    });
    setGeneratedLink(`${baseUrl}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans">
      <GlobalStyles />
      <div className="max-w-4xl mx-auto space-y-8 animate-enter">
        <header className="flex justify-between items-center glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-4">
             {user.picture ? (
                <img src={user.picture} alt="Profile" className="w-12 h-12 rounded-full border border-white/20" />
             ) : (
                <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-bold text-xl">{user.given_name?.charAt(0) || "A"}</div>
             )}
             <div>
                <h2 className="text-xl font-serif">Welcome, {user.given_name}</h2>
                <p className="text-xs text-white/40">{user.email}</p>
             </div>
          </div>
          <button onClick={onLogout} className="p-3 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white">
            <LogOut size={20} />
          </button>
        </header>

        <div className="glass-card p-8 rounded-3xl">
            <h3 className="font-serif text-2xl mb-6">Create New Session</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Client Name</label>
                    <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Wedding Budi & Ani" 
                           className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:bg-white/10 transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Drive Folder Link</label>
                    <input type="text" value={folderUrl} onChange={(e) => setFolderUrl(e.target.value)} placeholder="https://drive.google.com/drive/folders/..." 
                           className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:bg-white/10 transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Max Selection</label>
                    <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="10" 
                           className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:bg-white/10 transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">WhatsApp Number</label>
                    <input type="text" value={photographerWa} onChange={(e) => setPhotographerWa(e.target.value)} placeholder="628123456789" 
                           className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:bg-white/10 transition-all" />
                </div>
            </div>
            <button onClick={handleGenerate} className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl mt-8 hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                <Sparkles size={18} /> Generate Link
            </button>
        </div>

        {generatedLink && (
            <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between border-l-4 border-green-500">
                <div className="overflow-hidden w-full">
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Generated Link</p>
                    <p className="text-white/90 truncate font-mono text-sm">{generatedLink}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button onClick={() => { navigator.clipboard.writeText(generatedLink); alert('Link Copied!'); }} className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all"><Copy size={18} /></button>
                    <button onClick={() => window.open(generatedLink, '_blank')} className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all"><ExternalLink size={18} /></button>
                    <button onClick={() => onPreviewClient({ clientName, folderLink: folderUrl, photographerWa, limit })} className="px-4 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all text-xs uppercase tracking-wide">Preview</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

/* ==================================================================================
   3. CLIENT GALLERY (UPDATED: LIGHTBOX + NAVIGATION)
   ================================================================================== */
const ClientGallery = ({ config, onCloseSimulation }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [isSubmit, setIsSubmit] = useState(false);
  
  // --- STATE LIGHTBOX (BARU) ---
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setLightboxIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const res = await axios.post('/api/photos', { folderUrl: config.folderLink });
        setPhotos(res.data);
      } catch (err) {
        setError("Gagal memuat foto. Pastikan link benar dan bot sudah diundang.");
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [config.folderLink]);

  const toggleSelect = (photo, e) => {
    if (e) e.stopPropagation(); // Mencegah membuka lightbox saat klik tombol pilih
    const exists = selected.find(p => p.id === photo.id);
    if (exists) {
      setSelected(selected.filter(p => p.id !== photo.id));
    } else {
      if (config.limit > 0 && selected.length >= config.limit) {
        alert(`Maksimal ${config.limit} foto.`);
        return;
      }
      setSelected([...selected, photo]);
    }
  };

  const sendToWa = () => {
    if(selected.length === 0) return alert("Pilih foto dulu!");
    let message = `*Halo, saya ${config.clientName}*\nBerikut foto pilihan saya (${selected.length} foto):\n\n`;
    selected.forEach((p, index) => { message += `${index + 1}. ${p.name}\n`; });
    message += `\nTerima kasih!`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${config.photographerWa}?text=${encoded}`, '_blank');
    setIsSubmit(true);
  };

  // --- LIGHTBOX FUNCTIONS (BARU) ---
  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = (e) => {
    if(e) e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % photos.length);
  };
  const prevImage = (e) => {
    if(e) e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };
  const getHighResUrl = (url) => {
    // Ubah parameter size menjadi lebih besar untuk mode fullscreen
    return url ? url.replace(/=s\d+/, '=s2048') : ''; 
  };

  if (isSubmit) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white text-center p-6">
            <div className="glass-card p-10 rounded-3xl max-w-lg">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={40} className="text-black" /></div>
                <h1 className="text-3xl font-serif mb-4">Terkirim!</h1>
                <p className="text-white/60 mb-8">Pilihan foto Anda telah dikirim ke WhatsApp fotografer.</p>
                {onCloseSimulation && <button onClick={onCloseSimulation} className="bg-white/10 px-6 py-3 rounded-xl hover:bg-white/20 transition-all">Kembali ke Admin</button>}
            </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <GlobalStyles />
      
      {/* Navbar Client */}
      <nav className="fixed top-0 w-full z-40 glass-card border-b-0 border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div>
                <h1 className="font-serif text-xl">{config.clientName}</h1>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Select your favorites</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden md:block text-right">
                    <p className="text-xs text-white/60">Selected</p>
                    <p className="font-bold font-mono">{selected.length} / {config.limit > 0 ? config.limit : '∞'}</p>
                </div>
                <button onClick={sendToWa} className="bg-white text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Send</button>
                {onCloseSimulation && <button onClick={onCloseSimulation} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20"><X size={20}/></button>}
            </div>
        </div>
      </nav>

      {/* Grid Content */}
      <main className="pt-28 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin mb-4 text-white/50" size={32} />
                <p className="text-white/40 text-sm animate-pulse">Loading gallery...</p>
            </div>
        ) : error ? (
            <div className="text-center py-20 bg-red-500/10 rounded-3xl border border-red-500/20"><p className="text-red-400 mb-2">{error}</p></div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => {
                    const isSelected = selected.find(p => p.id === photo.id);
                    return (
                        <div key={photo.id} 
                             onClick={() => openLightbox(index)} // <--- KLIK UTAMA BUKA LIGHTBOX
                             className={`relative aspect-[2/3] group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${isSelected ? 'ring-4 ring-white scale-95' : 'hover:opacity-90'}`}>
                            
                            <img src={photo.thumbnailLink} alt={photo.name} className="w-full h-full object-cover" loading="lazy" />
                            
                            {/* Overlay Gradient (Hanya hiasan) */}
                            <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 flex items-center justify-center ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            
                            {/* Tombol Select (Pojok Kanan Bawah) - Agar bisa pilih tanpa buka lightbox */}
                            <button 
                                onClick={(e) => toggleSelect(photo, e)}
                                className={`absolute top-2 right-2 p-2 rounded-full transition-all z-10 shadow-lg ${isSelected ? 'bg-white text-black' : 'bg-black/40 text-white backdrop-blur-sm hover:bg-white hover:text-black'}`}
                            >
                                {isSelected ? <Check size={16} strokeWidth={3} /> : <div className="w-4 h-4 border border-white rounded-full" />}
                            </button>

                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-xs truncate font-mono text-white/80">{photo.name}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </main>

      {/* ======================================================= */}
      {/* COMPONENT: LIGHTBOX (FULLSCREEN VIEWER)                 */}
      {/* ======================================================= */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-200" onClick={closeLightbox}>
            
            {/* Navigasi Kiri */}
            <button 
                onClick={prevImage}
                className="absolute left-4 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[102]"
            >
                <ChevronLeft size={40} />
            </button>

            {/* Gambar Utama */}
            <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                <img 
                    src={getHighResUrl(photos[lightboxIndex].thumbnailLink)} 
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                    alt="Full Preview"
                />
            </div>

            {/* Navigasi Kanan */}
            <button 
                onClick={nextImage}
                className="absolute right-4 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[102]"
            >
                <ChevronRight size={40} />
            </button>

            {/* Tombol Close */}
            <button 
                onClick={closeLightbox}
                className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-red-500/80 transition-colors z-[102]"
            >
                <X size={24} />
            </button>
            
            {/* Info & Select di Bawah */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-[102]" onClick={(e) => e.stopPropagation()}>
                 <div className="bg-black/50 px-4 py-2 rounded-full text-sm text-white/80 backdrop-blur-md font-mono">
                    {photos[lightboxIndex].name}
                 </div>
                 
                 <button 
                    onClick={(e) => toggleSelect(photos[lightboxIndex], e)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all shadow-xl ${
                        selected.find(p => p.id === photos[lightboxIndex].id) 
                        ? 'bg-white text-black hover:scale-105' 
                        : 'bg-white/20 text-white hover:bg-white hover:text-black border border-white/20'
                    }`}
                >
                    {selected.find(p => p.id === photos[lightboxIndex].id) 
                        ? <><Check size={18} /> Selected</> 
                        : 'Select Photo'}
                </button>
            </div>

        </div>
      )}

    </div>
  );
};

/* ==================================================================================
   4. MAIN APP ROUTER
   ================================================================================== */
export default function App() {
  const [session, setSession] = useState('login'); 
  const [user, setUser] = useState(null); 
  const [clientConfig, setClientConfig] = useState(null); 

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    if (path.includes('/select') || params.get('client')) {
        const clientName = params.get('client');
        const folderLink = params.get('folder');
        const photographerWa = params.get('wa');
        const limit = params.get('limit');

        if (clientName && folderLink) {
            setClientConfig({ clientName, folderLink, photographerWa: photographerWa || '', limit: limit || 0 });
            return; 
        }
    }

    const savedUser = localStorage.getItem('aksara_admin_session');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setSession('admin');
      } catch (e) {
        localStorage.removeItem('aksara_admin_session');
      }
    }
  }, []);

  const handleLogin = (u) => { 
    localStorage.setItem('aksara_admin_session', JSON.stringify(u));
    setUser(u); 
    setSession('admin'); 
  };

  const handleLogout = () => { 
    if(confirm("Sign out?")) { 
      localStorage.removeItem('aksara_admin_session');
      setSession('login'); 
      setUser(null); 
      setClientConfig(null); 
      window.history.pushState({}, '', '/');
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {clientConfig ? (
          <ClientGallery config={clientConfig} onCloseSimulation={session === 'admin' ? () => setClientConfig(null) : null} />
      ) : session === 'login' ? (
          <LoginPanel onLogin={handleLogin} />
      ) : (
          <AdminPanel user={user} onPreviewClient={setClientConfig} onLogout={handleLogout} />
      )}
    </GoogleOAuthProvider>
  );
}
