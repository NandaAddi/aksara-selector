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
   STYLES & ANIMATIONS
   ================================================================================== */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Manrope:wght@300;400;600;800&display=swap');
    
    .font-serif { font-family: 'Cormorant Garamond', serif; }
    .font-sans { font-family: 'Manrope', sans-serif; }
    
    .glass-card {
      background: rgba(20, 20, 20, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
    }

    .animate-fade-up { animation: fadeInUp 0.6s ease-out forwards; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    
    /* UTILS PENTING: Mencegah scroll saat lightbox aktif */
    body.lightbox-open { overflow: hidden !important; touch-action: none; position: fixed; width: 100%; }
    
    .input-field { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.75rem; padding: 0.8rem 1rem; color: white; outline: none; transition: all; }
    .input-field:focus { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.1); }
    
    /* Hide scrollbar for copy box */
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

/* ==================================================================================
   COMPONENTS
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
          <img src={img} alt="bg" className="w-full h-full object-cover grayscale brightness-50 scale-105" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-[#050505]/40" />
    </div>
  );
};

// --- PRELOADER (Ganti logo sesuai kebutuhan) ---
const Preloader = () => (
  <div className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center">
    <div className="flex flex-col items-center animate-pulse">
       <div className="w-20 h-20 border border-white/10 rounded-full flex items-center justify-center mb-4 relative">
          <div className="absolute inset-0 border-t border-white rounded-full animate-spin"></div>
          {/* Ganti dengan <img src="..." /> jika ingin logo gambar */}
          <span className="font-serif text-3xl text-white italic">A</span>
       </div>
       <p className="text-white/50 text-[10px] uppercase tracking-[0.3em] font-sans">Loading Gallery...</p>
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
            <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(255,255,255,0.2)]"><span className="font-serif text-2xl italic">A</span></div>
            <h1 className="font-serif text-2xl text-white">Aksara Picture</h1>
            <p className="text-white/40 text-[9px] uppercase tracking-[0.2em]">{isRegister ? 'Create Account' : 'Welcome Back'}</p>
          </div>
          <form onSubmit={handleManualSubmit} className="space-y-3 mb-6">
            {isRegister && <input name="name" type="text" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="input-field" />}
            <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="input-field" />
            <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input-field" />
            <button type="submit" disabled={isLoading} className="w-full bg-white hover:bg-gray-200 text-black py-3 rounded-xl font-bold text-xs uppercase tracking-wider mt-2 shadow-lg active:scale-95 transition-transform">{isLoading ? <Loader2 className="animate-spin mx-auto" size={16}/> : (isRegister ? 'Sign Up' : 'Sign In')}</button>
          </form>
          <div className="relative mb-5"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div><div className="relative flex justify-center"><span className="px-3 text-[9px] uppercase text-white/30 bg-black/20 backdrop-blur-md rounded">Or</span></div></div>
          <button onClick={() => googleLogin()} disabled={isLoading} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wide mb-4 transition-colors">Google Access</button>
          <p className="text-white/40 text-xs text-center cursor-pointer hover:text-white transition-colors" onClick={() => setIsRegister(!isRegister)}>{isRegister ? "Have an account? Log In" : "New here? Register"}</p>
        </div>
      </div>
    </div>
  );
};

/* ==================================================================================
   2. ADMIN PANEL (FIXED PADDING COLLISION)
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
    <div className="min-h-screen p-4 font-sans animate-fade-up flex items-center justify-center pb-20">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* --- HEADER: PROFILE --- */}
        <header className="glass-card p-5 rounded-2xl flex justify-between items-center border border-white/10 bg-white/5">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                {user.picture ? (
                  <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="bg-gradient-to-br from-gray-700 to-black text-white h-full flex items-center justify-center font-bold text-lg">
                    {user.given_name?.charAt(0)}
                  </div>
                )}
             </div>
             <div>
               <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-0.5">Logged in as</p>
               <h2 className="text-xl font-serif text-white">{user.given_name}</h2>
             </div>
          </div>
          <button 
            onClick={onLogout} 
            className="group flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all active:scale-95 border border-red-500/20"
          >
            <span className="text-xs font-bold hidden sm:block">LOGOUT</span>
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </header>

        {/* --- MAIN FORM --- */}
        <div className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
              <Aperture size={120} className="text-white" />
            </div>

            <div className="mb-8">
              <h3 className="font-serif text-2xl text-white mb-1">Create Session</h3>
              <p className="text-white/40 text-xs">Isi detail sesi foto untuk klien Anda.</p>
            </div>

            <div className="space-y-5">
                {/* Client Info Group */}
                <div className="space-y-4">
                    <label className="block text-xs font-bold text-white/60 uppercase tracking-wider ml-1">Informasi Utama</label>
                    
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors" size={18} />
                        {/* Added !pl-12 to force padding over global style */}
                        <input 
                          type="text" 
                          value={clientName} 
                          onChange={(e) => setClientName(e.target.value)} 
                          placeholder="Nama Klien (Cth: Joming)" 
                          className="input-field !pl-12 py-3.5 bg-black/20 focus:bg-black/40 border-white/10" 
                        />
                    </div>

                    <div className="relative group">
                        <Folder className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-yellow-400 transition-colors" size={18} />
                        {/* Added !pl-12 */}
                        <input 
                          type="text" 
                          value={folderUrl} 
                          onChange={(e) => setFolderUrl(e.target.value)} 
                          placeholder="Link Google Drive (shared)" 
                          className="input-field !pl-12 py-3.5 bg-black/20 focus:bg-black/40 border-white/10" 
                        />
                    </div>
                </div>

                {/* Settings Group */}
                <div className="space-y-4 pt-2">
                    <label className="block text-xs font-bold text-white/60 uppercase tracking-wider ml-1">Pengaturan Batasan</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors" size={18} />
                            {/* Added !pl-12 */}
                            <input 
                              type="number" 
                              value={limit} 
                              onChange={(e) => setLimit(e.target.value)} 
                              placeholder="Max Foto (Default: 10)" 
                              className="input-field !pl-12 bg-black/20 focus:bg-black/40 border-white/10" 
                            />
                        </div>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-green-400 transition-colors" size={18} />
                            {/* Added !pl-12 */}
                            <input 
                              type="text" 
                              value={photographerWa} 
                              onChange={(e) => setPhotographerWa(e.target.value)} 
                              placeholder="WhatsApp (62812...)" 
                              className="input-field !pl-12 bg-black/20 focus:bg-black/40 border-white/10" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            <button 
              onClick={handleGenerate} 
              className="w-full bg-white text-black font-bold uppercase tracking-[0.2em] py-4 rounded-xl mt-8 hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              <Sparkles size={18} /> Generate Link
            </button>
        </div>

        {/* --- RESULT SECTION --- */}
        {generatedLink && (
            <div className="glass-card p-1 rounded-2xl animate-fade-up border border-yellow-400/30 shadow-[0_0_30px_rgba(253,224,71,0.1)]">
                <div className="bg-black/40 p-5 rounded-xl">
                    <div className="flex items-center gap-2 mb-4 text-yellow-400">
                        <LinkIcon size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Link Created Successfully</span>
                    </div>

                    {/* Copy Box */}
                    <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-lg p-2 mb-4">
                        <div className="flex-1 overflow-x-auto scrollbar-hide">
                           <p className="text-white/70 text-sm font-mono whitespace-nowrap px-2">{generatedLink}</p>
                        </div>
                        <button 
                          onClick={copyToClipboard} 
                          className={`p-2 rounded-md transition-all ${isCopied ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                           {isCopied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => window.open(generatedLink, '_blank')} 
                          className="flex items-center justify-center gap-2 p-3 rounded-lg border border-white/10 hover:bg-white/5 text-white/80 transition-colors text-xs uppercase font-bold tracking-wide"
                        >
                           <ExternalLink size={14} /> Open Link
                        </button>
                        <button 
                          onClick={() => onPreviewClient({ clientName, folderLink: folderUrl, photographerWa, limit })} 
                          className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-xs uppercase font-bold tracking-wide"
                        >
                           Preview Gallery <ChevronRight size={14} />
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
   3. CLIENT GALLERY (FINAL FIX: CALCULATED HEIGHT & ABSOLUTE CENTERING)
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
                gridUrl: baseUrl.replace(/=s\d+/, '=s300-c'), 
                fullUrl: baseUrl.replace(/=s\d+/, '=s1200') 
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
    <div className="min-h-screen text-white pb-20">
      {/* Navbar Grid */}
      <nav className="fixed top-0 w-full z-40 glass-card border-b border-white/5 h-16 flex items-center justify-between px-4">
          <div className="flex flex-col">
              <h1 className="font-serif text-lg leading-tight truncate max-w-[150px]">{config.clientName}</h1>
              <p className="text-[9px] text-white/50 uppercase tracking-widest">Selection</p>
          </div>
          <div className="flex items-center gap-3">
              <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-yellow-400 border border-white/10">{selected.length}/{config.limit || '∞'}</div>
              <button onClick={sendToWa} className="bg-white text-black px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 active:scale-95 transition-transform">Send</button>
              {onCloseSimulation && <button onClick={onCloseSimulation} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><X size={16}/></button>}
          </div>
      </nav>

      {/* Grid Content */}
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
                            <button onClick={(e) => toggleSelect(photo, e)} className={`absolute top-2 right-2 p-1.5 rounded-full transition-all active:scale-90 ${isSelected ? 'bg-yellow-400 text-black shadow-lg' : 'bg-black/30 text-white backdrop-blur-sm'}`}>
                                {isSelected ? <Check size={12} strokeWidth={4} /> : <div className="w-3 h-3 border border-white/80 rounded-full" />}
                            </button>
                        </div>
                    );
                })}
            </div>
        )}
      </main>

      {/* --- LIGHTBOX (ABSOLUTE POSITIONING SYSTEM) --- */}
      {/* Struktur ini tidak menggunakan Flexbox untuk layout utama, tapi Absolute Positioning */}
      {/* Ini menjamin posisi elemen TIDAK akan bergeser karena perhitungan browser HP yang salah */}
      
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div 
          className="fixed inset-0 z-[9999] bg-[#000000] w-full h-[100dvh]" // Background Hitam Pekat
          onClick={() => setLightboxIndex(null)}
        >
            
            {/* 1. HEADER (Top Fixed) */}
            <div className="absolute top-0 left-0 w-full h-16 flex items-center justify-between px-4 bg-gradient-to-b from-black/90 to-transparent z-[10010]">
                <span className="text-white/70 text-xs font-mono truncate max-w-[200px] drop-shadow-md">{photos[lightboxIndex].name}</span>
                <button onClick={() => setLightboxIndex(null)} className="p-2 bg-white/10 rounded-full text-white backdrop-blur-sm"><X size={20}/></button>
            </div>

            {/* 2. IMAGE CONTAINER (Absolute Center) */}
            {/* Kita gunakan inset-0 untuk memenuhi layar, tapi beri padding atas/bawah agar tidak ketabrak Header/Footer */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
                
                {/* GAMBAR UTAMA */}
                {/* Max height dihitung: 100vh - 150px (ruang header+footer). Ini menjamin gambar tidak pernah ketutup. */}
                <img 
                    src={photos[lightboxIndex].fullUrl} 
                    className="object-contain pointer-events-auto shadow-2xl" 
                    alt="Full View"
                    style={{ 
                        maxHeight: 'calc(100dvh - 160px)', // KUNCI UTAMA DISINI
                        maxWidth: '100%',
                    }}
                    onClick={(e) => e.stopPropagation()} 
                />
            </div>

            {/* 3. NAVIGATION ARROWS (Absolute Center Vertical) */}
            <div className="absolute inset-0 flex items-center justify-between px-2 w-full h-full pointer-events-none z-[10005]">
                <button 
                    onClick={prevImage} 
                    className="pointer-events-auto p-4 md:p-5 bg-black/30 hover:bg-black/60 rounded-full text-white/80 hover:text-white backdrop-blur-sm transition-all"
                >
                    <ChevronLeft size={32} />
                </button>
                <button 
                    onClick={nextImage} 
                    className="pointer-events-auto p-4 md:p-5 bg-black/30 hover:bg-black/60 rounded-full text-white/80 hover:text-white backdrop-blur-sm transition-all"
                >
                    <ChevronRight size={32} />
                </button>
            </div>

            {/* 4. FOOTER ACTION (Bottom Fixed) */}
            <div 
                className="absolute bottom-0 left-0 w-full h-24 flex items-center justify-center bg-gradient-to-t from-black via-black/90 to-transparent z-[10010]"
                onClick={(e) => e.stopPropagation()} // Supaya klik area footer tidak menutup lightbox
            >
                 <button onClick={(e) => toggleSelect(photos[lightboxIndex], e)}
                    className={`flex items-center gap-2 px-10 py-3.5 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] active:scale-95 ${selected.find(p => p.id === photos[lightboxIndex].id) ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white border border-white/20 backdrop-blur-md'}`}>
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
