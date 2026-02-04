import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BookOpen, 
  User, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Inbox, 
  Settings, 
  Plus, 
  CreditCard, 
  Video, 
  GraduationCap, 
  ArrowRight,
  Sheet,
  Database,
  AlertCircle,
  RefreshCw,
  Users,
  Calendar,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';

// --- CONFIGURATION ---

// URL Web App Google Apps Script anda
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxnRE4NaXFw4uWD8_6EpL5o743Btqgce8UyWzoEEQGOgxX_JsiSaTSgEnyfdyqLGkXeRQ/exec"; 

// --- Types & Interfaces ---

type UserRole = 'guest' | 'student' | 'admin' | 'ustaz';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  password?: string;
}

interface ClassSession {
  id: string;
  title: string;
  description: string;
  schedule: string; 
  price: number;
  googleMeetLink: string; 
  isActive: boolean; 
  type: 'single' | 'monthly';
  instructorId: string; 
  instructorName: string; 
}

interface Enrollment {
  id: string;
  userId: string; 
  classId: string; 
  status: 'Unpaid' | 'Paid';
  transactionId?: string; 
}

// --- API Helper ---

const apiCall = async (action: string, payload: any = {}, method = 'GET') => {
  // Google Apps Script Web App handling
  let url = GOOGLE_SCRIPT_URL;
  let options: RequestInit = { method };

  if (method === 'GET') {
    const params = new URLSearchParams({ action, ...payload });
    url = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
  } else {
    options.body = JSON.stringify({ action, ...payload });
    // Use text/plain to avoid CORS preflight issues in GAS
    options.headers = { 'Content-Type': 'text/plain' };
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    
    let json;
    try {
        json = JSON.parse(text);
    } catch (e) {
        console.error("Server returned non-JSON:", text);
        throw new Error("Ralat pelayan: Data tidak sah diterima dari Google Sheet. Sila pastikan deployment GAS betul.");
    }

    if (!response.ok) throw new Error("Gagal menghubungi Google Sheet: " + response.statusText);
    if (json.status === 'error' || json.error) throw new Error(json.message || json.error);
    
    return json;
  } catch (err: any) {
     throw new Error(err.message || "Ralat rangkaian.");
  }
};

// --- Components ---

const Navbar = ({ user, onOpenAuth, onLogout }: { user: Profile | null, onOpenAuth: () => void, onLogout: () => void }) => (
  <nav className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
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

const AuthModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: (u: Profile) => void }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<{name: string, email: string, password: string, phone: string, role: UserRole}>({ 
      name: '', email: '', password: '', phone: '', role: 'student' 
  });

  if (!isOpen) return null;

  const sanitizeUser = (rawUser: any): Profile => {
      // Safely handle role casting and prevent crash if role is numeric (corrupted data)
      let roleStr = 'student';
      if (rawUser.role) {
          const r = String(rawUser.role).toLowerCase().trim();
          // Validation: Role must be a valid string, not a phone number (digits)
          if (!/^\d+$/.test(r)) {
             roleStr = r;
          }
      }
      return {
          ...rawUser,
          role: roleStr as UserRole
      };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const email = formData.email.trim();
    const password = formData.password.trim();

    try {
      if (isRegistering) {
        // WORKAROUND: The Google Apps Script backend has a bug where it swaps the 'phone' and 'role' columns when saving.
        // To fix this from the client-side without touching the backend, we deliberately swap the keys in the payload.
        // We send the 'role' value in the 'phone' key, and 'phone' value in the 'role' key.
        const payload = { 
            name: formData.name,
            email: email, 
            password: password,
            // Swapping keys to handle backend bug where phone/role columns are inverted
            phone: formData.role,
            role: formData.phone, 
        };

        const res = await apiCall('register', payload, 'POST');
        if (res.user) {
           const user = sanitizeUser(res.user);
           localStorage.setItem('currentUser', JSON.stringify(user));
           onLogin(user);
           onClose();
        }
      } else {
        const res = await apiCall('login', { email, password }, 'POST');
        if (res.user) {
            const user = sanitizeUser(res.user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            onLogin(user);
            onClose();
        } else {
            setError("Emel atau kata laluan salah.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ralat sambungan. Sila cuba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden animate-fade-in-up">
        <div className="bg-emerald-800 p-6 text-center text-white relative">
            <h2 className="text-2xl font-bold font-arabic">Nur Al-Quran</h2>
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
                  
                  {/* Role Selection */}
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

const LandingPage = ({ classes, onOpenAuth }: { classes: ClassSession[], onOpenAuth: () => void }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-emerald-900 py-20 px-4 text-center text-white relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 font-arabic">Sempurnakan Bacaan Al-Quran</h1>
            <p className="text-xl text-emerald-100 mb-8">Platform pengajian Al-Quran online yang mudah, fleksibel dan dipercayai.</p>
            <button onClick={onOpenAuth} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg inline-flex items-center gap-2 transform hover:scale-105 transition">
                Mula Belajar <ArrowRight />
            </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-16 w-full">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">Kelas Pilihan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {classes.length === 0 ? (
                <div className="col-span-3 text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-lg font-medium">Tiada kelas aktif buat masa ini.</p>
                    <p className="text-sm">Sila semak semula nanti.</p>
                </div>
            ) : classes.map(cls => (
              <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                 <div className="bg-slate-100 h-32 flex items-center justify-center relative">
                    <BookOpen size={40} className="text-emerald-800/20" />
                    <span className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full uppercase">{cls.type}</span>
                 </div>
                 <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold mb-2 text-gray-900">{cls.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Calendar size={14} className="text-emerald-600"/>
                        <span>{cls.schedule || "Jadual akan dimaklumkan"}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3">{cls.description}</p>
                    <div className="mt-auto pt-4 border-t flex justify-between items-center">
                        <span className="font-bold text-xl text-emerald-600">RM {cls.price}</span>
                        <button onClick={onOpenAuth} className="text-emerald-700 font-bold text-sm hover:underline flex items-center gap-1">Daftar <ArrowRight size={14}/></button>
                    </div>
                 </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};

const StudentPortal = ({ user, classes, enrollments, onEnroll, onPay }: any) => {
    const myEnrolls = enrollments.filter((e: Enrollment) => e.userId === user.id);
    const myClassIds = myEnrolls.map((e: Enrollment) => e.classId);

    // Get my active classes to show schedule
    const myActiveClasses = classes.filter((c: ClassSession) => myClassIds.includes(c.id));

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Portal Pelajar: <span className="text-emerald-600">{user.name}</span></h1>
            
            {/* JADUAL SECTION */}
            <div className="mb-12">
                 <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar size={20} className="text-emerald-600"/> Jadual Kelas Saya</h2>
                 <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {myActiveClasses.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">Tiada kelas berdaftar. Jadual kosong.</div>
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
                                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                                <span className="font-medium text-emerald-600">{cls.schedule || "Masa belum ditetapkan"}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0">
                                        <a href={cls.googleMeetLink} target="_blank" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
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
                    const cls = classes.find((c: ClassSession) => c.id === e.classId);
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
                                <a href={cls.googleMeetLink} target="_blank" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition shadow-sm">
                                    <Video size={18} /> Masuk Google Meet
                                </a>
                            ) : (
                                <button onClick={() => onPay(e.id)} className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 font-medium transition shadow-sm animate-pulse">
                                    <CreditCard size={18} /> Bayar Yuran
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
};

const InstructorDashboard = ({ user, classes, enrollments, onCreateClass }: any) => {
    // Determine which classes belong to this instructor.
    const myClasses = classes; // In this simple version, Ustaz sees all

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', price: '', link: '', description: '', schedule: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Pass instructorId automatically
        onCreateClass({ ...formData, instructorId: user.id });
        setShowForm(false);
        setFormData({ title: '', price: '', link: '', description: '', schedule: '' });
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><GraduationCap className="text-emerald-600"/> Dashboard Pengajar</h1>
                    <p className="text-gray-500 text-sm">Selamat datang, Ustaz {user.name}</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-emerald-700 transition shadow-sm">
                    {showForm ? <XCircle size={18}/> : <Plus size={18}/>} 
                    {showForm ? 'Batal' : 'Buka Kelas Baru'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-md border mb-8 animate-fade-in-up">
                    <h3 className="font-bold mb-4 text-lg border-b pb-2">Maklumat Kelas Baru</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Tajuk Kelas</label>
                            <input className="border w-full p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Contoh: Kelas Talaqqi" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Jadual / Masa</label>
                            <input className="border w-full p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Contoh: Isnin & Khamis, 9:00 Malam" value={formData.schedule} onChange={e=>setFormData({...formData, schedule: e.target.value})} required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Yuran (RM)</label>
                            <input className="border w-full p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="50" type="number" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} required/>
                        </div>
                        <div>
                             <label className="block text-sm font-medium mb-1">Google Meet Link</label>
                             <input className="border w-full p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://meet.google.com/..." value={formData.link} onChange={e=>setFormData({...formData, link: e.target.value})}/>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Penerangan</label>
                            <textarea className="border w-full p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none h-24" placeholder="Maklumat lanjut..." value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}/>
                        </div>
                        <button className="md:col-span-2 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition">Terbitkan Kelas</button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* My Classes List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BookOpen size={20} className="text-emerald-600"/> Kelas Anda</h3>
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
                                {myClasses.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-gray-500">Tiada kelas.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Students List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Users size={20} className="text-emerald-600"/> Senarai Pelajar</h3>
                    <div className="overflow-y-auto max-h-[400px]">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="p-3 text-left">ID Pelajar</th>
                                    <th className="p-3 text-left">Kelas Diambil</th>
                                    <th className="p-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map((e: any) => {
                                    // Find class name
                                    const cls = classes.find((c:any) => c.id === e.classId);
                                    return (
                                        <tr key={e.id} className="border-b">
                                            <td className="p-3 font-mono text-xs">{e.userId.substring(0,8)}...</td>
                                            <td className="p-3">{cls ? cls.title : 'Unknown'}</td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${e.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {enrollments.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-gray-500">Tiada pelajar berdaftar.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

const AdminDashboard = ({ classes, onCreateClass }: any) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', price: '', link: '', description: '', schedule: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreateClass(formData);
        setShowForm(false);
        setFormData({ title: '', price: '', link: '', description: '', schedule: '' });
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2"><Database className="text-emerald-600"/> Admin Dashboard</h1>
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
                            <label className="block text-sm font-medium mb-1">Jadual / Masa</label>
                            <input className="border w-full p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Contoh: Setiap Jumaat, 9:00 PM" value={formData.schedule} onChange={e=>setFormData({...formData, schedule: e.target.value})} required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Harga (RM)</label>
                            <input className="border w-full p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="50" type="number" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} required/>
                        </div>
                        <div>
                             <label className="block text-sm font-medium mb-1">Google Meet Link</label>
                             <input className="border w-full p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://meet.google.com/..." value={formData.link} onChange={e=>setFormData({...formData, link: e.target.value})}/>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Penerangan</label>
                            <textarea className="border w-full p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none h-24" placeholder="Maklumat lanjut mengenai kelas..." value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}/>
                        </div>
                        <button className="md:col-span-2 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition">Simpan ke Google Sheet</button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 text-left font-semibold text-gray-600">Kelas</th>
                            <th className="p-4 text-left font-semibold text-gray-600">Jadual</th>
                            <th className="p-4 text-left font-semibold text-gray-600">Harga</th>
                            <th className="p-4 text-left font-semibold text-gray-600">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-400">Tiada rekod kelas.</td></tr>
                        )}
                        {classes.map((c: any) => (
                            <tr key={c.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">{c.title}</td>
                                <td className="p-4 text-gray-500 text-sm">{c.schedule}</td>
                                <td className="p-4 text-emerald-600 font-bold">RM {c.price}</td>
                                <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold uppercase">Aktif</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const App = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Initial Load
  useEffect(() => {
    // Check local storage for simple persist
    const stored = localStorage.getItem('currentUser');
    if (stored) {
       try {
        const u = JSON.parse(stored);
        if (u) {
            // Normalize role on load safely
            const roleStr = u.role ? String(u.role).toLowerCase().trim() : 'student';
            // Simple check if role looks corrupted (digits)
            if (/^\d+$/.test(roleStr)) {
                // corrupted data found in local storage
                localStorage.removeItem('currentUser');
                return;
            }
            u.role = roleStr;
            setUser(u);
        }
       } catch(e) { 
           console.error("Storage corrupt", e);
           localStorage.removeItem('currentUser');
       }
    }
    fetchData();
  }, []);
  
  // Refresh data when user logs in to ensure dashboard is populated
  useEffect(() => {
      if(user) fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!GOOGLE_SCRIPT_URL) return;
    setLoading(true);
    setFetchError('');
    try {
        const data = await apiCall('getData');
        if (data.classes) setClasses(data.classes);
        if (data.enrollments) setEnrollments(data.enrollments);
    } catch (err: any) {
        console.error(err);
        setFetchError(err.message || "Gagal menghubungi database.");
    } finally {
        setLoading(false);
    }
  };

  const handleCreateClass = async (data: any) => {
      setLoading(true);
      try {
          await apiCall('createClass', data, 'POST');
          alert("Kelas berjaya ditambah!");
          fetchData(); // Refresh
      } catch (err: any) { alert(err.message); }
      finally { setLoading(false); }
  }

  const handleEnroll = async (classId: string) => {
      if(!user) return setIsAuthOpen(true);
      if (enrollments.some(e => e.userId === user.id && e.classId === classId)) {
          alert("Anda sudah mendaftar untuk kelas ini.");
          return;
      }
      setLoading(true);
      try {
          await apiCall('enroll', { userId: user.id, classId }, 'POST');
          alert("Berjaya daftar! Sila buat pembayaran di tab Kelas Saya.");
          fetchData();
      } catch(err: any) { alert(err.message); }
      finally { setLoading(false); }
  }

  const handlePay = async (enrollId: string) => {
      // Mock Payment for Google Sheet version: Confirm dialog acting as payment gateway
      if(confirm("Sahkan pembayaran manual (Demo)?\nKlik OK untuk menandakan sebagai 'Paid'.")) {
          setLoading(true);
          try {
             await apiCall('pay', { enrollId }, 'POST');
             alert("Pembayaran berjaya direkodkan!");
             fetchData();
          } catch(err: any) { alert(err.message); }
          finally { setLoading(false); }
      }
  }
  
  const renderDashboard = () => {
      if (!user) return <LandingPage classes={classes} onOpenAuth={() => setIsAuthOpen(true)} />;
      
      // Safe cast
      const role = user.role ? String(user.role).toLowerCase().trim() : 'student';
      
      if (role === 'admin') return <AdminDashboard classes={classes} onCreateClass={handleCreateClass} />;
      if (role === 'ustaz') return <InstructorDashboard user={user} classes={classes} enrollments={enrollments} onCreateClass={handleCreateClass} />;
      if (role === 'student') return <StudentPortal user={user} classes={classes} enrollments={enrollments} onEnroll={handleEnroll} onPay={handlePay} />;
      
      // Fallback if role is weird or corrupted data leaked through
      return (
          <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-8 rounded-xl inline-block max-w-lg">
                <AlertCircle size={48} className="mx-auto mb-4 text-yellow-600"/>
                <h3 className="text-xl font-bold mb-2">Akaun Ditemui, Tetapi Peranan Tidak Sah</h3>
                <p className="mb-4">Peranan anda direkodkan sebagai: <strong>'{user.role}'</strong>.</p>
                <p className="text-sm">Ini mungkin disebabkan oleh kerosakan data lama. Sila daftar semula atau hubungi admin.</p>
                <button onClick={() => { setUser(null); localStorage.removeItem('currentUser'); window.location.href='/'; }} className="mt-6 bg-yellow-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-yellow-700">Log Keluar & Daftar Semula</button>
            </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <Navbar user={user} onOpenAuth={() => setIsAuthOpen(true)} onLogout={() => { setUser(null); localStorage.removeItem('currentUser'); window.location.href='/'; }} />
      
      {loading && <div className="fixed top-20 right-4 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex gap-3 items-center z-[100] animate-bounce"><Loader2 className="animate-spin" size={20}/> Memproses data...</div>}
      
      {fetchError && (
          <div className="max-w-7xl mx-auto mt-4 px-4">
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-2"><AlertCircle size={20}/> {fetchError}</span>
                <button onClick={fetchData} className="bg-white border border-red-300 px-3 py-1 rounded hover:bg-red-50 text-sm flex items-center gap-1"><RefreshCw size={14}/> Cuba Lagi</button>
            </div>
          </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLogin={setUser} />

      {renderDashboard()}
    
      {/* Footer / Debug Info */}
      <div className="text-center py-8 text-gray-400 text-xs">
         <p>Powered by Google Apps Script Database</p>
         <p className="mt-1">Version 2.0 (No-SQL)</p>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);