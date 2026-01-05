import React, { useState, useEffect } from 'react';
import { 
  Check, X, LogOut, Copy, ExternalLink,
  Loader2, Sparkles, ChevronLeft, ChevronRight, Aperture,
  User, Folder, Hash, Phone, Link as LinkIcon 
} from 'lucide-react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

/* ==================================================================================
   KONFIGURASI GLOBAL
   ================================================================================== */
const GOOGLE_CLIENT_ID = "963212157034-pqg657cicgnmtikm59v04rdi46fo1cqc.apps.googleusercontent.com"; 

const BG_IMAGES = [
  "https://raw.githubusercontent.com/NandaAddi/aksara-selector/refs/heads/main/4.jpg", // Wedding/Love
  "https://raw.githubusercontent.com/NandaAddi/aksara-selector/refs/heads/main/5.jpg", // Moody Black White
  "https://raw.githubusercontent.com/NandaAddi/aksara-selector/refs/heads/main/6.jpg", // Nature/Light
];

/* ==================================================================================
   STYLES & ANIMATIONS (UPDATED FOR BEAUTY)
   ================================================================================== */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Manrope:wght@300;400;500;600;800&display=swap');
    
    :root {
      --glass-border: rgba(255, 255, 255, 0.08);
      --glass-bg: rgba(18, 18, 23, 0.65);
      --glass-shine: rgba(255, 255, 255, 0.03);
    }

    body {
      background-color: #0a0a0c;
      color: #e5e5e5;
    }

    .font-serif { font-family: 'Cormorant Garamond', serif; }
    .font-sans { font-family: 'Manrope', sans-serif; }
    
    /* Enhanced Glassmorphism */
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid var(--glass-border);
      box-shadow: 
        0 20px 40px -10px rgba(0, 0, 0, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    }

    .glass-card:hover {
      border-color: rgba(255,255,255,0.15);
      box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.7);
    }

    .animate-fade-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    
    body.lightbox-open { overflow: hidden !important; touch-action: none; position: fixed; width: 100%; }
    
    /* Input Fields beautification */
    .input-field { 
      width: 100%; 
      background: rgba(0, 0, 0, 0.2); 
      border: 1px solid rgba(255,255,255,0.08); 
      border-radius: 0.75rem; 
      padding: 0.9rem 1rem; 
      color: white; 
      outline: none; 
      transition: all 0.3s ease; 
      font-size: 0.95rem;
    }
    .input-field:focus { 
      border-color: rgba(255,255,255,0.5); 
      background: rgba(0,0,0,0.4); 
      box-shadow: 0 0 0 4px rgba(255,255,255,0.05);
    }
    .input-field::placeholder { color: rgba(255,255,255,0.25); }
    
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

    /* Custom Selection Color */
    ::selection {
      background: rgba(250, 204, 21, 0.3);
      color: #fff;
    }
  `}</style>
);

/* ==================================================================================
   COMPONENTS
   ================================================================================== */
const BackgroundSlideshow = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIndex((prev) => (prev + 1) % BG_IMAGES.length), 6000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="fixed inset-0 bg-[#0a0a0c] -z-10 overflow-hidden">
      {BG_IMAGES.map((img, i) => (
        <div key={i} className={`absolute inset-0 transition-all duration-[2500ms] ease-in-out ${i === index ? 'opacity-50 scale-105' : 'opacity-0 scale-100'}`}>
          <img src={img} alt="bg" className="w-full h-full object-cover" />
        </div>
      ))}
      {/* Softened Gradient Overlay (Not Pitch Black) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 to-[#0a0a0c]/30 mix-blend-multiply" />
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
    </div>
  );
};

const Preloader = () => (
  <div className="fixed inset-0 z-[9999] bg-[#0a0a0c] flex items-center justify-center">
    <div className="flex flex-col items-center">
       <div className="w-24 h-24 border border-white/5 rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 border-t border-r border-white/80 rounded-full animate-spin"></div>
          <span className="font-serif text-4xl text-white italic animate-pulse">A</span>
       </div>
       <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] font-sans animate-fade-up">Loading Experience</p>
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
        {/* Glow Effect behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-transparent rounded-[2.2rem] blur-xl opacity-50 pointer-events-none"></div>
        
        <div className="glass-card rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(255,255,255,0.15)] ring-4 ring-white/10 transition-transform hover:scale-110 duration-500">
                <span className="font-serif text-3xl italic">A</span>
            </div>
            <h1 className="font-serif text-3xl text-white mb-2 tracking-wide">Aksara Picture</h1>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-medium">{isRegister ? 'Begin Journey' : 'Member Access'}</p>
          </div>
          
          <form onSubmit={handleManualSubmit} className="space-y-4 mb-8">
            {isRegister && <input name="name" type="text" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="input-field" />}
            <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="input-field" />
            <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input-field" />
            
            <button type="submit" disabled={isLoading} className="w-full bg-white hover:bg-[#e0e0e0] text-black py-3.5 rounded-xl font-bold text-xs uppercase tracking-[0.15em] mt-4 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-[0.98] transition-all duration-300">
                {isLoading ? <Loader2 className="animate-spin mx-auto text-black" size={18}/> : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center"><span className="px-4 text-[10px] uppercase text-white/20 bg-[#15151a] backdrop-blur-md rounded-full tracking-wider">Or continue with</span></div>
          </div>

          <button onClick={() => googleLogin()} disabled={isLoading} className="w-full group bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wide mb-6 transition-all duration-300 flex items-center justify-center gap-2 hover:border-white/20">
             <span>Google Access</span>
          </button>

          <p className="text-white/30 text-xs text-center cursor-pointer hover:text-white transition-colors duration-300" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? <span>Already a member? <span className="underline decoration-white/30 underline-offset-4">Log In</span></span> : <span>New here? <span className="underline decoration-white/30 underline-offset-4">Register</span></span>}
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
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = () => {
    if (!folderUrl || !clientName) return alert("Mohon isi Nama Client & Link Google Drive.");
    const baseUrl = window.location.origin + '/select';
    const params = new URLSearchParams({ client: clientName, folder: folderUrl, wa: photographerWa, limit: limit });
    setGeneratedLink(`${baseUrl}?${params.toString()}`);
    setIsCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans animate-fade-up flex items-center justify-center pb-24">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* --- HEADER: PROFILE --- */}
        <header className="glass-card p-5 rounded-2xl flex justify-between items-center group hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-500">
                {user.picture ? (
                  <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="bg-gradient-to-br from-gray-800 to-black text-white h-full flex items-center justify-center font-bold text-lg">
                    {user.given_name?.charAt(0)}
                  </div>
                )}
             </div>
             <div>
               <p className="text-white/30 text-[9px] uppercase tracking-[0.2em] font-bold mb-1">Dashboard Access</p>
               <h2 className="text-2xl font-serif text-white tracking-wide">{user.given_name}</h2>
             </div>
          </div>
          <button 
            onClick={onLogout} 
            className="group/logout flex items-center gap-2 px-5 py-2.5 bg-red-500/5 hover:bg-red-500/10 text-red-400/70 hover:text-red-400 rounded-xl transition-all active:scale-95 border border-red-500/10 hover:border-red-500/30"
          >
            <span className="text-[10px] font-bold tracking-widest hidden sm:block">LOGOUT</span>
            <LogOut size={16} className="group-hover/logout:-translate-x-1 transition-transform" />
          </button>
        </header>

        {/* --- MAIN FORM --- */}
        <div className="glass-card p-8 md:p-10 rounded-[2rem] relative overflow-hidden ring-1 ring-white/5">
            {/* Decoration */}
            <div className="absolute -top-10 -right-10 p-10 opacity-[0.03] pointer-events-none rotate-12">
              <Aperture size={200} className="text-white" />
            </div>

            <div className="mb-10 relative">
              <h3 className="font-serif text-3xl text-white mb-2">Session Configuration</h3>
              <p className="text-white/40 text-xs tracking-wide font-light">Create a bespoke selection gallery for your client.</p>
              <div className="w-12 h-0.5 bg-yellow-400/50 mt-4 rounded-full"></div>
            </div>

            <div className="space-y-6 relative z-10">
                {/* Client Info Group */}
                <div className="space-y-5">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50"></span> Primary Info
                    </label>
                    
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors duration-300" size={18} />
                        <input 
                          type="text" 
                          value={clientName} 
                          onChange={(e) => setClientName(e.target.value)} 
                          placeholder="Client Name (e.g. Sarah & James)" 
                          className="input-field !pl-12 py-4 bg-black/20 focus:bg-black/40" 
                        />
                    </div>

                    <div className="relative group">
                        <Folder className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-yellow-400 transition-colors duration-300" size={18} />
                        <input 
                          type="text" 
                          value={folderUrl} 
                          onChange={(e) => setFolderUrl(e.target.value)} 
                          placeholder="Google Drive Folder URL (Shared)" 
                          className="input-field !pl-12 py-4 bg-black/20 focus:bg-black/40" 
                        />
                    </div>
                </div>

                {/* Settings Group */}
                <div className="space-y-5 pt-4">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/50"></span> Constraints
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="relative group">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors duration-300" size={18} />
                            <input 
                              type="number" 
                              value={limit} 
                              onChange={(e) => setLimit(e.target.value)} 
                              placeholder="Photo Limit" 
                              className="input-field !pl-12 py-4 bg-black/20 focus:bg-black/40" 
                            />
                        </div>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-green-400 transition-colors duration-300" size={18} />
                            <input 
                              type="text" 
                              value={photographerWa} 
                              onChange={(e) => setPhotographerWa(e.target.value)} 
                              placeholder="WhatsApp (628...)" 
                              className="input-field !pl-12 py-4 bg-black/20 focus:bg-black/40" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            <button 
              onClick={handleGenerate} 
              className="group w-full bg-white hover:bg-gray-100 text-black font-bold uppercase tracking-[0.25em] text-xs py-5 rounded-xl mt-10 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)]"
            >
              <Sparkles size={16} className="text-yellow-600 group-hover:rotate-12 transition-transform" /> Generate Access Link
            </button>
        </div>

        {/* --- RESULT SECTION --- */}
        {generatedLink && (
            <div className="glass-card p-1 rounded-2xl animate-fade-up border border-yellow-400/20 shadow-[0_10px_40px_rgba(253,224,71,0.05)]">
                <div className="bg-[#0f0f12] p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-5 text-yellow-400/90">
                        <div className="p-2 bg-yellow-400/10 rounded-lg"><LinkIcon size={16} /></div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Session Link Ready</span>
                    </div>

                    {/* Copy Box */}
                    <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-xl p-3 mb-6 group hover:border-white/10 transition-colors">
                        <div className="flex-1 overflow-x-auto scrollbar-hide px-2">
                           <p className="text-white/60 text-xs font-mono whitespace-nowrap group-hover:text-white/80 transition-colors">{generatedLink}</p>
                        </div>
                        <button 
                          onClick={copyToClipboard} 
                          className={`p-3 rounded-lg transition-all duration-300 shadow-lg ${isCopied ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/70 hover:bg-white/15 hover:text-white'}`}
                        >
                           {isCopied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => window.open(generatedLink, '_blank')} 
                          className="flex items-center justify-center gap-2 p-4 rounded-xl border border-white/10 hover:bg-white/5 text-white/60 hover:text-white transition-all text-[10px] uppercase font-bold tracking-[0.15em]"
                        >
                           <ExternalLink size={14} /> Open
                        </button>
                        <button 
                          onClick={() => onPreviewClient({ clientName, folderLink: folderUrl, photographerWa, limit })} 
                          className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-all text-[10px] uppercase font-bold tracking-[0.15em] border border-white/5 hover:border-white/20"
                        >
                           Preview <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

/* ==================================================================================
   3. CLIENT GALLERY (BEAUTIFIED)
   ================================================================================== */
const ClientGallery = ({ config, onCloseSimulation }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  
  // 1. HARD LOCK SCROLL BODY
  useEffect(() => {
    if (lightboxIndex !== null) document.body.classList.add('lightbox-open');
    else document.body.classList.remove('lightbox-open');
    return () => document.body.classList.remove('lightbox-open');
  }, [lightboxIndex]);

  // 2. KEYBOARD NAV
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

  // 3. FETCH
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const res = await axios.post('/api/photos', { folderUrl: config.folderLink });
        const optimizedPhotos = res.data.map(p => {
            const baseUrl = p.thumbnailLink || '';
            return {
                ...p,
                gridUrl: baseUrl.replace(/=s\d+/, '=s400-c'), 
                fullUrl: baseUrl.replace(/=s\d+/, '=s1600') 
            };
        });
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

  const nextImage = (e) => { if(e) e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % photos.length); };
  const prevImage = (e) => { if(e) e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length); };
  
  return (
    <div className="min-h-screen text-white pb-24 bg-[#0a0a0c]">
      {/* Navbar Grid */}
      <nav className="fixed top-0 w-full z-40 glass-card h-20 flex items-center justify-between px-6 md:px-10 border-b border-white/5 transition-all">
          <div className="flex flex-col">
              <h1 className="font-serif text-2xl leading-none tracking-wide text-white">{config.clientName}</h1>
              <p className="text-[9px] text-white/40 uppercase tracking-[0.3em] mt-1 font-medium">Gallery Selection</p>
          </div>
          <div className="flex items-center gap-4">
              <div className="bg-white/5 px-4 py-1.5 rounded-full text-xs font-mono text-yellow-400 border border-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                {selected.length} <span className="text-white/30 mx-1">/</span> {config.limit || '∞'}
              </div>
              <button onClick={sendToWa} className="bg-white hover:bg-gray-200 text-black px-6 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                Finalize
              </button>
              {onCloseSimulation && <button onClick={onCloseSimulation} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/10"><X size={18}/></button>}
          </div>
      </nav>

      {/* Grid Content */}
      <main className="pt-28 px-4 md:px-10 max-w-[1600px] mx-auto animate-fade-up">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="animate-spin mb-4 text-white/30" size={32} />
                <p className="text-white/30 text-[10px] animate-pulse uppercase tracking-[0.3em]">Curating Images...</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                {photos.map((photo, index) => {
                    const isSelected = selected.find(p => p.id === photo.id);
                    return (
                        <div key={photo.id} onClick={() => setLightboxIndex(index)} 
                             className={`relative aspect-[3/4] group cursor-pointer bg-white/5 rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${isSelected ? 'ring-2 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)]' : ''}`}>
                            <img src={photo.gridUrl} alt="Thumb" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            <button onClick={(e) => toggleSelect(photo, e)} className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 active:scale-90 z-10 ${isSelected ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-110' : 'bg-black/40 text-white/50 backdrop-blur-md hover:bg-white hover:text-black border border-white/10'}`}>
                                {isSelected ? <Check size={14} strokeWidth={4} /> : <div className="w-3.5 h-3.5 border border-current rounded-full" />}
                            </button>
                            
                            {/* Hover Info */}
                            <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                                <p className="text-[10px] text-white/80 font-mono truncate">{photo.name}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </main>

      {/* --- LIGHTBOX (ABSOLUTE POSITIONING SYSTEM) --- */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div 
          className="fixed inset-0 z-[9999] bg-[#050505] w-full h-[100dvh] animate-in fade-in duration-300" 
          onClick={() => setLightboxIndex(null)}
        >
            
            {/* 1. HEADER (Top Fixed) */}
            <div className="absolute top-0 left-0 w-full h-20 flex items-center justify-between px-6 bg-gradient-to-b from-black/80 to-transparent z-[10010] pointer-events-none">
                <span className="text-white/60 text-xs font-mono tracking-wider backdrop-blur-md px-3 py-1 rounded-full bg-white/5 border border-white/5 pointer-events-auto">{photos[lightboxIndex].name}</span>
                <button onClick={() => setLightboxIndex(null)} className="pointer-events-auto p-3 bg-white/5 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors border border-white/5 group"><X size={20} className="group-hover:scale-90 transition-transform"/></button>
            </div>

            {/* 2. IMAGE CONTAINER (Absolute Center) */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none p-4">
                <img 
                    src={photos[lightboxIndex].fullUrl} 
                    className="object-contain pointer-events-auto shadow-[0_0_100px_rgba(0,0,0,0.8)] drop-shadow-2xl transition-transform duration-300" 
                    alt="Full View"
                    style={{ 
                        maxHeight: 'calc(100dvh - 180px)', 
                        maxWidth: '100%',
                    }}
                    onClick={(e) => e.stopPropagation()} 
                />
            </div>

            {/* 3. NAVIGATION ARROWS (Absolute Center Vertical) */}
            <div className="absolute inset-0 flex items-center justify-between px-4 md:px-8 w-full h-full pointer-events-none z-[10005]">
                <button 
                    onClick={prevImage} 
                    className="pointer-events-auto p-4 bg-black/20 hover:bg-black/50 rounded-full text-white/50 hover:text-white backdrop-blur-sm transition-all border border-white/5 hover:border-white/20 hover:scale-110"
                >
                    <ChevronLeft size={32} strokeWidth={1.5} />
                </button>
                <button 
                    onClick={nextImage} 
                    className="pointer-events-auto p-4 bg-black/20 hover:bg-black/50 rounded-full text-white/50 hover:text-white backdrop-blur-sm transition-all border border-white/5 hover:border-white/20 hover:scale-110"
                >
                    <ChevronRight size={32} strokeWidth={1.5} />
                </button>
            </div>

            {/* 4. FOOTER ACTION (Bottom Fixed) */}
            <div 
                className="absolute bottom-0 left-0 w-full h-32 flex items-center justify-center bg-gradient-to-t from-black/90 via-black/60 to-transparent z-[10010] pointer-events-none"
                onClick={(e) => e.stopPropagation()} 
            >
                 <button onClick={(e) => toggleSelect(photos[lightboxIndex], e)}
                    className={`pointer-events-auto flex items-center gap-3 px-12 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 ${selected.find(p => p.id === photos[lightboxIndex].id) ? 'bg-yellow-400 text-black shadow-[0_0_30px_rgba(250,204,21,0.3)]' : 'bg-white/10 text-white border border-white/20 backdrop-blur-xl hover:bg-white hover:text-black'}`}>
                    {selected.find(p => p.id === photos[lightboxIndex].id) ? <><Check size={16} strokeWidth={4} /> Selected</> : 'Select Photo'}
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

  useEffect(() => { const t = setTimeout(() => setInitialLoad(false), 2500); return () => clearTimeout(t); }, []);

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
