import React, { useState, useEffect } from 'react';
import { Check, ExternalLink, X, Eye, ArrowRight, LogOut, Copy, Link as LinkIcon, ZoomIn, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';

/* ==================================================================================
   🛠️ PANDUAN PENGGUNAAN (MASTER FILE)
   
   Tema: "LUXURY DARK EDITORIAL"
   Status: RE-DESIGNED BY FRONT-END SPECIALIST
   ================================================================================== */

// ==========================================
// 🟢 BAGIAN 1: REAL PRODUCTION IMPORTS
// ==========================================
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';




/* --- KONFIGURASI --- */
const GOOGLE_CLIENT_ID = "963212157034-pqg657cicgnmtikm59v04rdi46fo1cqc.apps.googleusercontent.com";
const API_URL = 'http://localhost:5000/api/photos';

const BACKGROUND_IMAGES = [
  '4.jpg', // Dark moody nature
  '5.jpg', // Foggy forest
  '6.jpg', // Abstract dark
];

const MOCK_IMAGES = [
  { id: '1', name: 'WEDDING_001.jpg', thumbnailLink: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80', previewLink: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200' },
  { id: '2', name: 'WEDDING_002.jpg', thumbnailLink: 'https://images.unsplash.com/photo-1511285560982-1351cdeb9821?w=400&q=80', previewLink: 'https://images.unsplash.com/photo-1511285560982-1351cdeb9821?w=1200' },
  { id: '3', name: 'WEDDING_003.jpg', thumbnailLink: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&q=80', previewLink: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200' },
  { id: '4', name: 'WEDDING_004.jpg', thumbnailLink: 'https://images.unsplash.com/photo-1520854221256-17451cc330e7?w=400&q=80', previewLink: 'https://images.unsplash.com/photo-1520854221256-17451cc330e7?w=1200' },
  { id: '5', name: 'WEDDING_005.jpg', thumbnailLink: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80', previewLink: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200' },
  { id: '6', name: 'WEDDING_006.jpg', thumbnailLink: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&q=80', previewLink: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1200' },
];

/* --- GLOBAL STYLES & ANIMATIONS --- */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Manrope:wght@300;400;600;800&display=swap');
    
    .font-serif { font-family: 'Cormorant Garamond', serif; }
    .font-sans { font-family: 'Manrope', sans-serif; }
    
    .glass-card {
      background: rgba(20, 20, 20, 0.6);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    
    .grain-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 50;
    }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-enter { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `}</style>
);

/* --- UI COMPONENTS --- */

const Button = ({ children, onClick, variant = 'primary', className = '', disabled, icon: Icon }) => {
  const baseStyle = "relative overflow-hidden transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-sans font-bold tracking-wider text-xs uppercase py-4 px-8 rounded-full flex items-center justify-center gap-2 group";
  
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] border border-transparent",
    secondary: "bg-transparent text-white border border-white/20 hover:bg-white/10 hover:border-white/40 backdrop-blur-md",
    glass: "bg-black/40 text-white border border-white/10 hover:bg-black/60 backdrop-blur-xl"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
      {Icon && <Icon size={16} className="transition-transform group-hover:translate-x-1" />}
    </button>
  );
};

const InputField = ({ label, type, placeholder, value, onChange, prefix }) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-4 group-focus-within:text-white transition-colors">
      {label}
    </label>
    <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 focus-within:bg-white/10 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20">
      <input 
        type={type} 
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-transparent text-white placeholder-white/20 px-6 py-4 outline-none font-sans text-sm font-medium ${prefix ? 'pl-14' : ''}`}
      />
      {prefix && (
        <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-white/10 bg-white/5">
          <span className="text-white/40 text-xs font-bold">{prefix}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-white transition-all duration-500 group-focus-within:w-full opacity-50" />
    </div>
  </div>
);

const CinematicBackground = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length), 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-black">
      {BACKGROUND_IMAGES.map((img, i) => (
        <div key={i} 
          className="absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-in-out"
          style={{ 
            backgroundImage: `url(${img})`, 
            opacity: i === index ? 0.6 : 0,
            transform: i === index ? 'scale(1.1)' : 'scale(1)'
          }} 
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
      <div className="grain-overlay" />
    </div>
  );
};

// 1. LOGIN PANEL (TETAP SAMA)
const LoginPanel = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const login = useGoogleLogin({
    onSuccess: async (res) => {
      setIsLoading(true);
      try {
        const user = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${res.access_token}` }});
        onLogin(user.data);
      } catch (e) { setIsLoading(false); }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-sans relative">
      <GlobalStyles />
      <CinematicBackground />
      
      <div className="w-full max-w-md relative z-10 animate-enter">
        <div className="glass-card rounded-[32px] p-8 md:p-12 text-center relative overflow-hidden group">
          {/* Decorative Glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-[50px] group-hover:bg-white/20 transition-all duration-1000"></div>
          
          <div className="mb-10 relative">
            <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
               <span className="font-serif text-4xl italic font-medium -mt-1">A</span>
            </div>
            <h1 className="font-serif text-4xl text-white mb-2 tracking-tight">Aksara Picture</h1>
            <p className="text-white/40 text-xs uppercase tracking-[0.3em] font-medium">Selector Photo coy</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => login()}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-100 text-black py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  <span className="font-bold text-sm tracking-wide">Enter Workspace</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-white/20 mt-6">Authorized Personnel Only</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. ADMIN PANEL (UPDATE: INPUT LIMIT)
const AdminPanel = ({ user, onPreviewClient, onLogout }) => {
  // Tambah state 'limit'
  const [formData, setFormData] = useState({ 
    clientName: '', 
    folderLink: '', 
    photographerWa: '', 
    limit: 0 // 0 = Unlimited
  });
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.clientName && formData.photographerWa) {
      // Masukkan limit ke URL jika ada
      const limitParam = formData.limit > 0 ? `&limit=${formData.limit}` : '';
      setResult({ 
          ...formData, 
          url: `https://aksara.studio/select?client=${encodeURIComponent(formData.clientName)}${limitParam}` 
      });
    }
  };

  const copy = () => { navigator.clipboard.writeText(result.url); alert('Copied!'); };

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative font-sans">
        <GlobalStyles />
        <CinematicBackground />
        <div className="glass-card max-w-md w-full rounded-[30px] p-8 z-10 text-center animate-enter border-t border-white/20">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={28} />
          </div>
          <h2 className="font-serif text-3xl text-white mb-2">Ready to Deliver</h2>
          <p className="text-white/60 text-sm mb-8 font-light">Gallery access for <span className="text-white font-medium">{result.clientName}</span> created.</p>

          <div className="bg-black/30 border border-white/10 rounded-xl p-4 mb-6 flex items-center gap-3">
            <code className="text-xs text-white/70 truncate font-mono flex-1">{result.url}</code>
            <button onClick={copy} className="text-white/40 hover:text-white transition-colors"><Copy size={16}/></button>
          </div>

          <div className="space-y-3">
            <Button variant="primary" onClick={() => onPreviewClient(result)} icon={Eye} className="w-full">Open Live Preview</Button>
            <Button variant="secondary" onClick={() => setResult(null)} className="w-full">Create Another</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative">
      <GlobalStyles />
      <CinematicBackground />

      <div className="max-w-xl w-full relative z-10 animate-enter">
        <div className="glass-card rounded-[32px] overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-serif font-bold italic">A</div>
              <div>
                <h1 className="text-white font-serif text-lg tracking-wide">New Session</h1>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Logged as {user.given_name}</p>
              </div>
            </div>
            <button onClick={onLogout} className="text-white/30 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-full"><LogOut size={18} /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <InputField label="Client Name" type="text" placeholder="e.g. Nanda" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
            <InputField label="Google Drive Link" type="url" placeholder="https://drive.google.com/..." value={formData.folderLink} onChange={e => setFormData({...formData, folderLink: e.target.value})} />
            
            {/* Split Row for Limit & WA */}
            <div className="grid grid-cols-2 gap-4">
                <InputField 
                    label="Max Photos" 
                    type="number" 
                    placeholder="0 (Unlimited)" 
                    value={formData.limit} 
                    onChange={e => setFormData({...formData, limit: parseInt(e.target.value) || 0})} 
                />
                <InputField 
                    label="WhatsApp" 
                    prefix="+62" 
                    type="tel" 
                    placeholder="812..." 
                    value={formData.photographerWa} 
                    onChange={e => setFormData({...formData, photographerWa: e.target.value})} 
                />
            </div>

            <div className="pt-4">
              <Button variant="primary" className="w-full py-5 text-sm" icon={Sparkles}>Generate Access Link</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// 3. CLIENT GALLERY (UPDATE: LOGIKA PEMBATASAN & UI LUXURY)
const ClientGallery = ({ config, onCloseSimulation }) => {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [viewImg, setViewImg] = useState(null);

  // Ambil Limit (Konversi ke integer, default 0)
  const maxLimit = parseInt(config.limit) || 0;
  const isLimitReached = maxLimit > 0 && selected.size >= maxLimit;

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        // Panggil Backend Real
const response = await axios.get(`/api/photos?folderLink=${encodeURIComponent(config.folderLink)}`);
        setImages(response.data);
      } catch (err) {
        console.error("Gagal ambil foto:", err);
        alert("Gagal mengambil foto. Pastikan Backend (Port 5000) menyala.");
      } finally {
        setLoading(false);
      }
    };

    if (config?.folderLink) {
      fetchImages();
    }
  }, [config]);

  const toggle = (id) => {
    const s = new Set(selected);
    if (s.has(id)) {
      s.delete(id);
    } else {
      // Cek Limit
      if (maxLimit > 0 && s.size >= maxLimit) {
        alert(`Maksimal hanya ${maxLimit} foto untuk sesi ini.`);
        return;
      }
      s.add(id);
    }
    setSelected(s);
  };

  const sendWA = () => {
    if (selected.size === 0) return;
    const names = images.filter(i => selected.has(i.id)).map(i => i.name).join('\n');
    const msg = encodeURIComponent(`Halo, saya *${config.clientName}*.\nIni foto pilihan saya (${selected.size} foto):\n\n${names}`);
    window.open(`https://wa.me/62${config.photographerWa.replace(/^0+/, '')}?text=${msg}`, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
      <GlobalStyles />
      <span className="font-serif text-3xl italic animate-pulse">Aksara Picture</span>
      <p className="text-white/30 text-xs mt-4 tracking-[0.3em] uppercase">Loading Gallery</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white selection:text-black pb-32">
      <GlobalStyles />
      <div className="grain-overlay" />

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center transition-all">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center font-serif italic font-bold">A</div>
          <div className="hidden md:block">
            <h1 className="font-serif text-lg tracking-wide">{config.clientName}</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">Selection Gallery</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            {/* Limit Counter */}
            <div className={`px-4 py-1.5 rounded-full border text-xs font-medium tracking-wide transition-all ${
                isLimitReached 
                ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                : 'bg-white/5 border-white/10 text-white/60'
            }`}>
                {selected.size} <span className="opacity-50 mx-1">/</span> {maxLimit > 0 ? maxLimit : '∞'} Selected
            </div>

            {onCloseSimulation && (
                <button onClick={onCloseSimulation} className="bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors text-white/60 hover:text-white">
                    <X size={18} />
                </button>
            )}
        </div>
      </nav>

      {/* Grid */}
      <main className="pt-28 px-4 md:px-8 max-w-[2000px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {images.map((img) => {
            const isSel = selected.has(img.id);
            // Item mati jika limit penuh dan dia tidak dipilih
            const isDisabled = isLimitReached && !isSel;

            return (
              <div key={img.id} 
                className={`relative group aspect-[2/3] rounded-lg overflow-hidden transition-all duration-500 
                    ${isSel ? 'ring-2 ring-white ring-offset-2 ring-offset-black cursor-pointer' : ''}
                    ${isDisabled ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}
                `}
                onClick={() => !isDisabled && toggle(img.id)}
              >
                <img 
                  src={img.thumbnailLink} 
                  className={`w-full h-full object-cover transition-transform duration-700 ${isSel ? 'scale-105 opacity-60' : 'group-hover:scale-110'}`} 
                  loading="lazy"
                />
                
                {/* Overlay Gradient (Hanya jika aktif) */}
                {!isDisabled && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
                
                {/* Selection Indicator (Tetap muncul jika selected) */}
                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border border-white/30 flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${isSel ? 'bg-white text-black border-white scale-110' : 'bg-black/20 text-transparent'}`}>
                  <Check size={12} strokeWidth={4} />
                </div>

                {/* Quick View Button (Hanya jika aktif) */}
                {!isDisabled && (
                    <button 
                    onClick={(e) => { e.stopPropagation(); setViewImg(img); }}
                    className="absolute bottom-3 right-3 bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                    >
                    <ZoomIn size={14} />
                    </button>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Action Bar (Responsive) */}
      <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto bg-[#1a1a1a]/90 backdrop-blur-2xl border border-white/10 pl-6 pr-2 py-2 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-4 transform transition-all hover:scale-[1.02]">
           <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-widest">
                  {isLimitReached ? 'Limit Reached' : 'Progress'}
              </span>
              <span className={`font-serif text-xl leading-none ${isLimitReached ? 'text-emerald-400' : 'text-white'}`}>
                  {selected.size} <span className="text-sm font-sans text-white/30 font-light">/ {maxLimit > 0 ? maxLimit : '∞'}</span>
              </span>
           </div>
           
           <button 
             onClick={sendWA}
             disabled={selected.size === 0}
             className={`h-12 px-6 rounded-full flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-all
               ${selected.size > 0 ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/10 text-white/20 cursor-not-allowed'}
             `}
           >
             Confirm
             <ArrowRight size={14} />
           </button>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {viewImg && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-enter" onClick={() => setViewImg(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><X size={32}/></button>
          <img src={viewImg.previewLink} className="max-h-[90vh] max-w-full rounded shadow-2xl" onClick={e => e.stopPropagation()}/>
        </div>
      )}
    </div>
  );
};

// 4. MAIN APP ROUTER
export default function App() {
  const [session, setSession] = useState('login'); 
  const [user, setUser] = useState(null); 
  const [clientConfig, setClientConfig] = useState(null); 

  const handleLogin = (u) => { setUser(u); setSession('admin'); };
  const handleLogout = () => { if(confirm("Sign out?")) { setSession('login'); setUser(null); setClientConfig(null); }};

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {clientConfig ? (
          <ClientGallery config={clientConfig} onCloseSimulation={() => setClientConfig(null)} />
      ) : session === 'login' ? (
          <LoginPanel onLogin={handleLogin} />
      ) : (
          <AdminPanel user={user} onPreviewClient={setClientConfig} onLogout={handleLogout} />
      )}
    </GoogleOAuthProvider>
  );
}