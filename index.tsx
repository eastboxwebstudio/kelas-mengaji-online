import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BookOpen, User, LogOut, CheckCircle, XCircle, Loader2, Inbox, Plus, CreditCard, Video, GraduationCap, ArrowRight,
  Database, AlertCircle, RefreshCw, Users, Calendar, Clock, Eye, EyeOff, Wand2, Check, ChevronDown, Phone, ClipboardList
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE CLIENT SETUP ---
// Safe access to environment variables with defensive fallback
const getEnvVar = (key: string, fallback: string) => {
  try {
    // Manual check to prevent "Cannot read properties of undefined"
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key] || fallback;
    }
  } catch (e) {
    console.warn("Env read error, using fallback for:", key);
  }
  return fallback;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', "https://ghnzubqlxzqfrvnzvhaj.supabase.co");
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdobnp1YnFseHpxZnJ2bnp2aGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MTM2MjAsImV4cCI6MjA4NTk4OTYyMH0.qWHmjTseGdrNOMrx3KvXF0_eiK2n_WmoZixtdgIjEuc");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Types ---
type UserRole = 'guest' | 'student' | 'admin' | 'ustaz';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

interface ClassSession {
  id: string;
  title: string;
  description?: string;
  schedule?: string;
  price: number;
  google_meet_link?: string;
  is_active: boolean;
  type: 'single' | 'monthly';
  instructor_id?: string;
  instructor_name?: string;
}

interface Enrollment {
  id: string;
  user_id: string;
  class_id: string;
  status: 'Unpaid' | 'Paid';
  classes?: ClassSession; // For joining data
  profiles?: Profile; // For joining data
}


// --- Components ---

const Navbar = ({ user, onOpenAuth, onLogout }: { user: Profile | null, onOpenAuth: () => void, onLogout: () => void }) => (
  <nav className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
          <BookOpen className="h-8 w-8 text-emerald-400" />
          <span className="font-bold text-xl font-arabic tracking-wider">CelikKalam</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 text-sm bg-emerald-800 py-1 px-3 rounded-full border border-emerald-700">
                <User size={16} />
                <span className="truncate max-w-[150px]">{user.name}</span>
                <span className="text-emerald-300 text-xs font-bold uppercase">({user.role === 'ustaz' ? 'Pengajar' : user.role})</span>
              </div>
              <button onClick={onLogout} className="text-emerald-100 hover:text-white hover:bg-emerald-800 p-2 rounded-full transition" title="Log Keluar">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <button onClick={onOpenAuth} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-sm font-semibold transition shadow-lg flex items-center gap-2">
               <User size={16} /> Log Masuk
            </button>
          )}
        </div>
      </div>
    </div>
  </nav>
);

const AuthModal = ({ isOpen, onClose, onLoginSuccess }: { isOpen: boolean, onClose: () => void, onLoginSuccess: () => void }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({ 
      name: '', email: '', password: '', phone: '', role: 'student' as UserRole
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              phone: formData.phone,
              role: formData.role
            }
          }
        });

        if (error) throw error;
        alert('Pendaftaran berjaya! Sila semak emel anda untuk pengesahan.');
        onClose();

      } else { // Logging in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (error) throw error;
        onLoginSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Sesuatu yang tidak kena telah berlaku.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden animate-fade-in-up">
        <div className="bg-emerald-800 p-6 text-center text-white relative">
            <h2 className="text-2xl font-bold font-arabic">CelikKalam</h2>
            <p className="text-emerald-200 text-sm">{isRegistering ? 'Daftar Akaun Baru' : 'Selamat Kembali'}</p>
            <button onClick={onClose} className="absolute top-4 right-4 text-emerald-200 hover:text-white"><XCircle/></button>
        </div>
        <div className="p-8">
           {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex gap-2"><XCircle size={16}/> {error}</div>}
           
           <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <>
                  <input type="text" placeholder="Nama Penuh" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  <input type="tel" placeholder="No. Telefon" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                  
                  <div className="flex gap-4 p-2 bg-gray-50 rounded-lg border">
                      <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer">
                          <input type="radio" name="role" value="student" checked={formData.role === 'student'} onChange={() => setFormData({...formData, role: 'student'})} className="text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-sm font-medium text-gray-700">Pelajar</span>
                      </label>
                      <div className="w-px bg-gray-300"></div>
                      <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer">
                          <input type="radio" name="role" value="ustaz" checked={formData.role === 'ustaz'} onChange={() => setFormData({...formData, role: 'ustaz'})} className="text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-sm font-medium text-gray-700">Pengajar</span>
                      </label>
                  </div>
                </>
              )}
              <input type="email" placeholder="E-mel" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              
              <div className="relative">
                <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Kata Laluan" 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    required 
                />
                <button 
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-emerald-600"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              
              <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg flex justify-center gap-2 transition-all">
                {isLoading && <Loader2 className="animate-spin" />} {isRegistering ? 'Daftar Sekarang' : 'Log Masuk'}
              </button>
           </form>
           <div className="mt-4 text-center text-sm">
             <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="text-emerald-600 font-bold hover:underline">
               {isRegistering ? "Sudah ada akaun? Log Masuk" : "Belum ada akaun? Daftar"}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

// ... (LandingPage component remains the same)
const LandingPage = ({ classes, onOpenAuth }: { classes: ClassSession[], onOpenAuth: () => void }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-emerald-900 py-24 px-4 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-emerald-900 to-emerald-900"></div>
        <div className="relative z-10 max-w-5xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-800 border border-emerald-600 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in-up">Platform Mengaji #1 Di Malaysia</span>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 font-arabic leading-tight tracking-tight">
                Terangi Jiwa Dengan <br/> <span className="text-emerald-400">Cahaya Al-Quran</span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                Kelas pengajian Al-Quran secara personal dan berkumpulan. Dibimbing oleh asatizah bertauliah, mudah dan fleksibel terus dari rumah anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button onClick={onOpenAuth} className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transform hover:-translate-y-1 transition text-lg">
                    Mula Belajar Sekarang <ArrowRight className="h-5 w-5"/>
                </button>
                <button onClick={() => document.getElementById('kelas-section')?.scrollIntoView({behavior: 'smooth'})} className="w-full sm:w-auto px-8 py-4 bg-emerald-800/50 hover:bg-emerald-800 text-emerald-100 border border-emerald-700 hover:text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition text-lg backdrop-blur-sm">
                    Lihat Pakej Kelas
                </button>
            </div>
            
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-emerald-200/80 text-sm font-medium">
                 <div className="flex items-center gap-2 bg-emerald-800/30 px-3 py-1 rounded-full"><CheckCircle size={16} className="text-emerald-400"/> 500+ Pelajar Aktif</div>
                 <div className="flex items-center gap-2 bg-emerald-800/30 px-3 py-1 rounded-full"><CheckCircle size={16} className="text-emerald-400"/> Guru Bertauliah</div>
                 <div className="flex items-center gap-2 bg-emerald-800/30 px-3 py-1 rounded-full"><CheckCircle size={16} className="text-emerald-400"/> Jadual Fleksibel</div>
            </div>
        </div>
      </div>

      {/* Features / Value Proposition */}
      <div className="py-24 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-arabic">Kenapa Pilih CelikKalam?</h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">Kami komited menyediakan pendidikan Al-Quran berkualiti tinggi yang sesuai dengan gaya hidup moden anda, tanpa mengabaikan tradisi ilmu.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 text-center border border-emerald-100">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 rotate-3 hover:rotate-6 transition">
                        <GraduationCap size={32} />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-800">Guru Bertauliah</h3>
                    <p className="text-gray-500 leading-relaxed">Barisan Ustaz & Ustazah yang mempunyai sanad dan berpengalaman luas dalam pengajaran.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 text-center border border-emerald-100">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 -rotate-3 hover:-rotate-6 transition">
                        <Video size={32} />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-800">Kelas Online Interaktif</h3>
                    <p className="text-gray-500 leading-relaxed">Belajar secara bersemuka melalui Google Meet. Jelas, mudah dan menjimatkan masa perjalanan.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 text-center border border-emerald-100">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 rotate-3 hover:rotate-6 transition">
                        <Clock size={32} />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-800">Masa Fleksibel</h3>
                    <p className="text-gray-500 leading-relaxed">Pilih waktu belajar yang sesuai dengan jadual harian anda, sama ada siang atau malam.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 text-center border border-emerald-100">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 -rotate-3 hover:-rotate-6 transition">
                        <BookOpen size={32} />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-800">Modul Komprehensif</h3>
                    <p className="text-gray-500 leading-relaxed">Dari Iqra' asas, Talaqqi Al-Quran, hingga kelas Tarannum dan Tajwid lanjutan.</p>
                </div>
            </div>
        </div>
      </div>

      {/* Classes Section */}
      <div id="kelas-section" className="max-w-7xl mx-auto px-4 py-24 w-full">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-2 block">Pilihan Pembelajaran</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-arabic">Pakej Pengajian Kami</h2>
            <p className="text-gray-600 text-lg">Pilih kelas yang sesuai dengan tahap penguasaan dan matlamat anda.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {classes.length === 0 ? (
                <div className="col-span-3 text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-500">
                    <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <BookOpen className="h-10 w-10 text-gray-300" />
                    </div>
                    <p className="text-xl font-medium text-gray-700">Tiada kelas aktif buat masa ini.</p>
                    <p className="text-sm mt-2">Sila semak semula nanti untuk jadual terkini.</p>
                </div>
            ) : classes.map(cls => (
              <div key={cls.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col group">
                 <div className="bg-slate-50 h-40 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-900/5 group-hover:bg-emerald-900/10 transition"></div>
                    <BookOpen size={48} className="text-emerald-800/20 group-hover:scale-110 transition duration-500" />
                    <span className="absolute top-4 right-4 bg-white/90 backdrop-blur text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">{cls.type}</span>
                 </div>
                 <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold mb-3 text-gray-900 font-arabic group-hover:text-emerald-700 transition">{cls.title}</h3>
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                             <User size={16} className="text-emerald-500"/>
                             <span className="font-medium">{cls.instructor_name || "Pengajar: Admin"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={16} className="text-emerald-500"/>
                            <span>{cls.schedule || "Jadual akan dimaklumkan"}</span>
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">{cls.description}</p>
                    <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between items-center">
                        <div>
                            <span className="text-xs text-gray-400 font-medium uppercase">Yuran</span>
                            <div className="font-bold text-2xl text-emerald-600">RM {cls.price}</div>
                        </div>
                        <button onClick={onOpenAuth} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2 transition">
                            Daftar <ArrowRight size={16}/>
                        </button>
                    </div>
                 </div>
              </div>
            ))}
          </div>
      </div>

      {/* Steps / How it works */}
      <div className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
             <div className="text-center mb-16">
                 <span className="text-emerald-400 font-bold tracking-wider uppercase text-sm mb-2 block">Proses Pendaftaran</span>
                 <h2 className="text-3xl md:text-4xl font-bold font-arabic mb-4">Langkah Mudah Bermula</h2>
                 <p className="text-gray-400">Mulakan perjalanan Al-Quran anda dalam 3 langkah ringkas.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-16 right-16 h-0.5 bg-gray-800 z-0"></div>

                <div className="relative z-10 text-center">
                    <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-gray-800 relative">
                        <span className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-sm border-4 border-gray-900">1</span>
                        <User size={32} className="text-emerald-400"/>
                    </div>
                    <h3 className="text-xl font-bold mb-3">Daftar Akaun</h3>
                    <p className="text-gray-400 text-sm leading-relaxed px-4">Cipta akaun pelajar secara percuma untuk mengakses portal pembelajaran dan melihat jadual penuh.</p>
                </div>
                <div className="relative z-10 text-center">
                     <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-gray-800 relative">
                        <span className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-sm border-4 border-gray-900">2</span>
                        <Check size={32} className="text-emerald-400"/>
                    </div>
                    <h3 className="text-xl font-bold mb-3">Pilih & Daftar Kelas</h3>
                    <p className="text-gray-400 text-sm leading-relaxed px-4">Pilih sesi pengajian atau ustaz pilihan anda daripada senarai dan lakukan pembayaran yuran.</p>
                </div>
                <div className="relative z-10 text-center">
                     <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-gray-800 relative">
                        <span className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-sm border-4 border-gray-900">3</span>
                        <Video size={32} className="text-emerald-400"/>
                    </div>
                    <h3 className="text-xl font-bold mb-3">Mula Belajar</h3>
                    <p className="text-gray-400 text-sm leading-relaxed px-4">Masuk ke pautan Google Meet pada waktu yang ditetapkan. Selamat menuntut ilmu!</p>
                </div>
             </div>
             
             <div className="text-center mt-16">
                 <button onClick={onOpenAuth} className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-full shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-1">
                    Daftar Sekarang & Mula Belajar
                 </button>
             </div>
        </div>
      </div>
    </div>
  );
};

const PaymentModal = ({ isOpen, onClose, enrollment, onConfirmPayment, isLoading }: { 
    isOpen: boolean, 
    onClose: () => void, 
    enrollment: Enrollment | null, 
    onConfirmPayment: (id: string) => Promise<void>, 
    isLoading: boolean 
}) => {
    if (!isOpen || !enrollment) return null;
    
    const cls = enrollment.classes;

    const handleConfirm = async () => {
        try {
            await onConfirmPayment(enrollment.id);
            onClose(); // Close modal only on successful payment
        } catch (error) {
            console.error("Payment failed:", error);
            // Error is already alerted by the handler, no need to alert again.
            // Modal remains open for user to retry.
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><CreditCard size={22} className="text-emerald-600"/> Pengesahan Pembayaran</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><XCircle/></button>
                </div>
                <div className="p-8 space-y-6">
                    <div>
                        <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">Butiran Kelas</h3>
                        <div className="mt-2 bg-slate-50 p-4 rounded-lg border">
                            <p className="font-bold text-lg text-gray-900">{cls?.title}</p>
                            <p className="text-sm text-gray-600">Pengajar: {cls?.instructor_name}</p>
                            <div className="mt-2 pt-2 border-t flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Jumlah Bayaran:</span>
                                <span className="text-2xl font-bold text-emerald-600">RM {cls?.price}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">Maklumat Pembayaran (Simulasi)</h3>
                        <div className="mt-2 space-y-4">
                            <input type="text" placeholder="Nama Penuh Pada Kad" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50" defaultValue={enrollment.profiles?.name} />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="sm:col-span-3 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50" />
                                <input type="text" placeholder="MM/YY" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50" />
                                <input type="text" placeholder="CVC" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50" />
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleConfirm} 
                        disabled={isLoading} 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-lg flex justify-center items-center gap-2 transition-all shadow-lg hover:shadow-xl shadow-emerald-500/20 disabled:bg-emerald-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" /> Memproses...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={18}/> Sahkan Pembayaran
                            </>
                        )}
                    </button>
                    <p className="text-xs text-center text-gray-400">Ini adalah simulasi. Tiada caj sebenar akan dikenakan.</p>
                </div>
            </div>
        </div>
    );
};


const StudentPortal = ({ user, classes, enrollments, onEnroll, onPay, loading }: {
    user: Profile;
    classes: ClassSession[];
    enrollments: Enrollment[];
    onEnroll: (classId: string) => void;
    onPay: (enrollId: string) => Promise<void>;
    loading: boolean;
}) => {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

    const handleOpenPaymentModal = (enrollment: Enrollment) => {
        setSelectedEnrollment(enrollment);
        setIsPaymentModalOpen(true);
    };

    const myEnrolls = enrollments.filter((e: Enrollment) => e.user_id === user.id);
    const myClassIds = myEnrolls.map((e: Enrollment) => e.class_id);

    const myActiveClasses = myEnrolls
      .filter((e: Enrollment) => e.status === 'Paid')
      .map((e: Enrollment) => e.classes)
      .filter(Boolean); // Filter out any undefined classes

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-8">Portal Pelajar: <span className="text-emerald-600">{user.name}</span></h1>
                
                {/* JADUAL SECTION */}
                <div className="mb-12">
                     <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar size={20} className="text-emerald-600"/> Jadual Kelas (Lunas)</h2>
                     <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        {myActiveClasses.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">Tiada kelas aktif (yuran lunas). Sila jelaskan yuran untuk melihat jadual.</div>
                        ) : (
                            <div className="grid grid-cols-1 divide-y">
                                {myActiveClasses.map((cls: ClassSession) => (
                                    <div key={cls.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-emerald-100 p-3 rounded-full text-emerald-700">
                                                <Clock size={20}/>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{cls.title}</h4>
                                                <p className="text-sm text-emerald-700 mb-1 font-semibold flex items-center gap-1"><User size={12}/> {cls.instructor_name}</p>
                                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                                    <span className="font-medium text-emerald-600">{cls.schedule || "Masa belum ditetapkan"}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 md:mt-0">
                                            <a href={cls.google_meet_link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                                                <Video size={16}/> Link Google Meet
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BookOpen size={20} className="text-emerald-600"/> Senarai Kelas Ditawarkan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {classes.map((cls: ClassSession) => {
                            const enrolled = myClassIds.includes(cls.id);
                            return (
                                <div key={cls.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
                                    <h3 className="font-bold text-lg mb-2">{cls.title}</h3>
                                    <p className="text-sm text-emerald-700 mb-2 flex items-center gap-1 font-semibold"><User size={14}/> {cls.instructor_name || "Pengajar: Admin"}</p>
                                    <div className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Calendar size={12}/> {cls.schedule || "Jadual belum ada"}</div>
                                    <div className="flex justify-between items-end mb-4">
                                         <p className="text-emerald-600 font-bold text-xl">RM {cls.price}</p>
                                         <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{cls.type}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cls.description}</p>
                                    {enrolled ? (
                                        <button disabled className="w-full bg-gray-100 text-gray-400 py-2 rounded font-medium cursor-not-allowed border border-gray-200">Telah Daftar</button>
                                    ) : (
                                        <button onClick={() => onEnroll(cls.id)} className="w-full bg-emerald-600 text-white py-2 rounded font-medium hover:bg-emerald-700 transition shadow-sm">Daftar Sekarang</button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Inbox size={20} className="text-emerald-600"/> Status Yuran</h2>
                <div className="space-y-4">
                    {myEnrolls.length === 0 && (
                        <div className="p-8 text-center bg-gray-50 border border-dashed rounded-xl text-gray-500">
                            Anda belum mendaftar sebarang kelas.
                        </div>
                    )}
                    {myEnrolls.map((e: Enrollment) => {
                        const cls = e.classes;
                        if(!cls) return null;
                        return (
                            <div key={e.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <h4 className="font-bold text-lg">{cls.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs px-2 py-1 rounded font-bold ${e.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {e.status === 'Paid' ? 'Lunas' : 'Belum Bayar'}
                                        </span>
                                        <span className="text-sm text-gray-500">ID: {e.id.substring(0,8)}...</span>
                                    </div>
                                </div>
                                {e.status === 'Paid' ? (
                                    <a href={cls.google_meet_link} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition shadow-sm">
                                        <Video size={18} /> Masuk Google Meet
                                    </a>
                                ) : (
                                    <button onClick={() => handleOpenPaymentModal(e)} className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 font-medium transition shadow-sm animate-pulse">
                                        <CreditCard size={18} /> Bayar Yuran
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                enrollment={selectedEnrollment}
                onConfirmPayment={onPay}
                isLoading={loading}
            />
        </>
    )
};

const InstructorDashboard = ({ user, classes, enrollments, users }: any) => {
    const myClasses = classes.filter((c:any) => c.instructor_id === user.id);
    const myClassIds = myClasses.map((c:any) => c.id);
    const myStudentsEnrollments = enrollments.filter((e:any) => myClassIds.includes(e.class_id));

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><GraduationCap className="text-emerald-600"/> Dashboard Pengajar</h1>
                    <p className="text-gray-500 text-sm">Selamat datang, Ustaz {user.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* My Classes List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BookOpen size={20} className="text-emerald-600"/> Kelas Ditugaskan Kepada Anda</h3>
                    <div className="overflow-y-auto max-h-[400px]">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="p-3 text-left">Nama Kelas</th>
                                    <th className="p-3 text-left">Jadual</th>
                                    <th className="p-3 text-right">Yuran</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myClasses.map((c: any) => (
                                    <tr key={c.id} className="border-b">
                                        <td className="p-3 font-medium">{c.title}</td>
                                        <td className="p-3 text-gray-500">{c.schedule}</td>
                                        <td className="p-3 text-right">RM {c.price}</td>
                                    </tr>
                                ))}
                                {myClasses.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-gray-500">Tiada kelas ditugaskan secara rasmi kepada anda.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Students List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Users size={20} className="text-emerald-600"/> Senarai Pelajar Anda</h3>
                    <div className="overflow-y-auto max-h-[400px]">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="p-3 text-left">Pelajar</th>
                                    <th className="p-3 text-left">Kelas Diambil</th>
                                    <th className="p-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myStudentsEnrollments.map((e: Enrollment) => {
                                    const student = e.profiles;
                                    const cls = e.classes;

                                    return (
                                        <tr key={e.id} className="border-b">
                                            <td className="p-3">
                                                <div className="font-bold text-gray-900">{student ? student.name : 'Nama Tidak Dijumpai'}</div>
                                                <div className="text-xs text-gray-400 font-mono mb-1">{e.user_id.substring(0,8)}...</div>
                                                {student?.phone && (
                                                    <div className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                                                        <Phone size={10} /> {student.phone}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 align-top pt-3">{cls?.title}</td>
                                            <td className="p-3 text-center align-top pt-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${e.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {myStudentsEnrollments.length === 0 && 
                                    <tr><td colSpan={3} className="p-4 text-center text-gray-500">Tiada pelajar berdaftar dalam kelas anda.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

const AdminDashboard = ({ classes, users, enrollments, onCreateClass, onVerifyPayment }: { classes: ClassSession[], users: Profile[], enrollments: Enrollment[], onCreateClass: (data: any) => void, onVerifyPayment: (id: string) => void }) => {
    const [activeTab, setActiveTab] = useState<'classes' | 'orders'>('classes');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', price: '', google_meet_link: '', description: '', schedule: '', instructor_name: '', instructor_id: '' });

    const instructors = users.filter(u => u.role === 'ustaz');

    const [useAutoSchedule, setUseAutoSchedule] = useState(false);
    const [startDay, setStartDay] = useState('');
    const [startTime, setStartTime] = useState('');

    const generateSchedule = () => {
        if (!startDay || !startTime) {
            alert("Sila pilih tarikh mula dan masa.");
            return;
        }

        const dates = [];
        let currentDate = new Date(startDay);

        for (let i = 4; i > 0; i--) { // Just looping 4 times, fixed logic
            const day = String(currentDate.getDate()).padStart(2, '0');
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            dates.push(`${day}/${month}`);
            
            currentDate.setDate(currentDate.getDate() + 7);
        }
        
        // Correcting the loop logic above which was weird in my thought, standard loop:
        const generatedDates = [];
        let d = new Date(startDay);
        for(let i=0; i<4; i++) {
             const day = String(d.getDate()).padStart(2, '0');
             const month = String(d.getMonth() + 1).padStart(2, '0');
             generatedDates.push(`${day}/${month}`);
             d.setDate(d.getDate() + 7);
        }

        let [hours, minutes] = startTime.split(':');
        let modifier = +hours >= 12 ? 'PM' : 'AM';
        let hrs = +hours % 12 || 12;
        let niceTime = `${hrs}:${minutes} ${modifier}`;

        const finalString = `${generatedDates.join(', ')} (${niceTime})`;
        setFormData({ ...formData, schedule: finalString });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreateClass(formData);
        setShowForm(false);
        setFormData({ title: '', price: '', google_meet_link: '', description: '', schedule: '', instructor_name: '', instructor_id: '' });
        setUseAutoSchedule(false);
        setStartDay('');
        setStartTime('');
    }

    const handleInstructorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedInstructor = instructors.find(i => i.id === selectedId);
        
        if (selectedInstructor) {
            setFormData({
                ...formData,
                instructor_id: selectedInstructor.id,
                instructor_name: selectedInstructor.name
            });
        } else {
             setFormData({
                ...formData,
                instructor_id: '',
                instructor_name: ''
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2"><Database className="text-emerald-600"/> Admin Dashboard</h1>
                <div className="flex gap-2 bg-white rounded-lg p-1 border shadow-sm">
                    <button onClick={() => setActiveTab('classes')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'classes' ? 'bg-emerald-100 text-emerald-800' : 'text-gray-500 hover:text-gray-900'}`}>
                        Pengurusan Kelas
                    </button>
                    <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'orders' ? 'bg-emerald-100 text-emerald-800' : 'text-gray-500 hover:text-gray-900'}`}>
                        Pengurusan Tempahan
                    </button>
                </div>
            </div>

            {activeTab === 'classes' ? (
                <>
                    <div className="flex justify-end mb-6">
                        <button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-emerald-700 transition shadow-sm">
                            {showForm ? <XCircle size={18}/> : <Plus size={18}/>} 
                            {showForm ? 'Batal' : 'Tambah Kelas'}
                        </button>
                    </div>

                    {showForm && (
                        <div className="bg-white p-6 rounded-xl shadow-md border mb-6 animate-fade-in-up">
                            <h3 className="font-bold mb-4 text-lg border-b pb-2">Butiran Kelas Baru</h3>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tajuk Kelas</label>
                                    <input className="border w-full p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Contoh: Kelas Iqra" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} required/>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tugaskan Pengajar (Ustaz)</label>
                                    <div className="relative">
                                        <select 
                                            className="border w-full p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none appearance-none bg-white cursor-pointer" 
                                            value={formData.instructor_id} 
                                            onChange={handleInstructorChange}
                                            required
                                        >
                                            <option value="">-- Pilih Ustaz Berdaftar --</option>
                                            {instructors.map(inst => (
                                                <option key={inst.id} value={inst.id}>{inst.name} ({inst.email})</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16}/>
                                    </div>
                                    {instructors.length === 0 && <p className="text-xs text-red-500 mt-1">Tiada akaun Ustaz dijumpai. Sila pastikan role 'ustaz' telah ditetapkan di database.</p>}
                                </div>

                                <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-bold">Jadual / Masa</label>
                                        <button type="button" onClick={() => setUseAutoSchedule(!useAutoSchedule)} className="text-xs flex items-center gap-1 text-emerald-600 font-bold hover:underline">
                                            <Wand2 size={12}/> {useAutoSchedule ? "Tulis Manual" : "Jana Jadual Automatik (4 Sesi)"}
                                        </button>
                                    </div>

                                    {useAutoSchedule && (
                                        <div className="grid grid-cols-2 gap-4 mb-2 animate-fade-in-up">
                                            <div>
                                                <label className="text-xs text-gray-500">Tarikh Mula</label>
                                                <input type="date" className="border w-full p-2 rounded" value={startDay} onChange={e=>setStartDay(e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Masa</label>
                                                <input type="time" className="border w-full p-2 rounded" value={startTime} onChange={e=>setStartTime(e.target.value)} />
                                            </div>
                                            <button type="button" onClick={generateSchedule} className="col-span-2 bg-emerald-100 text-emerald-700 py-1 rounded text-sm font-bold hover:bg-emerald-200">
                                                Jana Tarikh
                                            </button>
                                        </div>
                                    )}

                                    <input className="border w-full p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Contoh: Setiap Jumaat, 9:00 PM" value={formData.schedule} onChange={e=>setFormData({...formData, schedule: e.target.value})} required/>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Harga (RM)</label>
                                    <input className="border w-full p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="50" type="number" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} required/>
                                </div>
                                <div>
                                     <label className="block text-sm font-medium mb-1">Google Meet Link</label>
                                     <input className="border w-full p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://meet.google.com/..." value={formData.google_meet_link} onChange={e=>setFormData({...formData, google_meet_link: e.target.value})}/>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Penerangan</label>
                                    <textarea className="border w-full p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none h-24" placeholder="Maklumat lanjut mengenai kelas..." value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}/>
                                </div>
                                <button className="md:col-span-2 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition">Simpan Kelas</button>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-left font-semibold text-gray-600">Kelas</th>
                                    <th className="p-4 text-left font-semibold text-gray-600">Pengajar</th>
                                    <th className="p-4 text-left font-semibold text-gray-600">Jadual</th>
                                    <th className="p-4 text-left font-semibold text-gray-600">Harga</th>
                                    <th className="p-4 text-left font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classes.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-400">Tiada rekod kelas.</td></tr>
                                )}
                                {classes.map((c: ClassSession) => (
                                    <tr key={c.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-medium">{c.title}</td>
                                        <td className="p-4 text-gray-500"><User size={14} className="inline mr-1"/>{c.instructor_name || "-"}</td>
                                        <td className="p-4 text-gray-500 text-sm">{c.schedule}</td>
                                        <td className="p-4 text-emerald-600 font-bold">RM {c.price}</td>
                                        <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold uppercase">Aktif</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-fade-in-up">
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-lg flex items-center gap-2"><ClipboardList size={20} className="text-emerald-600"/> Senarai Tempahan Pelajar</h3>
                        <div className="text-sm text-gray-500">Jumlah: {enrollments.length}</div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600">ID Tempahan</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Pelajar</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Kelas</th>
                                    <th className="p-4 text-center text-sm font-semibold text-gray-600">Status</th>
                                    <th className="p-4 text-center text-sm font-semibold text-gray-600">Tindakan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-400">Tiada tempahan direkodkan.</td></tr>
                                )}
                                {enrollments.map((e: Enrollment) => {
                                    const student = e.profiles;
                                    const cls = e.classes;
                                    
                                    return (
                                        <tr key={e.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4 text-xs font-mono text-gray-500">{e.id.substring(0,8)}...</td>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-900">{student ? student.name : 'Unknown User'}</div>
                                                <div className="text-xs text-gray-500">{student?.email}</div>
                                                {student?.phone && <div className="text-xs text-emerald-600 flex items-center gap-1"><Phone size={10}/> {student.phone}</div>}
                                            </td>
                                            <td className="p-4 text-sm">
                                                <div className="font-medium">{cls ? cls.title : 'Kelas Tidak Dijumpai'}</div>
                                                <div className="text-xs text-gray-500">RM {cls?.price}</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${e.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {e.status !== 'Paid' ? (
                                                    <button 
                                                        onClick={() => onVerifyPayment(e.id)} 
                                                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700 flex items-center gap-1 mx-auto"
                                                        title="Sahkan Pembayaran"
                                                    >
                                                        <Check size={12}/> Sahkan Bayaran
                                                    </button>
                                                ) : (
                                                    <div className="text-green-600 flex items-center justify-center gap-1 text-xs font-bold">
                                                        <CheckCircle size={14}/> Selesai
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

const App = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [users, setUsers] = useState<Profile[]>([]); 
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    
    // Fetch Classes (Public)
    try {
        const { data: classesData, error: classesError } = await supabase.from('classes').select('*').order('created_at', { ascending: false });
        if(classesError) throw classesError;
        setClasses(classesData as ClassSession[]);
    } catch (error: any) {
        console.error("Error fetching classes:", error);
    }

    // Authenticated Fetches
    if(user) {
        // Fetch Enrollments (User/Admin)
        try {
             const { data: enrollmentsData, error: enrollmentsError } = await supabase
                .from('enrollments')
                .select('*, classes(*), profiles(*)')
                .order('created_at', { ascending: false });
             if(enrollmentsError) throw enrollmentsError;
             setEnrollments(enrollmentsData as Enrollment[]);
        } catch (error: any) {
            console.error("Error fetching enrollments:", error);
        }

        // Fetch Users (Admin Only)
        if(user.role === 'admin') {
            try {
                const { data: usersData, error: usersError } = await supabase.from('profiles').select('*');
                if (usersError) throw usersError;
                setUsers(usersData as Profile[]);
            } catch (error: any) {
                console.error("Error fetching users (Admin):", error);
                // Don't alert here to avoid blocking other data if RLS fails initially
            }
        }
    }
    
    if (!silent) setLoading(false);
  }, [user]);

  // Handle Auth changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user;
      if (currentUser) {
        // We handle the potential race condition where auth exists but profile is being created
        try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .maybeSingle(); // Use maybeSingle to avoid 406 error if row doesn't exist yet
            
            if (error) {
                console.error("Error fetching profile:", error);
                return;
            }
            
            if (profile) {
                setUser(profile as Profile);
            } else {
                console.log("Profile not found yet (might be created by trigger).");
                // Optionally retry or just wait for next update? 
                // For now, set null to prevent UI issues
                setUser(null);
            }
        } catch(e) {
            console.error(e);
            setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []); // Remove dependency on fetchData to avoid loops

  // Fetch data when user changes or on mount
  useEffect(() => {
    fetchData(); 
  }, [fetchData]);

  // Real-time subscriptions (Silent updates)
  useEffect(() => {
    const classChannel = supabase.channel('public:classes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, payload => {
        console.log('Class change received!', payload);
        fetchData(true); // Silent update
      })
      .subscribe();
      
    const enrollmentChannel = supabase.channel('public:enrollments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, payload => {
        console.log('Enrollment change received!', payload);
        fetchData(true); // Silent update
      })
      .subscribe();

    return () => {
        supabase.removeChannel(classChannel);
        supabase.removeChannel(enrollmentChannel);
    };
  }, [fetchData]);


  const handleCreateClass = async (data: Omit<ClassSession, 'id' | 'is_active' | 'type'>) => {
      setLoading(true);
      try {
          const { error } = await supabase.from('classes').insert({
              ...data,
              price: Number(data.price) // ensure price is number
          });
          if (error) throw error;
          alert("Kelas berjaya ditambah!");
      } catch (error: any) {
          alert("Gagal menambah kelas: " + error.message);
      } finally {
          setLoading(false);
      }
  }

  const handleEnroll = async (classId: string) => {
      if(!user) return setIsAuthOpen(true);
      
      const exists = enrollments.find(e => e.user_id === user.id && e.class_id === classId);
      if (exists) {
          alert("Anda sudah mendaftar untuk kelas ini.");
          return;
      }
      
      setLoading(true);
      try {
          const { error } = await supabase.from('enrollments').insert({
              user_id: user.id,
              class_id: classId,
              status: 'Unpaid'
          });
          if (error) throw error;
          alert("Berjaya daftar! Sila buat pembayaran di tab 'Status Yuran'.");
      } catch (error: any) {
          alert("Gagal mendaftar: " + error.message);
      } finally {
          setLoading(false);
      }
  }

  const handlePay = async (enrollId: string) => {
      setLoading(true);
      try {
          const { error } = await supabase.from('enrollments').update({ status: 'Paid' }).eq('id', enrollId);
          if (error) {
              throw error;
          }
          alert("Pembayaran berjaya direkodkan!");
      } catch (error: any) {
          alert("Gagal merekod pembayaran: " + error.message);
          throw error; // Re-throw the error to be caught by the caller
      } finally {
          setLoading(false);
      }
  }

  const handleAdminVerifyPayment = async (enrollId: string) => {
      if(confirm("Adakah anda pasti mahu mengesahkan pembayaran ini secara manual?")) {
          setLoading(true);
          try {
              const { error } = await supabase.from('enrollments').update({ status: 'Paid' }).eq('id', enrollId);
              if (error) throw error;
              alert("Status berjaya dikemaskini ke 'Paid'.");
          } catch (error: any) {
              alert("Gagal mengesahkan: " + error.message);
          } finally {
              setLoading(false);
          }
      }
  }
  
  const handleLogout = async () => {
      try {
          await supabase.auth.signOut();
      } catch (error) {
          console.error("Logout error:", error);
      } finally {
          setUser(null);
          setEnrollments([]);
          setUsers([]);
          // Force a reload to clear any lingering Supabase client state or subscription listeners
          window.location.href = '/'; 
      }
  }

  const renderDashboard = () => {
      if (!user) return <LandingPage classes={classes} onOpenAuth={() => setIsAuthOpen(true)} />;
      
      const role = user.role || 'student';
      
      if (role === 'admin') return <AdminDashboard classes={classes} users={users} enrollments={enrollments} onCreateClass={handleCreateClass} onVerifyPayment={handleAdminVerifyPayment} />;
      if (role === 'ustaz') return <InstructorDashboard user={user} classes={classes} enrollments={enrollments} users={users} />;
      if (role === 'student') return <StudentPortal user={user} classes={classes} enrollments={enrollments} onEnroll={handleEnroll} onPay={handlePay} loading={loading} />;
      
      return <div>Error: Peranan pengguna tidak diketahui.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <Navbar user={user} onOpenAuth={() => setIsAuthOpen(true)} onLogout={handleLogout} />
      
      {loading && <div className="fixed top-20 right-4 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex gap-3 items-center z-[100] animate-bounce"><Loader2 className="animate-spin" size={20}/> Memproses data...</div>}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={() => fetchData()} />

      {renderDashboard()}
    
      <div className="text-center py-10 bg-slate-100 text-gray-500 text-sm mt-auto">
         <div className="max-w-7xl mx-auto px-4">
            <p className="font-semibold text-emerald-900 mb-2">CelikKalam Digital</p>
            <p className="text-xs">&copy; {new Date().getFullYear()} Hak Cipta Terpelihara.</p>
            <p className="text-xs text-gray-400 mt-2">Dikuasakan oleh Supabase</p>
         </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);