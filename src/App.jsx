import React, { useState, useEffect } from 'react';
import { Check, ExternalLink, X, Eye, ArrowRight, LogOut, Copy, Link as LinkIcon, ZoomIn, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

/* ==================================================================================
   KONFIGURASI GLOBAL
   ================================================================================== */
const GOOGLE_CLIENT_ID = "963212157034-pqg657cicgnmtikm59v04rdi46fo1cqc.apps.googleusercontent.com"; // <-- Pastikan ini diisi
const API_URL = '/api/photos'; // Menggunakan path relatif untuk Vercel

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

const CinematicBackground = () => {
  const images = [
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1920',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1920',
    'https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&q=80&w=1920',
  ];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % images.length), 8000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="fixed inset-0 z-0 bg-black">
      {images.map((img, i) => (
        <div key={i} className="absolute inset-0 bg-cover bg-center transition-all duration-[2000ms]"
          style={{ backgroundImage: `url(${img})`, opacity: i === index ? 0.6 : 0, transform: i === index ? 'scale(1.1)' : 'scale(1)' }} 
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
      <div className="grain-overlay" />
    </div>
  );
};

/* --- COMPONENTS --- */
const Button = ({ children, onClick, variant = 'primary', className = '', disabled, icon: Icon }) => {
  const base = "relative overflow-hidden transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-sans font-bold tracking-wider text-xs uppercase py-4 px-8 rounded-full flex items-center justify-center gap-2 group";
  const styles = {
    primary: "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]",
    secondary: "bg-transparent text-white border border-white/20 hover:bg-white/10",
  };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>{children} {Icon && <Icon size={16} />}</button>;
};

const InputField = ({ label, type, placeholder, value, onChange, prefix }) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-4 group-focus-within:text-white transition-colors">{label}</label>
    <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 transition-all focus-within:bg-white/10 focus-within:border-white/30">
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={`w-full bg-transparent text-white px-6 py-4 outline-none font-sans text-sm ${prefix ? 'pl-14' : ''}`} />
      {prefix && <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-white/10 bg-white/5"><span className="text-white/40 text-xs font-bold">{prefix}</span></div>}
    </div>
  </div>
);

/* ==================================================================================
   1. LOGIN PANEL
   ================================================================================== */
const LoginPanel = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const login = useGoogleLogin({
    onSuccess: async (res) => {
      setIsLoading(true);
      try {
        const user = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${res.access_token}` }});
        onLogin(user.data);
      } catch (e) { setIsLoading(false); alert('Login Gagal'); }
    },
    onError: () => setIsLoading(false)
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-sans relative">
      <GlobalStyles /> <CinematicBackground />
      <div className="w-full max-w-md relative z-10 animate-enter text-center">
        <div className="glass-card rounded-[32px] p-12 relative overflow-hidden">
          <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-6"><span className="font-serif text-4xl italic">A</span></div>
          <h1 className="font-serif text-4xl text-white mb-2">Aksara Studio</h1>
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-10">Internal Workspace</p>
          <button onClick={() => login()} disabled={isLoading} className="w-full bg-white hover:bg-gray-200 text-black py-4 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-3 transition-all">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Enter Workspace'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==================================================================================
   2. ADMIN PANEL (DIPERBAIKI: GENERATE LINK LENGKAP)
   ================================================================================== */
const AdminPanel = ({ user, onPreviewClient, onLogout }) => {
  const [formData, setFormData] = useState({ clientName: '', folderLink: '', photographerWa: '', limit: 0 });
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.folderLink) return alert("Mohon lengkapi data!");

    // ENCODE SEMUA DATA AGAR BISA DIBACA DI URL CLIENT
    const params = new URLSearchParams();
    params.set('client', formData.clientName);
    params.set('folder', formData.folderLink); // <-- PENTING: Link Drive dikirim
    params.set('wa', formData.photographerWa);
    if(formData.limit > 0) params.set('limit', formData.limit);

    // Dapatkan URL dasar website saat ini (localhost atau vercel)
    const baseUrl = window.location.origin;
    const finalUrl = `${baseUrl}/select?${params.toString()}`;

    setResult({ ...formData, url: finalUrl });
  };

  const copy = () => { navigator.clipboard.writeText(result.url); alert('Link Copied!'); };

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative font-sans">
        <GlobalStyles /> <CinematicBackground />
        <div className="glass-card max-w-md w-full rounded-[30px] p-8 z-10 text-center animate-enter">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={28} /></div>
          <h2 className="font-serif text-2xl text-white mb-2">Link Created</h2>
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 mb-6 flex items-center gap-3">
            <code className="text-xs text-white/70 truncate flex-1">{result.url}</code>
            <button onClick={copy} className="text-white/40 hover:text-white"><Copy size={16}/></button>
          </div>
          <div className="space-y-3">
            <Button variant="primary" onClick={() => onPreviewClient(result)} className="w-full">Open Live Preview</Button>
            <Button variant="secondary" onClick={() => setResult(null)} className="w-full">Create Another</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative">
      <GlobalStyles /> <CinematicBackground />
      <div className="max-w-xl w-full relative z-10 animate-enter">
        <div className="glass-card rounded-[32px] overflow-hidden">
          <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-4"><div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-serif font-bold italic">A</div><div><h1 className="text-white font-serif text-lg">New Session</h1><p className="text-[10px] text-white/40 uppercase tracking-widest">{user.given_name}</p></div></div>
            <button onClick={onLogout} className="text-white/30 hover:text-red-400 p-2"><LogOut size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <InputField label="Client Name" type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} placeholder="e.g. Romeo & Juliet" />
            <InputField label="Google Drive Link" type="url" value={formData.folderLink} onChange={e => setFormData({...formData, folderLink: e.target.value})} placeholder="https://drive.google.com/..." />
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Max Photos" type="number" value={formData.limit} onChange={e => setFormData({...formData, limit: parseInt(e.target.value) || 0})} placeholder="0 (Unlimited)" />
                <InputField label="WhatsApp" prefix="+62" type="tel" value={formData.photographerWa} onChange={e => setFormData({...formData, photographerWa: e.target.value})} placeholder="812..." />
            </div>
            <div className="pt-4"><Button variant="primary" className="w-full py-5" icon={Sparkles}>Generate Access Link</Button></div>
          </form>
        </div>
      </div>
    </div>
  );
};

// 3. CLIENT GALLERY (VERSI ANTI-CRASH & DEBUGGING)
const ClientGallery = ({ config, onCloseSimulation }) => {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null); // Tambah state error
  const [viewImg, setViewImg] = useState(null);

  const maxLimit = parseInt(config.limit) || 0;
  const isLimitReached = maxLimit > 0 && selected.size >= maxLimit;

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        
        console.log("🔍 Fetching URL:", `${API_URL}?folderLink=${encodeURIComponent(config.folderLink)}`);
        
        const response = await axios.get(`${API_URL}?folderLink=${encodeURIComponent(config.folderLink)}`);
        
        console.log("✅ Data diterima dari server:", response.data);

        // --- PENGAMAN UTAMA (ANTI-BLANK) ---
        // Kita cek apakah data yang datang benar-benar Array?
        if (Array.isArray(response.data)) {
            setImages(response.data);
        } else {
            // Jika bukan array (misal HTML atau Objek Error), kita lempar error
            console.error("Format Data Salah:", response.data);
            throw new Error("Server tidak mengembalikan daftar foto yang valid (Cek Console).");
        }

      } catch (err) {
        console.error("❌ ERROR FETCH:", err);
        // Tampilkan pesan error yang lebih manusiawi
        let msg = "Gagal memuat foto.";
        if (err.response) {
            // Error dari Backend (400/500)
            msg = `Server Error (${err.response.status}): ${err.response.data?.error || err.message}`;
        } else if (err.request) {
            // Tidak ada respon
            msg = "Tidak dapat menghubungi server. Cek koneksi internet.";
        } else {
            msg = err.message;
        }
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    };

    if (config?.folderLink) fetchImages();
  }, [config]);

  const toggle = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else {
      if (maxLimit > 0 && s.size >= maxLimit) return alert(`Maksimal ${maxLimit} foto.`);
      s.add(id);
    }
    setSelected(s);
  };

  const sendWA = () => {
    if (selected.size === 0) return;
    const names = images.filter(i => selected.has(i.id)).map(i => i.name).join('\n');
    const msg = encodeURIComponent(`Halo, saya *${config.clientName}*.\nIni foto pilihan saya (${selected.size} foto):\n\n${names}`);
    window.open(`https://wa.me/62${config.photographerWa?.replace(/^0+/, '') || ''}?text=${msg}`, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
      <GlobalStyles /><span className="font-serif text-3xl italic animate-pulse">Aksara Studio</span><p className="text-white/30 text-xs mt-4 tracking-[0.3em]">Loading Gallery...</p>
    </div>
  );

  // TAMPILAN JIKA ERROR (Tidak Blank Putih Lagi)
  if (errorMsg) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white p-8 text-center">
      <GlobalStyles />
      <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4"><X size={32}/></div>
      <h2 className="font-serif text-2xl mb-2">Terjadi Kesalahan</h2>
      <p className="text-white/50 mb-6 max-w-md font-mono text-xs bg-black/50 p-4 rounded border border-white/10">{errorMsg}</p>
      <button onClick={() => window.location.reload()} className="bg-white text-black px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wide hover:bg-gray-200">Coba Lagi</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white selection:text-black pb-32">
      <GlobalStyles /> <div className="grain-overlay" />
      <nav className="fixed top-0 inset-x-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4"><div className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center font-serif italic font-bold">A</div><div className="hidden md:block"><h1 className="font-serif text-lg">{config.clientName}</h1></div></div>
        <div className="flex items-center gap-4"><div className={`px-4 py-1.5 rounded-full border text-xs font-medium ${isLimitReached ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-white/5 border-white/10 text-white/60'}`}>{selected.size} / {maxLimit > 0 ? maxLimit : '∞'} Selected</div>{onCloseSimulation && <button onClick={onCloseSimulation} className="bg-white/5 hover:bg-white/10 p-2 rounded-full text-white/60 hover:text-white"><X size={18} /></button>}</div>
      </nav>
      <main className="pt-28 px-4 md:px-8 max-w-[2000px] mx-auto">
        {(!images || images.length === 0) ? <p className="text-center text-white/30 mt-20">Tidak ada foto ditemukan di folder ini.</p> :
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((img) => {
            const isSel = selected.has(img.id);
            const isDisabled = isLimitReached && !isSel;
            return (
              <div key={img.id} className={`relative group aspect-[2/3] rounded-lg overflow-hidden transition-all duration-500 ${isSel ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''} ${isDisabled ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`} onClick={() => !isDisabled && toggle(img.id)}>
                <img src={img.thumbnailLink} className={`w-full h-full object-cover transition-transform duration-700 ${isSel ? 'scale-105 opacity-60' : 'group-hover:scale-110'}`} loading="lazy" />
                {!isDisabled && <><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" /><button onClick={(e) => {e.stopPropagation(); setViewImg(img);}} className="absolute bottom-3 right-3 bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all"><ZoomIn size={14} /></button></>}
                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border border-white/30 flex items-center justify-center transition-all backdrop-blur-sm ${isSel ? 'bg-white text-black border-white scale-110' : 'bg-black/20 text-transparent'}`}><Check size={12} strokeWidth={4} /></div>
              </div>
            );
          })}
        </div>}
      </main>
      <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto bg-[#1a1a1a]/90 backdrop-blur-2xl border border-white/10 pl-6 pr-2 py-2 rounded-full shadow-lg flex items-center gap-4 hover:scale-[1.02] transition-all">
           <div className="flex flex-col"><span className="text-[10px] text-white/40 uppercase tracking-widest">{isLimitReached ? 'Limit Reached' : 'Selected'}</span><span className={`font-serif text-xl leading-none ${isLimitReached ? 'text-emerald-400' : 'text-white'}`}>{selected.size}</span></div>
           <button onClick={sendWA} disabled={selected.size === 0} className={`h-12 px-6 rounded-full flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-all ${selected.size > 0 ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/10 text-white/20 cursor-not-allowed'}`}>Confirm <ArrowRight size={14} /></button>
        </div>
      </div>
      {viewImg && <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-enter" onClick={() => setViewImg(null)}><button className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={32}/></button><img src={viewImg.previewLink} className="max-h-[90vh] max-w-full rounded shadow-2xl" onClick={e => e.stopPropagation()}/></div>}
    </div>
  );
};

/* ==================================================================================
   4. MAIN APP ROUTER (LOGIKA BARU: AUTO-DETECT URL)
   ================================================================================== */
export default function App() {
  const [session, setSession] = useState('login'); 
  const [user, setUser] = useState(null); 
  const [clientConfig, setClientConfig] = useState(null); 

  // --- LOGIKA BARU: CEK URL SAAT PERTAMA KALI DIBUKA ---
  useEffect(() => {
    // Membaca URL saat ini
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // Jika URL mengandung '/select', berarti ini Client yang buka link
    if (path.includes('/select')) {
        const clientName = params.get('client');
        const folderLink = params.get('folder');
        const photographerWa = params.get('wa');
        const limit = params.get('limit');

        if (clientName && folderLink) {
            // Langsung masuk ke Mode Client tanpa login
            setClientConfig({ 
                clientName, 
                folderLink, 
                photographerWa: photographerWa || '', 
                limit: limit || 0 
            });
        }
    }
  }, []);

  const handleLogin = (u) => { setUser(u); setSession('admin'); };
  const handleLogout = () => { if(confirm("Sign out?")) { setSession('login'); setUser(null); setClientConfig(null); }};

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {clientConfig ? (
          // Jika ada konfigurasi Client (dari URL atau Preview), tampilkan Gallery
          <ClientGallery config={clientConfig} onCloseSimulation={session === 'admin' ? () => setClientConfig(null) : null} />
      ) : session === 'login' ? (
          // Jika tidak ada data Client, tampilkan Login Admin
          <LoginPanel onLogin={handleLogin} />
      ) : (
          // Jika sudah Login, tampilkan Admin Panel
          <AdminPanel user={user} onPreviewClient={setClientConfig} onLogout={handleLogout} />
      )}
    </GoogleOAuthProvider>
  );
}