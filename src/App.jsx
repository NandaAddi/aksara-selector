import React, { useState, useEffect } from 'react';
import { 
  Check, ExternalLink, X, ArrowRight, LogOut, Copy, 
  ZoomIn, Loader2, Sparkles, ChevronLeft, ChevronRight, Aperture
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
      background: rgba(20, 20, 20, 0.75);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
    }

    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .animate-fade-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
    
    @keyframes pulse-slow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.95); } }
    .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
    
    /* MENCEGAH SCROLL SAAT LIGHTBOX BUKA */
    body.lightbox-open { overflow: hidden; }
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
        <div key={i} className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${i === index ? 'opacity-40' : 'opacity-0'}`}>
          <img src={img} alt="bg" className="w-full h-full object-cover grayscale brightness-75 scale-105" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-[#050505]/30" />
    </div>
  );
};

const Preloader = () => (
  <div className="fixed inset-0 z-[999] bg-[#050505] flex flex-col items-center justify-center transition-all duration-700">
    <div className="animate-pulse-slow flex flex-col items-center">
       <div className="w-20 h-20 border border-white/20 rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 border-t border-white rounded-full animate-spin"></div>
          <span className="font-serif text-4xl text-white italic">A</span>
       </div>
       <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-sans">Loading Gallery</p>
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
      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="glass-card rounded-[32px] p-8 md:p-10 relative overflow-hidden">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <span className="font-serif text-3xl italic">A</span>
            </div>
            <h1 className="font-serif text-3xl text-white mb-1">Aksara Picture</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.3em]">{isRegister ? 'Join Us' : 'Admin Portal'}</p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4 mb-8">
            {isRegister && <input name="name" type="text" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="input-field-auth" />}
            <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="input-field-auth" />
            <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input-field-auth" />
            <button type="submit" disabled={isLoading} className="w-full bg-white hover:bg-gray-200 text-black py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider mt-2 transition-all shadow-lg active:scale-95">
                {isLoading ? <Loader2 className="animate-spin mx-auto" size={16}/> : (isRegister ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center"><span className="px-4 text-[10px] uppercase text-white/30 bg-transparent backdrop-blur-md">Or</span></div>
          </div>
          <button onClick={() => googleLogin()} disabled={isLoading} className="w-full bg-white/5 border border-white/20 hover:bg-white/10 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-3 transition-all mb-6">Google Access</button>
          <p className="text-white/40 text-xs text-center">{isRegister ? "Have an account? " : "New here? "}<button type="button" onClick={() => setIsRegister(!isRegister)} className="text-white hover:underline font-bold ml-1 transition-all">{isRegister ? 'Log In' : 'Register'}</button></p>
        </div>
      </div>
      <style>{`.input-field-auth { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.75rem; padding: 0.75rem 1rem; color: white; outline: none; transition: all; font-size: 0.875rem; } .input-field-auth:focus { background: rgba(255,255,255,0.1); }`}</style>
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
    <div className="min-h-screen text-white p-4 md:p-8 font-sans animate-fade-up">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-center glass-card p-6 rounded-2xl gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20">
                {user.picture ? <img src={user.picture} alt="Profile" className="w-full h-full object-cover" /> : <div className="bg-white text-black h-full flex items-center justify-center font-bold">{user.given_name?.charAt(0)}</div>}
             </div>
             <div>
                <h2 className="text-xl font-serif">Hi, {user.given_name}</h2>
                <p className="text-xs text-white/40">Admin Dashboard</p>
             </div>
          </div>
          <button onClick={onLogout} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all self-end md:self-auto"><LogOut size={20} /></button>
        </header>

        <div className="glass-card p-6 md:p-8 rounded-3xl">
            <h3 className="font-serif text-2xl mb-6 flex items-center gap-2"><Aperture size={24}/> New Session</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client Name (e.g. Wedding Budi)" className="input-field" />
                <input type="text" value={folderUrl} onChange={(e) => setFolderUrl(e.target.value)} placeholder="Google Drive Folder Link" className="input-field" />
                <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="Max Limit (e.g. 10)" className="input-field" />
                <input type="text" value={photographerWa} onChange={(e) => setPhotographerWa(e.target.value)} placeholder="WhatsApp (628...)" className="input-field" />
            </div>
            <button onClick={handleGenerate} className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl mt-8 hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
                <Sparkles size={18} /> Generate Link
            </button>
        </div>

        {generatedLink && (
            <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 border-l-4 border-green-500 animate-scale-in">
                <div className="w-full break-all bg-black/30 p-3 rounded-lg font-mono text-xs text-white/70">{generatedLink}</div>
                <div className="flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(generatedLink); alert('Copied!'); }} className="btn-icon"><Copy size={18} /></button>
                    <button onClick={() => window.open(generatedLink, '_blank')} className="btn-icon"><ExternalLink size={18} /></button>
                    <button onClick={() => onPreviewClient({ clientName, folderLink: folderUrl, photographerWa, limit })} className="flex-1 bg-white text-black font-bold rounded-lg text-xs uppercase hover:bg-gray-200 py-3">Preview Gallery</button>
                </div>
            </div>
        )}
      </div>
      <style>{`.input-field { width: 100%; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.75rem; padding: 1rem; color: white; outline: none; background: rgba(255,255,255,0.05); transition: all; } .input-field:focus { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); } .btn-icon { padding: 0.75rem; background: rgba(255,255,255,0.1); border-radius: 0.5rem; color: white; transition: all; } .btn-icon:hover { background: rgba(255,255,255,0.2); }`}</style>
    </div>
  );
};

/* ==================================================================================
   3. CLIENT GALLERY (FIXED RESPONSIVE LIGHTBOX)
   ================================================================================== */
const ClientGallery = ({ config, onCloseSimulation }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  
  // Efek mematikan scroll body saat lightbox terbuka
  useEffect(() => {
    if (lightboxIndex !== null) document.body.classList.add('lightbox-open');
    else document.body.classList.remove('lightbox-open');
    return () => document.body.classList.remove('lightbox-open');
  }, [lightboxIndex]);

  // Keyboard Nav
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
      } catch (err) { alert("Gagal memuat foto."); } finally { setLoading(false); }
    };
    fetchPhotos();
  }, [config.folderLink]);

  const toggleSelect = (photo, e) => {
    if (e) e.stopPropagation();
    const exists = selected.find(p => p.id === photo.id);
    if (exists) setSelected(selected.filter(p => p.id !== photo.id));
    else {
      if (config.limit > 0 && selected.length >= config.limit) return alert(`Maksimal ${config.limit} foto.`);
      setSelected([...selected, photo]);
    }
  };

  const sendToWa = () => {
    if(selected.length === 0) return alert("Pilih foto dulu!");
    const list = selected.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
    const msg = `*Halo, saya ${config.clientName}*\nFoto pilihan (${selected.length}):\n\n${list}`;
    window.open(`https://wa.me/${config.photographerWa}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const nextImage = (e) => { if(e) e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % photos.length); };
  const prevImage = (e) => { if(e) e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length); };
  const getHighResUrl = (url) => url ? url.replace(/=s\d+/, '=s2048') : ''; 

  return (
    <div className="min-h-screen text-white pb-24">
      {/* Navbar Responsive */}
      <nav className="fixed top-0 w-full z-40 glass-card border-b-0 border-white/5 shadow-2xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
            <div className="flex flex-col">
                <h1 className="font-serif text-lg md:text-xl truncate max-w-[150px] md:max-w-xs">{config.clientName}</h1>
                <p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-widest">Gallery Selection</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="md:hidden bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-yellow-400 border border-white/10">
                   {selected.length}/{config.limit || '∞'}
                </div>
                <div className="hidden md:block text-right mr-2">
                    <p className="text-[10px] text-white/60 uppercase">Selected</p>
                    <p className="font-bold font-mono text-sm text-yellow-400">{selected.length} / {config.limit || '∞'}</p>
                </div>
                <button onClick={sendToWa} className="bg-white text-black px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all shadow-lg active:scale-95">Send</button>
                {onCloseSimulation && <button onClick={onCloseSimulation} className="p-2 md:p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20"><X size={18}/></button>}
            </div>
        </div>
      </nav>

      <main className="pt-24 md:pt-28 px-2 md:px-6 max-w-7xl mx-auto animate-fade-up">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="animate-spin mb-4 text-white/50" size={32} />
                <p className="text-white/40 text-sm animate-pulse tracking-widest uppercase">Loading High Res Photos...</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                {photos.map((photo, index) => {
                    const isSelected = selected.find(p => p.id === photo.id);
                    return (
                        <div key={photo.id} onClick={() => setLightboxIndex(index)} 
                             className={`relative aspect-[2/3] group cursor-pointer rounded-lg md:rounded-xl overflow-hidden transition-all duration-300 ${isSelected ? 'ring-2 md:ring-4 ring-yellow-400 z-10' : 'hover:opacity-90'}`}>
                            <img src={photo.thumbnailLink} alt="Thumb" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <button onClick={(e) => toggleSelect(photo, e)} className={`absolute bottom-2 right-2 md:bottom-3 md:right-3 p-2 md:p-3 rounded-full shadow-lg transition-all active:scale-75 ${isSelected ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white hover:text-black'}`}>
                                {isSelected ? <Check size={14} strokeWidth={4} /> : <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-current rounded-full" />}
                            </button>
                        </div>
                    );
                })}
            </div>
        )}
      </main>

      {/* --- RESPONSIVE LIGHTBOX (FIXED) --- */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div className="fixed inset-0 z-[100] bg-black h-[100dvh] w-full flex flex-col animate-scale-in">
            
            {/* 1. Header (Fixed Top) */}
            <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 bg-gradient-to-b from-black/80 to-transparent shrink-0 z-20">
                <span className="text-white/70 text-xs font-mono truncate max-w-[200px]">{photos[lightboxIndex].name}</span>
                <button onClick={() => setLightboxIndex(null)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20"><X size={20}/></button>
            </div>
            
            {/* 2. Main Image Area (Flexible Height) */}
            <div className="flex-1 relative w-full overflow-hidden flex items-center justify-center bg-black" onClick={() => setLightboxIndex(null)}>
                 
                 {/* Nav Buttons (Absolute) */}
                 <button onClick={prevImage} className="absolute left-2 md:left-6 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-white/10 rounded-full transition-all z-30" onClick={(e) => e.stopPropagation()}><ChevronLeft size={28} /></button>
                 <button onClick={nextImage} className="absolute right-2 md:right-6 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-white/10 rounded-full transition-all z-30" onClick={(e) => e.stopPropagation()}><ChevronRight size={28} /></button>

                 {/* Image (Contained) - NO SCROLL */}
                 <img 
                    src={getHighResUrl(photos[lightboxIndex].thumbnailLink)} 
                    className="max-w-full max-h-full object-contain p-2 md:p-6" 
                    alt="Full View"
                    onClick={(e) => e.stopPropagation()} // Supaya klik gambar tidak close
                 />
            </div>

            {/* 3. Footer / Action Bar (Fixed Bottom) */}
            <div className="h-20 md:h-24 flex items-center justify-center shrink-0 z-20 bg-gradient-to-t from-black/80 to-transparent pb-4">
                 <button onClick={(e) => toggleSelect(photos[lightboxIndex], e)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] ${selected.find(p => p.id === photos[lightboxIndex].id) ? 'bg-yellow-400 text-black scale-105' : 'bg-white/20 text-white border border-white/20 backdrop-blur-md'}`}>
                    {selected.find(p => p.id === photos[lightboxIndex].id) ? <><Check size={18} strokeWidth={3} /> Selected</> : 'Select Photo'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

/* ==================================================================================
   4. MAIN APP ROOT
   ================================================================================== */
export default function App() {
  const [session, setSession] = useState('login'); 
  const [user, setUser] = useState(null); 
  const [clientConfig, setClientConfig] = useState(null); 
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoad(false), 2500);
    return () => clearTimeout(timer);
  }, []);

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
    const savedUser = localStorage.getItem('aksara_admin_session');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); setSession('admin'); } catch (e) { localStorage.removeItem('aksara_admin_session'); }
    }
  }, []);

  const handleLogin = (u) => { localStorage.setItem('aksara_admin_session', JSON.stringify(u)); setUser(u); setSession('admin'); };
  const handleLogout = () => { if(confirm("Sign out?")) { localStorage.removeItem('aksara_admin_session'); setSession('login'); setUser(null); setClientConfig(null); window.history.pushState({}, '', '/'); }};

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GlobalStyles />
      <BackgroundSlideshow />
      {initialLoad ? ( <Preloader /> ) : (
         <div className="animate-fade-up">
            {clientConfig ? (
                <ClientGallery config={clientConfig} onCloseSimulation={session === 'admin' ? () => setClientConfig(null) : null} />
            ) : session === 'login' ? ( <LoginPanel onLogin={handleLogin} /> ) : ( <AdminPanel user={user} onPreviewClient={setClientConfig} onLogout={handleLogout} /> )}
         </div>
      )}
    </GoogleOAuthProvider>
  );
}
