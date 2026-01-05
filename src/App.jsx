import React, { useState, useEffect, useCallback } from 'react';
import { 
  Check, ExternalLink, X, LogOut, Copy, 
  Loader2, Sparkles, ChevronLeft, ChevronRight, Aperture
} from 'lucide-react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

/* ==================================================================================
   KONFIGURASI GLOBAL
   ================================================================================== */
const GOOGLE_CLIENT_ID = "963212157034-pqg657cicgnmtikm59v04rdi46fo1cqc.apps.googleusercontent.com"; 

/* --- BACKGROUND SLIDESHOW IMAGES --- */
const BG_IMAGES = [
  "https://raw.githubusercontent.com/NandaAddi/aksara-selector/refs/heads/main/4.jpg", // Wedding/Love
  "https://raw.githubusercontent.com/NandaAddi/aksara-selector/refs/heads/main/5.jpg", // Moody Black White
  "https://raw.githubusercontent.com/NandaAddi/aksara-selector/refs/heads/main/6.jpg", // Nature/Light
];

/* ==================================================================================
   STYLES & ANIMATIONS
   ================================================================================== */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Manrope:wght@300;400;600;800&display=swap');
    
    .font-serif { font-family: 'Cormorant Garamond', serif; }
    .font-sans { font-family: 'Manrope', sans-serif; }
    
    .glass-card {
      background: rgba(20, 20, 20, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
    }

    /* ANIMASI HALUS */
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .animate-fade-up { animation: fadeInUp 0.6s ease-out forwards; }
    .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
    
    /* UTILS */
    .no-scroll { overflow: hidden !important; height: 100vh !important; touch-action: none; }
    .touch-manipulation { touch-action: manipulation; }
  `}</style>
);

/* ==================================================================================
   COMPONENTS: VISUALS
   ================================================================================== */
const BackgroundSlideshow = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIndex((prev) => (prev + 1) % BG_IMAGES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black -z-10 overflow-hidden">
      {BG_IMAGES.map((img, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${i === index ? 'opacity-50' : 'opacity-0'}`}>
          <img src={img} alt="bg" className="w-full h-full object-cover grayscale brightness-50 scale-105" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-[#050505]/20" />
    </div>
  );
};

const Preloader = () => (
  <div className="fixed inset-0 z-[999] bg-[#050505] flex items-center justify-center">
    <div className="flex flex-col items-center animate-pulse">
       <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center mb-4 relative">
          <div className="absolute inset-0 border-t border-white rounded-full animate-spin"></div>
          <span className="font-serif text-2xl text-white italic">A</span>
       </div>
       <p className="text-white/50 text-[10px] uppercase tracking-[0.3em] font-sans">Loading...</p>
    </div>
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
        const user = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${res.access_token}` } });
        onLogin(user.data);
      } catch (e) { setIsLoading(false); alert('Login Gagal'); }
    }, onError: () => setIsLoading(false)
  });

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
        const res = await axios.post(endpoint, formData);
        if(isRegister) { alert("Registrasi Berhasil!"); setIsRegister(false); setFormData({name:'', email:'', password:''}); }
        else { onLogin(res.data); }
    } catch (err) { alert(err.response?.data?.error || "Error koneksi."); } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative">
      <div className="w-full max-w-sm relative z-10 animate-fade-up">
        <div className="glass-card rounded-[2rem] p-8 relative overflow-hidden">
          <div className="mb-6 text-center">
            <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <span className="font-serif text-2xl italic">A</span>
            </div>
            <h1 className="font-serif text-2xl text-white">Aksara Picture</h1>
            <p className="text-white/40 text-[9px] uppercase tracking-[0.2em]">{isRegister ? 'Create Account' : 'Welcome Back'}</p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3 mb-6">
            {isRegister && <input name="name" type="text" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="input-field-auth" />}
            <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="input-field-auth" />
            <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input-field-auth" />
            <button type="submit" disabled={isLoading} className="w-full bg-white hover:bg-gray-200 text-black py-3 rounded-xl font-bold text-xs uppercase tracking-wider mt-2 shadow-lg active:scale-95 transition-transform">
                {isLoading ? <Loader2 className="animate-spin mx-auto" size={16}/> : (isRegister ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center"><span className="px-3 text-[9px] uppercase text-white/30 bg-black/20 backdrop-blur-md rounded">Or</span></div>
          </div>
          <button onClick={() => googleLogin()} disabled={isLoading} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wide mb-4 transition-colors">Google Access</button>
          <p className="text-white/40 text-xs text-center cursor-pointer hover:text-white transition-colors" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Have an account? Log In" : "New here? Register"}
          </p>
        </div>
      </div>
      <style>{`.input-field-auth { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.75rem; padding: 0.75rem 1rem; color: white; outline: none; transition: all; font-size: 0.85rem; } .input-field-auth:focus { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); }`}</style>
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
    if (!folderUrl || !clientName) return alert("Isi Nama Client & Link Drive.");
    const baseUrl = window.location.origin + '/select';
    const params = new URLSearchParams({ client: clientName, folder: folderUrl, wa: photographerWa, limit: limit });
    setGeneratedLink(`${baseUrl}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen text-white p-4 font-sans animate-fade-up">
      <div className="max-w-3xl mx-auto space-y-4">
        <header className="flex justify-between items-center glass-card p-4 rounded-2xl">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                {user.picture ? <img src={user.picture} alt="Profile" className="w-full h-full object-cover" /> : <div className="bg-white text-black h-full flex items-center justify-center font-bold">{user.given_name?.charAt(0)}</div>}
             </div>
             <div><h2 className="text-lg font-serif">{user.given_name}</h2></div>
          </div>
          <button onClick={onLogout} className="p-2.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"><LogOut size={18} /></button>
        </header>

        <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-serif text-xl mb-4 flex items-center gap-2"><Aperture size={20}/> New Session</h3>
            <div className="grid gap-3">
                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client Name" className="input-field" />
                <input type="text" value={folderUrl} onChange={(e) => setFolderUrl(e.target.value)} placeholder="Google Drive Link" className="input-field" />
                <div className="grid grid-cols-2 gap-3">
                    <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="Max Limit" className="input-field" />
                    <input type="text" value={photographerWa} onChange={(e) => setPhotographerWa(e.target.value)} placeholder="WhatsApp (628...)" className="input-field" />
                </div>
            </div>
            <button onClick={handleGenerate} className="w-full bg-white text-black font-bold uppercase tracking-widest py-3.5 rounded-xl mt-6 hover:bg-gray-200 transition-transform active:scale-95 flex items-center justify-center gap-2">
                <Sparkles size={16} /> Generate
            </button>
        </div>

        {generatedLink && (
            <div className="glass-card p-4 rounded-xl flex flex-col gap-3 animate-scale-in">
                <div className="bg-black/40 p-3 rounded text-xs text-white/70 break-all font-mono">{generatedLink}</div>
                <div className="flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(generatedLink); alert('Copied!'); }} className="btn-icon"><Copy size={16} /></button>
                    <button onClick={() => window.open(generatedLink, '_blank')} className="btn-icon"><ExternalLink size={16} /></button>
                    <button onClick={() => onPreviewClient({ clientName, folderLink: folderUrl, photographerWa, limit })} className="flex-1 bg-white text-black font-bold rounded-lg text-xs uppercase hover:bg-gray-200">Preview</button>
                </div>
            </div>
        )}
      </div>
      <style>{`.input-field { width: 100%; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.75rem; padding: 0.85rem; color: white; outline: none; background: rgba(255,255,255,0.05); font-size: 0.9rem; } .input-field:focus { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.1); } .btn-icon { padding: 0.75rem; background: rgba(255,255,255,0.1); border-radius: 0.5rem; color: white; }`}</style>
    </div>
  );
};

/* ==================================================================================
   3. CLIENT GALLERY (FIXED: BUTTONS, RESOLUTION, SCROLL)
   ================================================================================== */
const ClientGallery = ({ config, onCloseSimulation }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  
  // LOCK BODY SCROLL saat Lightbox aktif
  useEffect(() => {
    if (lightboxIndex !== null) document.body.classList.add('no-scroll');
    else document.body.classList.remove('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, [lightboxIndex]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowRight') nextImage(e);
      if (e.key === 'ArrowLeft') prevImage(e);
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
        // Modifikasi data foto untuk optimasi GRID
        const optimizedPhotos = res.data.map(p => ({
            ...p,
            // Grid menggunakan 's300-c' agar kotak & sangat ringan
            gridUrl: p.thumbnailLink ? p.thumbnailLink.replace(/=s\d+/, '=s300-c') : '' 
        }));
        setPhotos(optimizedPhotos);
      } catch (err) { alert("Gagal memuat foto."); } finally { setLoading(false); }
    };
    fetchPhotos();
  }, [config.folderLink]);

  const toggleSelect = (photo, e) => {
    if (e) e.stopPropagation();
    const exists = selected.find(p => p.id === photo.id);
    if (exists) setSelected(selected.filter(p => p.id !== photo.id));
    else {
      if (config.limit > 0 && selected.length >= config.limit) return alert(`Max ${config.limit} photos.`);
      setSelected([...selected, photo]);
    }
  };

  const sendToWa = () => {
    if(selected.length === 0) return alert("Pilih foto dulu!");
    const list = selected.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
    const msg = `*Halo, saya ${config.clientName}*\nSaya sudah memilih ${selected.length} foto:\n\n${list}`;
    window.open(`https://wa.me/${config.photographerWa}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Navigasi Lightbox (Dipisah agar event clean)
  const nextImage = (e) => { if(e) e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % photos.length); };
  const prevImage = (e) => { if(e) e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length); };
  
  // URL untuk Lightbox (Resolusi 1024px = Cukup Tajam tapi Cepat)
  const getLightboxUrl = (url) => url ? url.replace(/=s\d+/, '=s1024') : ''; 

  return (
    <div className="min-h-screen text-white pb-20">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 glass-card border-b border-white/5 h-16 flex items-center justify-between px-4">
          <div className="flex flex-col">
              <h1 className="font-serif text-lg leading-tight truncate max-w-[140px]">{config.clientName}</h1>
              <p className="text-[9px] text-white/50 uppercase tracking-widest">Selection</p>
          </div>
          <div className="flex items-center gap-3">
              <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-yellow-400 border border-white/10">
                  {selected.length}/{config.limit || '∞'}
              </div>
              <button onClick={sendToWa} className="bg-white text-black px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 active:scale-95 transition-transform">
                  Send
              </button>
              {onCloseSimulation && <button onClick={onCloseSimulation} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><X size={16}/></button>}
          </div>
      </nav>

      <main className="pt-20 px-2 max-w-7xl mx-auto animate-fade-up">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="animate-spin mb-3 text-white/50" size={28} />
                <p className="text-white/40 text-[10px] animate-pulse uppercase tracking-widest">Loading...</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {photos.map((photo, index) => {
                    const isSelected = selected.find(p => p.id === photo.id);
                    return (
                        <div key={photo.id} onClick={() => setLightboxIndex(index)} 
                             className={`relative aspect-square group cursor-pointer bg-white/5 rounded-lg overflow-hidden transition-all duration-300 ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}>
                            <img src={photo.gridUrl} alt="Thumb" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                            
                            {/* Tombol Select di Grid */}
                            <button onClick={(e) => toggleSelect(photo, e)} className={`absolute top-2 right-2 p-1.5 rounded-full transition-all active:scale-90 ${isSelected ? 'bg-yellow-400 text-black shadow-lg' : 'bg-black/30 text-white backdrop-blur-sm'}`}>
                                {isSelected ? <Check size={12} strokeWidth={4} /> : <div className="w-3 h-3 border border-white/80 rounded-full" />}
                            </button>
                        </div>
                    );
                })}
            </div>
        )}
      </main>

      {/* --- LIGHTBOX V2 (FIXED LAYOUT & RESOLUTION) --- */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col animate-scale-in" onClick={() => setLightboxIndex(null)}>
            
            {/* Header Lightbox */}
            <div className="absolute top-0 w-full h-16 flex items-center justify-between px-4 z-[110] bg-gradient-to-b from-black/80 to-transparent" onClick={(e) => e.stopPropagation()}>
                <span className="text-white/80 text-xs font-mono">{photos[lightboxIndex].name}</span>
                <button onClick={() => setLightboxIndex(null)} className="p-2 bg-white/10 rounded-full text-white active:bg-white/20"><X size={20}/></button>
            </div>

            {/* Container Gambar (Flex Center Absolute) */}
            <div className="absolute inset-0 flex items-center justify-center p-0 md:p-10 z-[101]">
                <img 
                    src={getLightboxUrl(photos[lightboxIndex].thumbnailLink)} 
                    className="max-w-full max-h-full object-contain shadow-2xl" 
                    alt="Full View"
                    onClick={(e) => e.stopPropagation()} /* Mencegah close saat klik gambar */
                />
            </div>

            {/* Navigasi (Tombol Besar di Kiri Kanan Layar) */}
            <button onClick={prevImage} className="absolute left-0 top-1/2 -translate-y-1/2 p-4 md:p-6 text-white/50 hover:text-white z-[120] touch-manipulation outline-none" style={{WebkitTapHighlightColor: 'transparent'}}>
                <ChevronLeft size={40} className="drop-shadow-lg filter" />
            </button>
            <button onClick={nextImage} className="absolute right-0 top-1/2 -translate-y-1/2 p-4 md:p-6 text-white/50 hover:text-white z-[120] touch-manipulation outline-none" style={{WebkitTapHighlightColor: 'transparent'}}>
                <ChevronRight size={40} className="drop-shadow-lg filter" />
            </button>

            {/* Footer Action (Floating) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[110]" onClick={(e) => e.stopPropagation()}>
                 <button onClick={(e) => toggleSelect(photos[lightboxIndex], e)}
                    className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(0,0,0,0.6)] active:scale-95 ${selected.find(p => p.id === photos[lightboxIndex].id) ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white border border-white/20 backdrop-blur-md'}`}>
                    {selected.find(p => p.id === photos[lightboxIndex].id) ? <><Check size={18} strokeWidth={3} /> Selected</> : 'Select Photo'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

/* ==================================================================================
   4. ROOT APP
   ================================================================================== */
export default function App() {
  const [session, setSession] = useState('login'); 
  const [user, setUser] = useState(null); 
  const [clientConfig, setClientConfig] = useState(null); 
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => { const t = setTimeout(() => setInitialLoad(false), 2000); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (window.location.pathname.includes('/select') || params.get('client')) {
        const clientName = params.get('client');
        const folderLink = params.get('folder');
        const photographerWa = params.get('wa');
        const limit = params.get('limit');
        if (clientName && folderLink) {
            setClientConfig({ clientName, folderLink, photographerWa: photographerWa || '', limit: limit || 0 });
            return;
        }
    }
    const saved = localStorage.getItem('aksara_admin');
    if (saved) { try { setUser(JSON.parse(saved)); setSession('admin'); } catch (e) { localStorage.removeItem('aksara_admin'); } }
  }, []);

  const handleLogin = (u) => { localStorage.setItem('aksara_admin', JSON.stringify(u)); setUser(u); setSession('admin'); };
  const handleLogout = () => { if(confirm("Keluar?")) { localStorage.removeItem('aksara_admin'); setSession('login'); setUser(null); setClientConfig(null); window.history.pushState({}, '', '/'); }};

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GlobalStyles />
      <BackgroundSlideshow />
      {initialLoad ? <Preloader /> : (
         <div className="animate-fade-up">
            {clientConfig ? <ClientGallery config={clientConfig} onCloseSimulation={session === 'admin' ? () => setClientConfig(null) : null} /> 
            : session === 'login' ? <LoginPanel onLogin={handleLogin} /> 
            : <AdminPanel user={user} onPreviewClient={setClientConfig} onLogout={handleLogout} />}
         </div>
      )}
    </GoogleOAuthProvider>
  );
}
