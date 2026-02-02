import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
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
  Printer
} from 'lucide-react';

// --- Types & Interfaces ---

type UserRole = 'guest' | 'student' | 'admin' | 'ustaz';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface ClassSession {
  id: string;
  title: string;
  description: string;
  sessions: string[]; // Array of ISO date strings instead of single dateTime
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
  billCode?: string;
}

// --- Mock Data ---

const MOCK_INSTRUCTORS: Profile[] = [
  { id: 'i1', name: 'Ustaz Don Daniyal', email: 'don@nurquran.com', role: 'ustaz' },
  { id: 'i2', name: 'Ustazah Aminah', email: 'aminah@nurquran.com', role: 'ustaz' },
  { id: 'i3', name: 'Ustaz Azhar Idrus', email: 'azhar@nurquran.com', role: 'ustaz' },
  { id: 'i4', name: 'Syeikh Abdul Karim', email: 'karim@nurquran.com', role: 'ustaz' },
];

const INITIAL_CLASSES: ClassSession[] = [
  {
    id: 'c1',
    title: 'Talaqqi & Tadabbur Juz 30 (Nov Intake)',
    description: 'Selami makna Juz Amma dengan pembetulan Tajwid yang tepat. Pakej 4 Sesi bulanan.',
    sessions: [
        '2023-11-04T20:30:00',
        '2023-11-11T20:30:00',
        '2023-11-18T20:30:00',
        '2023-11-25T20:30:00',
    ],
    price: 120,
    googleMeetLink: 'https://meet.google.com/abc-defg-hij',
    isActive: true,
    type: 'monthly',
    instructorId: 'i1',
    instructorName: 'Ustaz Don Daniyal'
  },
  {
    id: 'c2',
    title: 'Seminar Fardu Ain: Solat Sempurna',
    description: 'Seminar khas sehari memfokuskan kepada sah batal solat dan bacaan dalam solat.',
    sessions: ['2023-11-28T21:00:00'],
    price: 30,
    googleMeetLink: 'https://meet.google.com/xyz-wxyz-abc',
    isActive: true,
    type: 'single',
    instructorId: 'i2',
    instructorName: 'Ustazah Aminah'
  },
  {
    id: 'c3',
    title: 'Asas Bahasa Arab Al-Quran',
    description: 'Pelajari kosa kata asas Al-Quran untuk membantu pemahaman ketika membaca.',
    sessions: [
        '2023-12-01T20:30:00',
        '2023-12-08T20:30:00',
        '2023-12-15T20:30:00',
        '2023-12-22T20:30:00',
    ],
    price: 100,
    googleMeetLink: 'https://meet.google.com/arb-class-room',
    isActive: true,
    type: 'monthly',
    instructorId: 'i4',
    instructorName: 'Syeikh Abdul Karim'
  }
];

const MOCK_USER: Profile = {
  id: 'u1',
  name: 'Ahmad Albab',
  email: 'ahmad@example.com',
  role: 'student'
};

const MOCK_ADMIN: Profile = {
  id: 'admin1',
  name: 'Admin Utama',
  email: 'admin@quranclass.com',
  role: 'admin'
};

// --- Components ---

const Navbar = ({ user, onLogin, onLogout }: { user: Profile | null, onLogin: (role: UserRole) => void, onLogout: () => void }) => (
  <nav className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50 print:hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => !user && window.location.reload()}>
          <BookOpen className="h-8 w-8 text-emerald-400" />
          <span className="font-bold text-xl font-arabic tracking-wider">Nur Al-Quran</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm bg-emerald-800 py-1 px-3 rounded-full">
                <User size={16} />
                <span>{user.name} ({user.role})</span>
              </div>
              <button onClick={onLogout} className="text-emerald-100 hover:text-white p-2">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => onLogin('student')}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-md text-sm font-medium transition"
              >
                Masuk Pelajar
              </button>
              <button 
                onClick={() => onLogin('admin')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-sm font-medium transition"
              >
                Admin
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </nav>
);

const LandingPage = ({ classes, onLogin }: { classes: ClassSession[], onLogin: (role: UserRole) => void }) => {
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
                onClick={() => onLogin('student')}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                Mula Belajar Sekarang <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition backdrop-blur-sm border border-white/10">
                Lihat Jadual Kelas
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
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow">
                 <div className="bg-green-100 p-2 rounded-full text-green-600">
                    <Users size={24} />
                 </div>
                 <div>
                    <div className="font-bold text-gray-900">1,200+</div>
                    <div className="text-xs text-gray-500">Pelajar Aktif</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Video size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Kelas Secara Langsung</h3>
                <p className="text-gray-600">Interaksi dua hala bersama guru melalui Google Meet. Tanya soalan dan perbaiki bacaan serta-merta.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 hover:shadow-md transition">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Guru Terlatih</h3>
                <p className="text-gray-600">Kesemua tenaga pengajar kami mempunyai sanad dan tauliah mengajar yang diiktiraf.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 hover:shadow-md transition">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <PlayCircle size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Rakaman Sesi</h3>
                <p className="text-gray-600">Terlepas kelas? Jangan risau, rakaman setiap sesi disediakan untuk ulang kaji bila-bila masa.</p>
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
            {highlightedClasses.map(cls => (
              <div key={cls.id} className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
                 {/* Badge */}
                 <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full z-10">
                    {cls.type === 'monthly' ? 'Pakej Bulanan' : 'Sesi Khas'}
                 </div>

                 <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <BookOpen size={48} className="text-emerald-800/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-6 text-white font-bold text-xl shadow-black drop-shadow-md">
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
                       <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <Calendar size={16} className="text-emerald-500"/>
                          <span>Mula: {new Date(cls.sessions[0]).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long' })}</span>
                       </div>
                       
                       <button 
                         onClick={() => onLogin('student')}
                         className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
                       >
                         Daftar Sekarang <ArrowRight size={16} />
                       </button>
                    </div>
                 </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button 
               onClick={() => onLogin('student')}
               className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 transition"
            >
               Lihat Semua Kelas <ArrowRight size={16} className="ml-2"/>
            </button>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-slate-900 py-12 text-center">
         <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 font-arabic">"Sebaik-baik kamu adalah orang yang belajar Al-Quran dan mengajarkannya."</h2>
            <button 
               onClick={() => onLogin('student')}
               className="px-8 py-3 bg-white text-emerald-900 font-bold rounded-full hover:bg-emerald-50 transition"
            >
               Sertai Kami Hari Ini
            </button>
         </div>
      </div>
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
  onCreateClass: (c: ClassSession) => void 
}) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'schedules'>('dashboard');
  const [showForm, setShowForm] = useState(false);
  
  // Schedule View State
  const [selectedInstructorId, setSelectedInstructorId] = useState('');

  // Form State
  const [classType, setClassType] = useState<'single' | 'monthly'>('single');
  const [formData, setFormData] = useState({
    title: '', 
    description: '', 
    startDate: '', // Used to generate sessions
    price: '', 
    googleMeetLink: '',
    instructorId: ''
  });

  const totalRevenue = enrollments
    .filter(e => e.status === 'Paid')
    .reduce((acc, curr) => {
      const cls = classes.find(c => c.id === curr.classId);
      return acc + (cls ? cls.price : 0);
    }, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.instructorId) return;
    
    // Logic to generate dates
    const sessions: string[] = [];
    const start = new Date(formData.startDate);

    if (classType === 'single') {
        sessions.push(start.toISOString());
    } else {
        // Generate 4 weeks
        for (let i = 0; i < 4; i++) {
            const nextDate = new Date(start);
            nextDate.setDate(start.getDate() + (i * 7)); // Add 7 days per iteration
            sessions.push(nextDate.toISOString());
        }
    }

    const instructor = MOCK_INSTRUCTORS.find(i => i.id === formData.instructorId);
    
    onCreateClass({
      id: Math.random().toString(36).substr(2, 9),
      isActive: true,
      title: formData.title,
      description: formData.description || '',
      sessions: sessions,
      price: Number(formData.price) || 0,
      googleMeetLink: formData.googleMeetLink || '',
      type: classType,
      instructorId: instructor?.id || '',
      instructorName: instructor?.name || 'Unknown'
    });

    setShowForm(false);
    setFormData({ title: '', description: '', startDate: '', price: '', googleMeetLink: '', instructorId: '' });
  };

  // Instructor Schedule Filtering Logic
  const getInstructorSchedule = () => {
    if (!selectedInstructorId) return [];
    
    // Find all classes by this instructor
    const instructorClasses = classes.filter(c => c.instructorId === selectedInstructorId);
    
    // Flatten into individual sessions
    const sessions = instructorClasses.flatMap(c => 
      c.sessions.map((date, idx) => ({
        classTitle: c.title,
        date: new Date(date),
        link: c.googleMeetLink,
        status: c.isActive,
        type: c.type,
        sessionNumber: idx + 1,
        totalSessions: c.sessions.length
      }))
    );
    
    // Sort by date
    return sessions.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const selectedInstructorName = MOCK_INSTRUCTORS.find(i => i.id === selectedInstructorId)?.name;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Inject Print Styles */}
      <style>{`
        @media print {
          @page { margin: 1cm; size: portrait; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background-color: white !important; }
        }
      `}</style>

      {/* Admin Header - Hidden on Print */}
      <div className="flex justify-between items-center mb-8 no-print">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <LayoutDashboard className="text-emerald-600" /> Admin Dashboard
        </h1>
        <div className="flex gap-2">
          <button 
             onClick={() => setActiveView('schedules')}
             className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeView === 'schedules' ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
             <FileText size={20} /> Jadual Pengajar
          </button>
          <button 
             onClick={() => setActiveView('dashboard')}
             className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeView === 'dashboard' ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
             <LayoutDashboard size={20} /> Kelas & Pelajar
          </button>
        </div>
      </div>

      {activeView === 'dashboard' ? (
        <div className="no-print">
            {/* Dashboard Actions */}
            <div className="flex justify-end mb-6">
                <button 
                onClick={() => setShowForm(!showForm)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                >
                <Plus size={20} /> Tambah Kelas
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
                <div className="text-sm text-gray-500 mb-1">Kelas Aktif</div>
                <div className="text-3xl font-bold text-gray-800">{classes.length}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
                <div className="text-sm text-gray-500 mb-1">Jumlah Pelajar</div>
                <div className="text-3xl font-bold text-gray-800">{enrollments.length}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
                <div className="text-sm text-gray-500 mb-1">Jumlah Kutipan (RM)</div>
                <div className="text-3xl font-bold text-emerald-600">{totalRevenue.toFixed(2)}</div>
                </div>
            </div>

            {/* Create Class Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8 animate-fade-in-down">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold">Cipta Kelas Baru</h3>
                    <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={20}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Class Type Toggle */}
                    <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Struktur Kelas</label>
                    <div className="flex gap-4">
                        <label className={`flex-1 border rounded-lg p-3 cursor-pointer transition ${classType === 'single' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'hover:bg-gray-50'}`}>
                        <input 
                            type="radio" 
                            name="type" 
                            className="hidden" 
                            checked={classType === 'single'} 
                            onChange={() => setClassType('single')} 
                        />
                        <div className="flex items-center gap-2 font-semibold text-gray-900">
                            <Clock size={18} /> Sesi Tunggal (Seminar)
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Kelas sekali sahaja.</div>
                        </label>
                        
                        <label className={`flex-1 border rounded-lg p-3 cursor-pointer transition ${classType === 'monthly' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'hover:bg-gray-50'}`}>
                        <input 
                            type="radio" 
                            name="type" 
                            className="hidden" 
                            checked={classType === 'monthly'} 
                            onChange={() => setClassType('monthly')} 
                        />
                        <div className="flex items-center gap-2 font-semibold text-gray-900">
                            <Repeat size={18} /> Pakej Bulanan (4 Minggu)
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Automatik jana 4 sesi mingguan.</div>
                        </label>
                    </div>
                    </div>

                    <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Tajuk Kelas</label>
                    <input 
                        type="text" 
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                    </div>
                    
                    <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                    <textarea 
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700">Lantik Pengajar (Ustaz/Ustazah)</label>
                    <select
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={formData.instructorId}
                        onChange={e => setFormData({...formData, instructorId: e.target.value})}
                    >
                        <option value="">Pilih Pengajar</option>
                        {MOCK_INSTRUCTORS.map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                        ))}
                    </select>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700">Yuran (RM)</label>
                    <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700">
                        {classType === 'monthly' ? 'Tarikh & Masa Mula (Kelas Pertama)' : 'Tarikh & Masa'}
                    </label>
                    <input 
                        type="datetime-local" 
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={formData.startDate}
                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                    />
                    {classType === 'monthly' && formData.startDate && (
                        <p className="text-xs text-emerald-600 mt-1">
                            Sistem akan menjana 4 sesi bermula tarikh ini.
                        </p>
                    )}
                    </div>

                    <div className="">
                    <label className="block text-sm font-medium text-gray-700">Pautan Google Meet</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        https://
                        </span>
                        <input 
                        type="text" 
                        placeholder="meet.google.com/..."
                        className="flex-1 block w-full rounded-none rounded-r-md border border-gray-300 p-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={formData.googleMeetLink}
                        onChange={e => setFormData({...formData, googleMeetLink: e.target.value})}
                        />
                    </div>
                    </div>

                    <div className="col-span-2 flex justify-end gap-2 mt-4 pt-4 border-t">
                    <button 
                        type="button" 
                        onClick={() => setShowForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Batal
                    </button>
                    <button 
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                    >
                        Cipta Kelas
                    </button>
                    </div>
                </form>
                </div>
            )}

            {/* Classes List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-700">Senarai Kelas</h3>
                </div>
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info Kelas</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengajar</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jadual</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendaftaran</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {classes.map(cls => (
                        <tr key={cls.id}>
                        <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{cls.title}</div>
                            <div className="text-xs text-gray-500">{cls.type === 'monthly' ? 'Pakej Bulanan' : 'Sesi Khas'}</div>
                            <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">{cls.googleMeetLink}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-emerald-600"/>
                                {cls.instructorName}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Calendar size={14}/> 
                                {new Date(cls.sessions[0]).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                {cls.sessions.length} Sesi Total
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {enrollments.filter(e => e.classId === cls.id && e.status === 'Paid').length} Pelajar
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cls.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {cls.isActive ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
      ) : (
        /* Schedule Generator View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[500px]">
            {/* Control Panel (Hidden on Print) */}
            <div className="no-print mb-8 pb-8 border-b border-gray-100">
                <div className="max-w-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Pengajar untuk Menjana Jadual</label>
                    <div className="flex gap-4">
                        <select
                            className="block w-full rounded-md border border-gray-300 p-2 focus:ring-emerald-500 focus:border-emerald-500"
                            value={selectedInstructorId}
                            onChange={(e) => setSelectedInstructorId(e.target.value)}
                        >
                            <option value="">-- Pilih Ustaz / Ustazah --</option>
                            {MOCK_INSTRUCTORS.map(inst => (
                                <option key={inst.id} value={inst.id}>{inst.name}</option>
                            ))}
                        </select>
                        <button 
                           onClick={handlePrint}
                           disabled={!selectedInstructorId}
                           className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                        >
                           <Printer size={20} /> Cetak / Muat Turun PDF
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Pilih pengajar, kemudian klik butang "Cetak / Muat Turun". Dalam tetingkap cetakan, pilih "Save as PDF" untuk menyimpan fail.
                    </p>
                </div>
            </div>

            {/* Printable Area */}
            {selectedInstructorId ? (
                <div id="print-area">
                    <div className="text-center mb-8 pb-4 border-b-2 border-emerald-800">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <BookOpen className="text-emerald-800" size={32} />
                            <h2 className="text-3xl font-bold font-arabic text-emerald-900">Nur Al-Quran</h2>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Jadual Pengajaran</h1>
                        <p className="text-lg text-gray-600 mt-1">Pengajar: <span className="font-bold text-gray-900">{selectedInstructorName}</span></p>
                        <p className="text-sm text-gray-400 mt-1">Dijana pada: {new Date().toLocaleDateString('ms-MY')}</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-300 text-left">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="py-3.5 pl-4 pr-3 text-sm font-semibold text-gray-900">Tarikh</th>
                                    <th className="px-3 py-3.5 text-sm font-semibold text-gray-900">Masa</th>
                                    <th className="px-3 py-3.5 text-sm font-semibold text-gray-900">Kelas / Topik</th>
                                    <th className="px-3 py-3.5 text-sm font-semibold text-gray-900">Info Sesi</th>
                                    <th className="px-3 py-3.5 text-sm font-semibold text-gray-900">Pautan (GMeet)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {getInstructorSchedule().length > 0 ? (
                                    getInstructorSchedule().map((session, idx) => (
                                        <tr key={idx}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                {session.date.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                <div className="text-xs text-gray-500 font-normal">
                                                    {session.date.toLocaleDateString('ms-MY', { weekday: 'long' })}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                                {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-700">
                                                <div className="font-medium">{session.classTitle}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {session.type === 'monthly' ? (
                                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                        Sesi {session.sessionNumber} / {session.totalSessions}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                                                        Sesi Khas
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-4 text-sm text-blue-600 underline">
                                                {session.link}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500 italic">
                                            Tiada kelas aktif ditemui untuk pengajar ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
                        <p>© Nur Al-Quran Centre. Dokumen ini adalah sulit dan untuk kegunaan dalaman sahaja.</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <FileText size={48} className="mb-4 opacity-50" />
                    <p>Sila pilih pengajar di atas untuk memaparkan jadual.</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState<'browse' | 'my-classes' | 'schedule'>('browse');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

  const handlePay = async (enrollmentId: string) => {
    setProcessingId(enrollmentId);
    // Simulate API call and redirect
    await new Promise(r => setTimeout(r, 2000)); 
    onPay(enrollmentId);
    setProcessingId(null);
    alert("Bayaran Berjaya! Akses diberikan.");
  };

  const toggleExpand = (id: string) => {
    setExpandedClassId(expandedClassId === id ? null : id);
  }

  const myEnrollments = enrollments.filter(e => e.userId === user.id);
  const myClassIds = myEnrollments.map(e => e.classId);

  // --- Schedule Logic ---
  const paidEnrollments = myEnrollments.filter(e => e.status === 'Paid');
  const paidClassIds = paidEnrollments.map(e => e.classId);
  
  const scheduleSessions = classes
    .filter(c => paidClassIds.includes(c.id))
    .flatMap(c => c.sessions.map((date, idx) => ({
      classId: c.id,
      title: c.title,
      instructor: c.instructorName,
      date: new Date(date),
      link: c.googleMeetLink,
      sessionIndex: idx + 1,
      totalSessions: c.sessions.length
    })))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const upcomingSessions = scheduleSessions.filter(s => s.date >= new Date(Date.now() - 2 * 60 * 60 * 1000)); 
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-8 mb-8 text-white flex flex-col md:flex-row justify-between items-center shadow-lg">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-arabic">Assalamu'alaikum, {user.name}</h1>
          <p className="text-emerald-100">Semoga istiqomah dalam menuntut ilmu.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
           <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
             <div className="text-2xl font-bold">{myEnrollments.filter(e => e.status === 'Paid').length}</div>
             <div className="text-xs text-emerald-100 uppercase tracking-wider">Kelas Aktif</div>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('browse')}
          className={`pb-4 px-6 font-medium text-sm transition-colors relative whitespace-nowrap ${
            activeTab === 'browse' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Senarai Kelas
          {activeTab === 'browse' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
        </button>
        <button
          onClick={() => setActiveTab('my-classes')}
          className={`pb-4 px-6 font-medium text-sm transition-colors relative whitespace-nowrap ${
            activeTab === 'my-classes' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pendaftaran Saya
          {activeTab === 'my-classes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-4 px-6 font-medium text-sm transition-colors relative whitespace-nowrap ${
            activeTab === 'schedule' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Jadual Saya
          {activeTab === 'schedule' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
        </button>
      </div>

      {activeTab === 'browse' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => {
            const isEnrolled = myClassIds.includes(cls.id);
            const startDate = new Date(cls.sessions[0]);
            
            return (
              <div key={cls.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{cls.title}</h3>
                    <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-md font-medium">
                      RM {cls.price}
                    </span>
                  </div>
                  <div className="mb-4 space-y-2">
                     <span className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-1 rounded border ${cls.type === 'monthly' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        {cls.type === 'monthly' ? 'Pakej Bulanan (4 Sesi)' : 'Sesi Khas'}
                     </span>
                     <div className="flex items-center gap-2 text-sm text-gray-500">
                        <GraduationCap size={16} className="text-emerald-600"/>
                        <span className="font-medium text-gray-700">{cls.instructorName}</span>
                     </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{cls.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={16} className="text-emerald-600"/>
                        <span className="font-medium">Mula: {startDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={16} className="text-emerald-600"/>
                        <span>{startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0 mt-auto">
                  {isEnrolled ? (
                    <button disabled className="w-full bg-gray-100 text-gray-500 py-2 rounded-lg font-medium cursor-not-allowed">
                      Telah Mendaftar
                    </button>
                  ) : (
                    <button 
                      onClick={() => onEnroll(cls.id)}
                      className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition flex justify-center items-center gap-2"
                    >
                      Daftar Sekarang
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : activeTab === 'my-classes' ? (
        <div className="space-y-4">
          {myEnrollments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p>Anda belum mendaftar sebarang kelas.</p>
            </div>
          )}
          {myEnrollments.map(enrollment => {
            const cls = classes.find(c => c.id === enrollment.classId);
            if (!cls) return null;
            
            const isExpanded = expandedClassId === enrollment.id;

            return (
              <div key={enrollment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-gray-900">{cls.title}</h3>
                        {enrollment.status === 'Paid' ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle size={12} /> Berjaya
                        </span>
                        ) : (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock size={12} /> Menunggu Bayaran
                        </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                        <GraduationCap size={16} className="text-emerald-600"/>
                        {cls.instructorName}
                    </div>
                    <div className="text-sm text-gray-500">
                        {cls.sessions.length} Sesi • Mula {new Date(cls.sessions[0]).toLocaleDateString()}
                    </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                    {enrollment.status === 'Paid' ? (
                        <div className="flex gap-2 w-full md:w-auto">
                            <a 
                                href={cls.googleMeetLink} 
                                target="_blank" 
                                rel="noreferrer"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"
                            >
                                <Video size={16} /> Masuk Kelas
                            </a>
                            <button 
                                onClick={() => toggleExpand(enrollment.id)}
                                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition flex items-center"
                            >
                                {isExpanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                            </button>
                        </div>
                    ) : (
                        <button 
                        onClick={() => handlePay(enrollment.id)}
                        disabled={processingId === enrollment.id}
                        className="w-full md:w-auto bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                        {processingId === enrollment.id ? (
                            <span className="animate-pulse">Memproses...</span>
                        ) : (
                            <>Bayar RM {cls.price} (ToyyibPay)</>
                        )}
                        </button>
                    )}
                    </div>
                </div>
                
                {/* Expanded Schedule View */}
                {isExpanded && enrollment.status === 'Paid' && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Jadual Kelas</h4>
                        <div className="grid gap-2">
                            {cls.sessions.map((sessionDate, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200 text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-100 text-emerald-800 font-bold w-8 h-8 rounded-full flex items-center justify-center text-xs">
                                            {idx + 1}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">
                                                {new Date(sessionDate).toLocaleDateString('ms-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                            <span className="text-gray-500">
                                                {new Date(sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-gray-400">
                                        {new Date(sessionDate) < new Date() ? (
                                            <span className="text-gray-400 text-xs italic">Selesai</span>
                                        ) : (
                                            <span className="text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-1 rounded">Akan Datang</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Schedule Tab View */
        <div className="space-y-6">
           {upcomingSessions.length === 0 ? (
               <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                  <CalendarDays className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900">Tiada Kelas Akan Datang</h3>
                  <p className="text-gray-500">Anda tiada kelas dalam masa terdekat atau belum mendaftar.</p>
               </div>
           ) : (
               <>
                <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                    <CalendarDays className="text-emerald-600" /> Jadual Akan Datang
                </h3>
                <div className="relative border-l-2 border-emerald-100 ml-3 space-y-8 pb-4">
                    {upcomingSessions.map((session, idx) => (
                        <div key={idx} className="relative pl-8">
                            {/* Timeline Dot */}
                            <div className="absolute -left-2.5 top-0 w-5 h-5 bg-white border-2 border-emerald-500 rounded-full"></div>
                            
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold uppercase tracking-wider mb-1">
                                            {session.date.toLocaleDateString('ms-MY', { weekday: 'long' })}
                                            <span className="text-gray-300">•</span>
                                            {session.date.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long' })}
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-1">{session.title}</h4>
                                        <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} className="text-emerald-500" />
                                                {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <GraduationCap size={14} className="text-emerald-500" />
                                                {session.instructor}
                                            </span>
                                            <span className="flex items-center gap-1 bg-gray-100 px-2 rounded-full text-xs">
                                                Sesi {session.sessionIndex}/{session.totalSessions}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        {/* If class is within 15 mins or active */}
                                        <a 
                                            href={session.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition w-full md:w-auto"
                                        >
                                            <Video size={18} /> Masuk Kelas
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
               </>
           )}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [classes, setClasses] = useState<ClassSession[]>(INITIAL_CLASSES);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  // Simulate Cloudflare Function: create-bill
  const handleEnroll = (classId: string) => {
    if (!currentUser) {
      alert("Sila log masuk dahulu untuk mendaftar.");
      return;
    }
    const newEnrollment: Enrollment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      classId,
      status: 'Unpaid'
    };
    setEnrollments([...enrollments, newEnrollment]);
    alert("Pendaftaran berjaya dicipta. Sila buat bayaran di tab 'Pendaftaran Saya'.");
  };

  // Simulate Cloudflare Function: webhook
  const handlePay = (enrollmentId: string) => {
    setEnrollments(prev => prev.map(e => 
      e.id === enrollmentId 
        ? { ...e, status: 'Paid', transactionId: 'TXN_' + Math.floor(Math.random() * 100000) } 
        : e
    ));
  };

  const handleCreateClass = (newClass: ClassSession) => {
    setClasses([newClass, ...classes]);
  };

  const handleLogin = (role: UserRole) => {
    setCurrentUser(role === 'admin' ? MOCK_ADMIN : MOCK_USER);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar 
        user={currentUser} 
        onLogin={handleLogin} 
        onLogout={() => setCurrentUser(null)} 
      />
      
      <main className="flex-1">
        {!currentUser ? (
          <LandingPage classes={classes} onLogin={handleLogin} />
        ) : currentUser.role === 'admin' ? (
          <AdminDashboard 
            classes={classes} 
            enrollments={enrollments} 
            onCreateClass={handleCreateClass} 
          />
        ) : (
          <StudentPortal 
            user={currentUser} 
            classes={classes} 
            enrollments={enrollments}
            onEnroll={handleEnroll}
            onPay={handlePay}
          />
        )}
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);