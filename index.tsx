import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { 
  BookOpen, 
  Calendar, 
  CreditCard, 
  Users, 
  Video, 
  Plus, 
  LogOut, 
  CheckCircle, 
  XCircle,
  LayoutDashboard,
  Home,
  User,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Repeat,
  GraduationCap,
  CalendarDays,
  Star,
  PlayCircle,
  ShieldCheck,
  ArrowRight,
  FileText,
  Printer,
  List,
  Mail,
  Lock,
  Phone,
  Loader2,
  Inbox,
  Settings,
  Save
} from 'lucide-react';

// --- SUPABASE CONFIGURATION ---
// NOTA: Dalam projek sebenar (Vite/Next.js), nilai ini akan dibaca dari fail .env
// Untuk memastikan aplikasi ini berjalan lancar sekarang, nilai 'fallback' diisi terus.

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://amdfwcintewpjukgmwve.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZGZ3Y2ludGV3cGp1a2dtd3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjQwMjMsImV4cCI6MjA4NTcwMDAyM30.UbhcX2hn6YvA_M5TKSkvtlQ048gva6bydRkE19GsRuc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Types & Interfaces ---

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
  description: string;
  sessions: string[]; // Array of ISO date strings
  price: number;
  googleMeetLink: string; // Mapped from google_meet_link
  isActive: boolean; // Mapped from is_active
  type: 'single' | 'monthly';
  instructorId: string; // Mapped from instructor_id
  instructorName: string; // Mapped from instructor_name
}

interface Enrollment {
  id: string;
  userId: string; // Mapped from user_id
  classId: string; // Mapped from class_id
  status: 'Unpaid' | 'Paid';
  transactionId?: string; // Mapped from transaction_id
  billCode?: string; // Mapped from bill_code
}

// --- Components ---

const Navbar = ({ user, onOpenAuth, onLogout }: { user: Profile | null, onOpenAuth: () => void, onLogout: () => void }) => (
  <nav className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50 print:hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
          <BookOpen className="h-8 w-8 text-emerald-400" />
          <span className="font-bold text-xl font-arabic tracking-wider">Nur Al-Quran</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 text-sm bg-emerald-800 py-1 px-3 rounded-full border border-emerald-700">
                <User size={16} />
                <span className="truncate max-w-[150px]">{user.name}</span>
                <span className="text-emerald-300 text-xs font-bold uppercase">({user.role === 'ustaz' ? 'Pengajar' : user.role})</span>
              </div>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onLogout();
                }} 
                className="text-emerald-100 hover:text-white hover:bg-emerald-800 p-2 rounded-full transition flex items-center justify-center"
                title="Log Keluar"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={onOpenAuth}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-sm font-semibold transition shadow-lg shadow-emerald-900/50 flex items-center gap-2"
              >
                <User size={16} /> Log Masuk / Daftar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </nav>
);

const AuthModal = ({ 
  isOpen, 
  onClose
}: { 
  isOpen: boolean, 
  onClose: () => void
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'student' | 'ustaz'>('student');

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setSuccessMsg('');
      setIsLoading(false);
      setPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        // --- REAL SUPABASE SIGNUP ---
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
              phone: phone,
              role: role
            }
          }
        });

        if (signUpError) throw signUpError;
        setSuccessMsg("Pendaftaran berjaya! Anda kini telah log masuk secara automatik.");
        setTimeout(() => onClose(), 1500);

      } else {
        // --- REAL SUPABASE LOGIN ---
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ralat berlaku. Sila cuba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden animate-fade-in-up">
        {/* Header Graphic */}
        <div className="bg-emerald-800 h-32 relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
            <div className="relative z-10 text-center">
               <BookOpen className="h-10 w-10 text-emerald-300 mx-auto mb-2" />
               <h2 className="text-2xl font-bold text-white font-arabic tracking-wide">Nur Al-Quran</h2>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 text-emerald-200 hover:text-white">
               <XCircle size={24} />
            </button>
        </div>

        <div className="p-8">
           <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
             {isRegistering ? 'Daftar Akaun Baru' : 'Log Masuk ke Akaun'}
           </h3>

           {error && (
             <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
               <XCircle size={16} /> {error}
             </div>
           )}

           {successMsg && (
             <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
               <CheckCircle size={16} /> {successMsg}
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penuh</label>
                    <input 
                        type="text" 
                        placeholder="Contoh: Ahmad bin Abdullah"
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                      />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. Telefon</label>
                    <input 
                        type="tel" 
                        placeholder="+60123456789"
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                      />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat E-mel</label>
                <input 
                    type="email" 
                    placeholder="nama@email.com"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kata Laluan</label>
                <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
              </div>

              {isRegistering && (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Daftar Sebagai</label>
                    <div className="flex gap-4">
                      <label className={`flex-1 border rounded-lg p-3 cursor-pointer text-center transition ${role === 'student' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' : 'hover:bg-gray-50'}`}>
                        <input type="radio" className="hidden" checked={role === 'student'} onChange={() => setRole('student')} />
                        <span className="font-semibold text-sm">Pelajar</span>
                      </label>
                      <label className={`flex-1 border rounded-lg p-3 cursor-pointer text-center transition ${role === 'ustaz' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' : 'hover:bg-gray-50'}`}>
                        <input type="radio" className="hidden" checked={role === 'ustaz'} onChange={() => setRole('ustaz')} />
                        <span className="font-semibold text-sm">Pengajar</span>
                      </label>
                    </div>
                 </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <> <Loader2 className="animate-spin" size={20} /> Memproses... </>
                ) : (
                  isRegistering ? 'Daftar Sekarang' : 'Log Masuk'
                )}
              </button>
           </form>

           <div className="mt-6 text-center text-sm text-gray-600">
             {isRegistering ? "Sudah mempunyai akaun? " : "Belum mempunyai akaun? "}
             <button 
               onClick={() => {
                   setIsRegistering(!isRegistering);
                   setError('');
               }} 
               className="text-emerald-600 font-bold hover:underline"
             >
               {isRegistering ? "Log Masuk" : "Daftar Percuma"}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const LandingPage = ({ classes, onOpenAuth }: { classes: ClassSession[], onOpenAuth: () => void }) => {
  // Get top 3 active classes
  const highlightedClasses = classes.filter(c => c.isActive).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-emerald-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left space-y-6">
            <span className="inline-block bg-emerald-800 text-emerald-300 text-sm font-semibold px-3 py-1 rounded-full border border-emerald-700">
              #1 Platform Mengaji Online
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight font-arabic">
              Sempurnakan Bacaan <br/> <span className="text-emerald-400">Al-Quran Anda</span>
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto md:mx-0">
              Sertai ribuan pelajar dalam sesi pengajian Al-Quran secara online. 
              Belajar Tajwid, Talaqqi, dan Fardu Ain bersama asatizah bertauliah dari keselesaan rumah anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={onOpenAuth}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                Mula Belajar Sekarang <ArrowRight size={20} />
              </button>
            </div>
            <div className="pt-4 flex items-center justify-center md:justify-start gap-6 text-emerald-200/80 text-sm">
              <span className="flex items-center gap-2"><CheckCircle size={16}/> Guru Bertauliah</span>
              <span className="flex items-center gap-2"><CheckCircle size={16}/> Jadual Fleksibel</span>
              <span className="flex items-center gap-2"><CheckCircle size={16}/> Sijil Disediakan</span>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md md:max-w-full">
            <div className="relative">
              <div className="absolute -inset-4 bg-emerald-500/30 rounded-full blur-3xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1000&auto=format&fit=crop" 
                alt="Quran Reading" 
                className="relative rounded-2xl shadow-2xl border-4 border-emerald-800/50 transform rotate-2 hover:rotate-0 transition duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Highlighted Classes */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-arabic">Kelas Terkini & Popular</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Pilih kelas yang bersesuaian dengan tahap dan masa anda. Daftar segera sebelum kuota penuh.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlightedClasses.length === 0 ? (
                <div className="col-span-3 text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">Tiada Kelas Ditemui</h3>
                    <p className="text-gray-500">Kelas baru akan dibuka tidak lama lagi.</p>
                </div>
            ) : highlightedClasses.map(cls => (
              <div key={cls.id} className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
                 {/* Badge */}
                 <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full z-10">
                    {cls.type === 'monthly' ? 'Pakej Bulanan' : 'Sesi Khas'}
                 </div>

                 <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <BookOpen size={48} className="text-emerald-800/20" />
                    <div className="absolute bottom-4 left-6 text-emerald-900 font-bold text-xl drop-shadow-md">
                       RM {cls.price}
                    </div>
                 </div>

                 <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-2">
                       <GraduationCap size={16} />
                       {cls.instructorName}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {cls.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {cls.description}
                    </p>

                    <div className="mt-auto space-y-3">
                       <button 
                         onClick={onOpenAuth}
                         className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
                       >
                         Daftar Sekarang <ArrowRight size={16} />
                       </button>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ... InstructorDashboard and AdminDashboard remain largely the same visual-wise but need props update
// For brevity, I will update where data handling occurs within the main App structure and pass down

const InstructorDashboard = ({ 
    user,
    classes, 
    enrollments 
  }: { 
    user: Profile,
    classes: ClassSession[], 
    enrollments: Enrollment[]
  }) => {
    // Basic implementation same as before
    const [activeTab, setActiveTab] = useState<'schedule' | 'students'>('schedule');
    const myClasses = classes.filter(c => c.instructorId === user.id);
    const myClassIds = myClasses.map(c => c.id);
    const myEnrollments = enrollments.filter(e => myClassIds.includes(e.classId));
    
    // ... Schedule generation logic (reused) ...
     const getMySchedule = () => {
      const sessions = myClasses.flatMap(c => 
        (c.sessions || []).map((date, idx) => ({ // Safe access sessions
          classTitle: c.title,
          date: new Date(date),
          link: c.googleMeetLink,
          status: c.isActive,
          type: c.type,
          sessionNumber: idx + 1,
          totalSessions: c.sessions?.length || 0
        }))
      );
      return sessions.sort((a, b) => a.date.getTime() - b.date.getTime());
    };
    const handlePrint = () => window.print();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <style>{`
            @media print {
                @page { margin: 1cm; size: portrait; }
                .no-print { display: none !important; }
                .print-only { display: block !important; }
                body { background-color: white !important; }
            }
            `}</style>
            <div className="flex justify-between items-center mb-8 no-print">
                 <h1 className="text-2xl font-bold">Dashboard Pengajar: {user.name}</h1>
                 <div className="flex gap-2">
                    <button onClick={() => setActiveTab('schedule')} className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded">Jadual</button>
                    <button onClick={() => setActiveTab('students')} className="px-4 py-2 bg-white text-gray-600 rounded">Pelajar</button>
                 </div>
            </div>

             {activeTab === 'schedule' && (
                <div className="bg-white p-6 rounded shadow">
                    <button onClick={handlePrint} className="mb-4 bg-emerald-600 text-white px-4 py-2 rounded no-print">Cetak Jadual</button>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                             <thead><tr className="bg-gray-50"><th className="p-3 text-left">Masa</th><th className="p-3 text-left">Kelas</th><th className="p-3 text-left">Link</th></tr></thead>
                             <tbody>
                                 {getMySchedule().map((s, i) => (
                                     <tr key={i} className="border-b">
                                         <td className="p-3">{s.date.toLocaleString()}</td>
                                         <td className="p-3">{s.classTitle} <span className="text-xs text-gray-500">({s.type})</span></td>
                                         <td className="p-3 text-blue-600">{s.link}</td>
                                     </tr>
                                 ))}
                             </tbody>
                        </table>
                    </div>
                </div>
             )}

             {activeTab === 'students' && (
                 <div className="bg-white p-6 rounded shadow">
                      <h3 className="mb-4 font-bold">Senarai Pelajar</h3>
                      <table className="min-w-full">
                          <thead><tr className="bg-gray-50"><th className="p-3 text-left">ID Pelajar</th><th className="p-3 text-left">Kelas</th></tr></thead>
                          <tbody>
                              {myEnrollments.map((e, i) => {
                                  const c = classes.find(cl => cl.id === e.classId);
                                  return (
                                      <tr key={i} className="border-b">
                                          <td className="p-3">{e.userId}</td>
                                          <td className="p-3">{c?.title}</td>
                                      </tr>
                                  )
                              })}
                          </tbody>
                      </table>
                 </div>
             )}
        </div>
    )
  };


const AdminSettings = () => {
  const [settings, setSettings] = useState({
    toyyibpay_secret_key: '',
    toyyibpay_category_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['toyyibpay_secret_key', 'toyyibpay_category_code']);

    if (error) {
       console.error("Error fetching settings:", error);
       // Don't show alert here to avoid annoying popups on load if table empty
    }

    if (data) {
      const mapped = data.reduce((acc: any, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      setSettings(prev => ({ ...prev, ...mapped }));
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
        // Upsert items one by one or bulk
        const updates = [
          { key: 'toyyibpay_secret_key', value: settings.toyyibpay_secret_key },
          { key: 'toyyibpay_category_code', value: settings.toyyibpay_category_code }
        ];

        const { error } = await supabase
          .from('app_settings')
          .upsert(updates);

        if (error) {
            console.error(error);
            alert('Gagal menyimpan tetapan: ' + error.message + '. Pastikan anda adalah ADMIN dan table "app_settings" wujud.');
        } else {
            alert('Tetapan berjaya disimpan!');
        }
    } catch (err: any) {
        console.error("Unexpected error:", err);
        alert("Ralat tidak dijangka: " + err.message);
    } finally {
        setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Settings className="text-emerald-600"/> Konfigurasi Pembayaran (ToyyibPay)
      </h3>

      {loading ? (
        <div className="py-10 text-center text-gray-500">Memuatkan tetapan...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Secret Key</label>
            <input 
              type="text"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={settings.toyyibpay_secret_key}
              onChange={e => setSettings({...settings, toyyibpay_secret_key: e.target.value})}
              placeholder="Contoh: 7d6c..."
            />
            <p className="text-xs text-gray-500 mt-1">Diperolehi dari dashboard ToyyibPay {'>'} Settings</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Code</label>
            <input 
              type="text"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={settings.toyyibpay_category_code}
              onChange={e => setSettings({...settings, toyyibpay_category_code: e.target.value})}
              placeholder="Contoh: t54r..."
            />
            <p className="text-xs text-gray-500 mt-1">Kod kategori untuk bil ini.</p>
          </div>

          <div className="pt-4 border-t">
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold flex items-center gap-2"
            >
              {saving ? 'Menyimpan...' : <><Save size={18} /> Simpan Tetapan</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const AdminDashboard = ({ 
  classes, 
  enrollments, 
  onCreateClass 
}: { 
  classes: ClassSession[], 
  enrollments: Enrollment[], 
  onCreateClass: (c: any) => void 
}) => {
  const [activeTab, setActiveTab] = useState<'classes' | 'settings'>('classes');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
      title: '', description: '', startDate: '', price: '', googleMeetLink: '', instructorId: ''
  });
  const [classType, setClassType] = useState<'single' | 'monthly'>('single');

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Calculate sessions
      const sessions = [];
      const start = new Date(formData.startDate);
      if(classType === 'single') sessions.push(start.toISOString());
      else {
          for(let i=0; i<4; i++) {
              const d = new Date(start); d.setDate(start.getDate() + (i*7));
              sessions.push(d.toISOString());
          }
      }
      
      // We pass the raw data, the App component will handle Supabase insertion
      onCreateClass({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          google_meet_link: formData.googleMeetLink,
          instructor_id: formData.instructorId, // In real app, fetch from profiles where role=ustaz
          type: classType,
          sessions: sessions,
          is_active: true
      });
      setShowForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex gap-2">
               <button 
                 onClick={() => setActiveTab('classes')}
                 className={`px-4 py-2 rounded font-medium ${activeTab === 'classes' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 border'}`}
               >
                 Urus Kelas
               </button>
               <button 
                 onClick={() => setActiveTab('settings')}
                 className={`px-4 py-2 rounded font-medium flex items-center gap-2 ${activeTab === 'settings' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 border'}`}
               >
                 <Settings size={18} /> Tetapan
               </button>
            </div>
        </div>

        {activeTab === 'settings' ? (
          <AdminSettings />
        ) : (
          <>
            <div className="flex justify-end mb-6">
              <button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 text-white px-4 py-2 rounded flex items-center gap-2"><Plus size={18}/> Tambah Kelas</button>
            </div>
            
            {showForm && (
                <div className="bg-white p-6 rounded shadow mb-6 animate-fade-in-up">
                    <h3 className="text-lg font-bold mb-4">Butiran Kelas Baru</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tajuk</label>
                            <input className="border w-full p-2 rounded" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Harga (RM)</label>
                            <input type="number" className="border w-full p-2 rounded" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instructor ID (UUID)</label>
                            <input className="border w-full p-2 rounded" value={formData.instructorId} onChange={e=>setFormData({...formData, instructorId: e.target.value})} placeholder="Paste UUID Ustaz" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mula</label>
                            <input type="datetime-local" className="border w-full p-2 rounded" value={formData.startDate} onChange={e=>setFormData({...formData, startDate: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">GMeet Link</label>
                            <input className="border w-full p-2 rounded" value={formData.googleMeetLink} onChange={e=>setFormData({...formData, googleMeetLink: e.target.value})} />
                        </div>
                        <div className="col-span-2">
                            <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded w-full font-bold">Simpan Kelas</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50"><tr><th className="p-3 text-left">Kelas</th><th className="p-3 text-left">Harga</th><th className="p-3 text-left">Status</th></tr></thead>
                    <tbody>
                        {classes.map(c => (
                            <tr key={c.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">{c.title}</td>
                                <td className="p-3 text-emerald-600 font-bold">RM {c.price}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {c.isActive ? 'Aktif' : 'Tutup'}
                                  </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </>
        )}
    </div>
  );
}

const StudentPortal = ({ 
  user, 
  classes, 
  enrollments, 
  onEnroll, 
  onPay 
}: { 
  user: Profile, 
  classes: ClassSession[], 
  enrollments: Enrollment[], 
  onEnroll: (classId: string) => void,
  onPay: (enrollmentId: string) => void
}) => {
    // Simplified logic for brevity, keeping core structure
    const myEnrolls = enrollments.filter(e => e.userId === user.id);
    const myClassIds = myEnrolls.map(e => e.classId);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Portal Pelajar: {user.name}</h1>
            
            <div className="mb-12">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BookOpen size={20} className="text-emerald-600"/> Senarai Kelas Ditawarkan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {classes.length === 0 ? (
                        <div className="col-span-1 md:col-span-3 text-center py-12 bg-white rounded-lg shadow border border-dashed border-gray-300">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">Tiada Kelas Ditemui</h3>
                            <p className="text-gray-500">Belum ada kelas yang dibuka buat masa ini.</p>
                        </div>
                    ) : classes.map(cls => {
                        const enrolled = myClassIds.includes(cls.id);
                        return (
                            <div key={cls.id} className="bg-white p-6 rounded shadow border">
                                <h3 className="font-bold text-lg">{cls.title}</h3>
                                <div className="text-xs text-emerald-600 font-semibold mb-1 uppercase tracking-wide">{cls.type}</div>
                                <p className="text-emerald-600 font-bold text-xl">RM {cls.price}</p>
                                <p className="text-gray-600 text-sm my-2">{cls.description}</p>
                                {enrolled ? (
                                    <button disabled className="w-full bg-gray-200 text-gray-500 py-2 rounded mt-2 cursor-not-allowed">Sudah Daftar</button>
                                ) : (
                                    <button onClick={() => onEnroll(cls.id)} className="w-full bg-emerald-600 text-white py-2 rounded mt-2 hover:bg-emerald-700">Daftar Sekarang</button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Inbox size={20} className="text-emerald-600"/> Kelas Saya
                </h2>
                <div className="space-y-4">
                    {myEnrolls.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                             <p className="text-gray-500">Anda belum mendaftar sebarang kelas.</p>
                             <p className="text-sm text-gray-400">Sila pilih kelas di atas untuk mula belajar.</p>
                        </div>
                    ) : myEnrolls.map(e => {
                        const cls = classes.find(c => c.id === e.classId);
                        if(!cls) return null;
                        return (
                            <div key={e.id} className="bg-white p-4 rounded shadow border flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold">{cls.title}</h4>
                                    <span className={`text-xs px-2 py-1 rounded ${e.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{e.status}</span>
                                </div>
                                {e.status === 'Paid' ? (
                                    <a href={cls.googleMeetLink} target="_blank" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                                        <Video size={16} /> Masuk Meet
                                    </a>
                                ) : (
                                    <button onClick={() => onPay(e.id)} className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 flex items-center gap-2">
                                        <CreditCard size={16} /> Bayar Sekarang
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

const App = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. Fetch Auth Session & Profile ---
  useEffect(() => {
    const checkSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Fetch profile data
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                
                if (profile) setUser(profile);
            }
        } catch (error) {
            console.error("Session check error:", error);
        } finally {
            setLoading(false);
        }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
             const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
             if(profile) setUser(profile);
        } else {
            setUser(null);
        }
        setLoading(false); // Ensure loading stops on state change
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- 2. Fetch Data (Classes & Enrollments) ---
  const fetchData = async () => {
      // Fetch Classes
      const { data: classesData } = await supabase.from('classes').select('*').order('created_at', { ascending: false });
      if (classesData) {
          // Map DB snake_case to CamelCase
          const mappedClasses: ClassSession[] = classesData.map(c => ({
              id: c.id,
              title: c.title,
              description: c.description,
              sessions: c.sessions,
              price: c.price,
              googleMeetLink: c.google_meet_link,
              isActive: c.is_active,
              type: c.type,
              instructorId: c.instructor_id,
              instructorName: c.instructor_name || 'Ustaz'
          }));
          setClasses(mappedClasses);
      }

      // Fetch Enrollments (If Admin or Ustaz, fetch all relevant. If student, fetch own)
      // For simplicity in this demo, we fetch all and filter in frontend, 
      // but in production use RLS and selective fetching.
      if (user) {
          const { data: enrollData } = await supabase.from('enrollments').select('*');
          if (enrollData) {
               const mappedEnrolls: Enrollment[] = enrollData.map(e => ({
                   id: e.id,
                   userId: e.user_id,
                   classId: e.class_id,
                   status: e.status,
                   transactionId: e.transaction_id
               }));
               setEnrollments(mappedEnrolls);
          }
      }
  };

  useEffect(() => {
      fetchData();
  }, [user]); // Re-fetch when user logs in

  const handleLogout = async () => {
    // 1. Optimistic UI update: Clear user immediately
    setUser(null);

    try {
        // 2. Perform Supabase logout
        await supabase.auth.signOut();
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        // 3. Force hard refresh/redirect to ensure clean state
        window.location.href = '/'; 
    }
  };

  const handleCreateClass = async (newClassData: any) => {
      if(!user) return;
      const { error } = await supabase.from('classes').insert([newClassData]);
      if (error) alert(error.message);
      else {
          alert("Kelas berjaya dicipta!");
          fetchData();
      }
  };

  const handleEnroll = async (classId: string) => {
    if (!user) {
        setIsAuthModalOpen(true);
        return;
    }
    
    // Check local duplicate first
    if (enrollments.some(e => e.userId === user.id && e.classId === classId)) {
        alert("Sudah mendaftar.");
        return;
    }

    const { error } = await supabase.from('enrollments').insert([{
        user_id: user.id,
        class_id: classId,
        status: 'Unpaid'
    }]);

    if (error) alert(error.message);
    else {
        alert("Pendaftaran berjaya!");
        fetchData();
    }
  };

  const handlePay = async (enrollmentId: string) => {
    if(!user) return;
    
    // Find class data to get amount
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return;
    
    const cls = classes.find(c => c.id === enrollment.classId);
    if (!cls) return;

    try {
        // Call Cloudflare Function
        const response = await fetch('/api/payment/create-bill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                enrollmentId: enrollmentId,
                name: user.name,
                email: user.email,
                phone: user.phone || '0123456789',
                amount: cls.price,
                title: cls.title
            })
        });

        const data = await response.json() as any;
        
        if (response.ok && data.paymentUrl) {
            // Redirect user to ToyyibPay
            window.location.href = data.paymentUrl;
        } else {
            alert(`Ralat pembayaran: ${data.error || 'Sila cuba lagi'}`);
        }
    } catch (err: any) {
        console.error(err);
        alert('Gagal menghubungi pelayan pembayaran.');
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-emerald-600"/></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar 
        user={user} 
        onOpenAuth={() => setIsAuthModalOpen(true)} 
        onLogout={handleLogout} 
      />
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {!user && (
        <LandingPage classes={classes} onOpenAuth={() => setIsAuthModalOpen(true)} />
      )}

      {user && user.role === 'admin' && (
        <AdminDashboard 
          classes={classes} 
          enrollments={enrollments} 
          onCreateClass={handleCreateClass} 
        />
      )}

      {user && user.role === 'ustaz' && (
        <InstructorDashboard 
          user={user}
          classes={classes} 
          enrollments={enrollments} 
        />
      )}

      {user && user.role === 'student' && (
        <StudentPortal 
          user={user} 
          classes={classes} 
          enrollments={enrollments} 
          onEnroll={handleEnroll}
          onPay={handlePay}
        />
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);