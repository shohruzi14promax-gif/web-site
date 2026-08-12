import { useState, useEffect } from 'react';
import { 
  Users, Image as ImageIcon, Video, Bell, Cake, Trophy, 
  MessageSquare, Trash2, Plus, LogOut, ShieldCheck, X, Upload, Rocket, BarChart3, HeartHandshake, Lock 
} from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  // Parol holati (Parolni shu yerda o'zingiz xohlagancha o'zgartirishingiz mumkin, masalan: '2026')
  const ADMIN_PASSWORD = '2026';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [activeTab, setActiveTab] = useState('school_stats');

  const [teachers, setTeachers] = useState<any[]>([]);
  const [administration, setAdministration] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [galleryList, setGalleryList] = useState<any[]>([]);
  const [videoLessons, setVideoLessons] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [gpaList, setGpaList] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  const [socialStats, setSocialStats] = useState([
    { value: 200100, suffix: "+", label: "Aksiya qatnashchilari" },
    { value: 15, suffix: " ta", label: "Maxsus loyihalar" },
    { value: 100, suffix: "%", label: "Ochiq portal" },
    { value: 1, suffix: "-o'rin", label: "Grant yutuqlari" }
  ]);
  const [awardText, setAwardText] = useState('"Yilning eng faol maktabi" — Jizzax viloyati, 2026');

  const [schoolStats, setSchoolStats] = useState([
    { value: 450, suffix: "+", label: "O'quvchilar" },
    { value: 48, suffix: "", label: "O'qituvchilar" },
    { value: 5, suffix: "", label: "Chuqurlashtirilgan fanlar" },
    { value: 23, suffix: "", label: "Yutuqlar (2024)" },
    { value: 120, suffix: "+", label: "Birinchi bitiruvchilar" },
    { value: 94, suffix: "%", label: "Oliy o'quv muassasalariga kirish" }
  ]);

  useEffect(() => {
    if (!isAuthenticated) return;

    setTeachers(JSON.parse(localStorage.getItem('teachers') || '[]'));
    setAdministration(JSON.parse(localStorage.getItem('administration') || '[]'));
    setProjects(JSON.parse(localStorage.getItem('projects') || '[]'));
    setGalleryList(JSON.parse(localStorage.getItem('galleryList') || '[]'));
    setVideoLessons(JSON.parse(localStorage.getItem('videoLessons') || '[]'));
    setAnnouncements(JSON.parse(localStorage.getItem('announcements') || '[]'));
    setBirthdays(JSON.parse(localStorage.getItem('birthdays') || '[]'));
    setGpaList(JSON.parse(localStorage.getItem('gpaList') || '[]'));
    
    const savedSchool = localStorage.getItem('schoolStats');
    if (savedSchool) {
      try { 
        const parsed = JSON.parse(savedSchool);
        if (Array.isArray(parsed) && parsed.length > 0) setSchoolStats(parsed);
      } catch (e) {}
    }

    const savedSocial = localStorage.getItem('socialStats');
    if (savedSocial) {
      try {
        const parsedS = JSON.parse(savedSocial);
        if (Array.isArray(parsedS)) setSocialStats(parsedS);
      } catch (e) {}
    }

    const savedAward = localStorage.getItem('awardText');
    if (savedAward) setAwardText(savedAward);

    const loadedMessages = JSON.parse(localStorage.getItem('student_proposals') || '[]');
    setMessages(loadedMessages);
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Parol noto‘g‘ri! Qaytadan urinib ko‘ring.');
    }
  };

  // --- Agar parol kiritilmagan bo'lsa, faqat Parol oynasini ko'rsatish ---
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 relative">
          <button onClick={onClose} className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 rounded-full transition cursor-pointer">
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 text-[#0071e3] flex items-center justify-center mb-3 shadow-inner">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-[#1d1d1f]">Admin Panel</h2>
            <p className="text-xs text-gray-500 mt-1">Davom etish uchun maxfiy parolni kiriting</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                placeholder="Parolni kiriting..." 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0071e3] transition"
                autoFocus
              />
              {errorMsg && <p className="text-xs text-red-500 mt-1.5 font-medium">{errorMsg}</p>}
            </div>

            <button 
              type="submit" 
              className="w-full py-3 bg-[#0071e3] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 cursor-pointer"
            >
              Kirish
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Parol to'g'ri bo'lsa ochiladigan asosiy Admin Panel kodi ---
  const saveData = (key: string, data: any[], setter: Function) => {
    setter(data);
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const formatYouTubeUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('embed')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  const handleSchoolStatChange = (index: number, field: string, value: any) => {
    const updated = [...schoolStats];
    updated[index] = {
      ...updated[index],
      [field]: field === 'value' ? Number(value) : value
    };
    setSchoolStats(updated);
    localStorage.setItem('schoolStats', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('schoolStatsUpdated'));
  };

  const handleAddSchoolItem = () => {
    const updated = [...schoolStats, { value: 50, suffix: "+", label: "Yangi ko'rsatkich" }];
    setSchoolStats(updated);
    localStorage.setItem('schoolStats', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('schoolStatsUpdated'));
  };

  const handleDeleteSchoolItem = (index: number) => {
    const updated = schoolStats.filter((_, idx) => idx !== index);
    setSchoolStats(updated);
    localStorage.setItem('schoolStats', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('schoolStatsUpdated'));
  };

  const handleSocialStatChange = (index: number, field: string, value: any) => {
    const updated = [...socialStats];
    updated[index] = {
      ...updated[index],
      [field]: field === 'value' ? Number(value) : value
    };
    setSocialStats(updated);
    localStorage.setItem('socialStats', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleAwardTextChange = (text: string) => {
    setAwardText(text);
    localStorage.setItem('awardText', text);
    window.dispatchEvent(new Event('storage'));
  };

  const [newTeacher, setNewTeacher] = useState({ name: '', role: '', image: '' });
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name.trim()) return;
    saveData('teachers', [...teachers, { id: Date.now(), ...newTeacher }], setTeachers);
    setNewTeacher({ name: '', role: '', image: '' });
  };
  const handleDeleteTeacher = (id: number) => saveData('teachers', teachers.filter(t => t.id !== id), setTeachers);

  const [newAdmin, setNewAdmin] = useState({ name: '', position: '', reception: '', phone: '', image: '' });
  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.name.trim()) return;
    saveData('administration', [...administration, { id: Date.now(), ...newAdmin, role: newAdmin.position }], setAdministration);
    setNewAdmin({ name: '', position: '', reception: '', phone: '', image: '' });
  };
  const handleDeleteAdmin = (id: number) => saveData('administration', administration.filter(a => a.id !== id), setAdministration);

  const [newProject, setNewProject] = useState({ title: '', description: '', features: '', image: '' });
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;
    saveData('projects', [...projects, { id: Date.now(), year: '2026', category: 'Innovatsiya', ...newProject }], setProjects);
    setNewProject({ title: '', description: '', features: '', image: '' });
  };
  const handleDeleteProject = (id: number) => saveData('projects', projects.filter(p => p.id !== id), setProjects);

  const [newGallery, setNewGallery] = useState({ title: '', category: '', image: '' });
  const handleAddGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGallery.title.trim()) return;
    saveData('galleryList', [...galleryList, { id: Date.now(), ...newGallery }], setGalleryList);
    setNewGallery({ title: '', category: '', image: '' });
  };
  const handleDeleteGallery = (id: number) => saveData('galleryList', galleryList.filter(g => g.id !== id), setGalleryList);

  const [newVideo, setNewVideo] = useState({ title: '', subject: '', url: '', duration: '' });
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.title.trim() || !newVideo.url.trim()) return;
    saveData('videoLessons', [...videoLessons, { id: Date.now(), ...newVideo, url: formatYouTubeUrl(newVideo.url) }], setVideoLessons);
    setNewVideo({ title: '', subject: '', url: '', duration: '' });
  };
  const handleDeleteVideo = (id: number) => saveData('videoLessons', videoLessons.filter(v => v.id !== id), setVideoLessons);

  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', date: '', content: '' });
  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim()) return;
    saveData('announcements', [...announcements, { id: Date.now(), ...newAnnouncement }], setAnnouncements);
    setNewAnnouncement({ title: '', date: '', content: '' });
  };
  const handleDeleteAnnouncement = (id: number) => saveData('announcements', announcements.filter(a => a.id !== id), setAnnouncements);

  const [newBirthday, setNewBirthday] = useState({ name: '', date: '', class: '' });
  const handleAddBirthday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBirthday.name.trim()) return;
    saveData('birthdays', [...birthdays, { id: Date.now(), ...newBirthday }], setBirthdays);
    setNewBirthday({ name: '', date: '', class: '' });
  };
  const handleDeleteBirthday = (id: number) => saveData('birthdays', birthdays.filter(b => b.id !== id), setBirthdays);

  const [newGpa, setNewGpa] = useState({ name: '', class: '', gpa: '' });
  const handleAddGpa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGpa.name.trim()) return;
    saveData('gpaList', [...gpaList, { id: Date.now(), ...newGpa }], setGpaList);
    setNewGpa({ name: '', class: '', gpa: '' });
  };
  const handleDeleteGpa = (id: number) => saveData('gpaList', gpaList.filter(g => g.id !== id), setGpaList);

  const handleDeleteMessage = (id: number) => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    localStorage.setItem('student_proposals', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f7] flex overflow-hidden">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 text-[#0071e3] flex items-center justify-center font-bold">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-bold text-[#1d1d1f] text-sm">Admin Panel</h1>
                <p className="text-xs text-gray-400">Jizzax 1-son IMI</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {[
              { id: 'school_stats', label: "O'quvchilar Statistikasi", icon: BarChart3 },
              { id: 'social_stats', label: "Ijtimoiy Aksiyalar", icon: HeartHandshake },
              { id: 'teachers', label: "O'qituvchilar", icon: Users },
              { id: 'administration', label: "Ma'muriyat", icon: ShieldCheck },
              { id: 'projects', label: "Innovatsiya", icon: Rocket },
              { id: 'gallery', label: 'Galereya', icon: ImageIcon },
              { id: 'videos', label: 'Video Darslar', icon: Video },
              { id: 'announcements', label: "E'lonlar", icon: Bell },
              { id: 'birthdays', label: "Tug'ilgan kunlar", icon: Cake },
              { id: 'gpa', label: 'GPA Reytingi', icon: Trophy },
              { id: 'messages', label: 'Murojaatlar', icon: MessageSquare, badge: messages.length },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                    activeTab === item.id ? 'bg-[#0071e3] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-left">{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === item.id ? 'bg-white text-[#0071e3]' : 'bg-blue-50 text-[#0071e3]'}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition cursor-pointer">
            <LogOut className="h-5 w-5" />
            <span>Chiqish (Qulflash)</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto max-h-screen relative">
        <div className="flex md:hidden justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm">
          <h1 className="font-bold text-[#1d1d1f]">Admin Panel</h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-red-600 text-sm font-medium cursor-pointer">Chiqish</button>
        </div>

        {activeTab === 'school_stats' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#1d1d1f]">Maktab O'quvchilari Statistikasi</h2>
                <p className="text-sm text-gray-500">Bu yerdagi o'zgarishlar asosiy sahifadagi statistika blokida darhol aks etadi.</p>
              </div>
              <button 
                onClick={handleAddSchoolItem}
                className="px-4 py-2.5 bg-[#0071e3] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" /> Ko'rsatkich qo'shish
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {schoolStats.map((stat, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#0071e3]">Ko'rsatkich #{idx + 1}</span>
                      <button 
                        onClick={() => handleDeleteSchoolItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Raqam (Qiymati)</label>
                      <input 
                        type="number" 
                        value={stat.value} 
                        onChange={e => handleSchoolStatChange(idx, 'value', e.target.value)} 
                        className="w-full mt-1 px-3 py-2 text-sm bg-white border rounded-lg outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Belgisi (Suffix: +, %, yoki bo'sh)</label>
                      <input 
                        type="text" 
                        value={stat.suffix} 
                        onChange={e => handleSchoolStatChange(idx, 'suffix', e.target.value)} 
                        className="w-full mt-1 px-3 py-2 text-sm bg-white border rounded-lg outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Nomi (Label)</label>
                      <input 
                        type="text" 
                        value={stat.label} 
                        onChange={e => handleSchoolStatChange(idx, 'label', e.target.value)} 
                        className="w-full mt-1 px-3 py-2 text-sm bg-white border rounded-lg outline-none" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social_stats' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1d1d1f]">Ijtimoiy Aksiyalar va Yutuq</h2>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {socialStats.map((stat, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <span className="text-xs font-bold text-[#0071e3]">Aksiya ko'rsatkichi #{idx + 1}</span>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Raqam</label>
                      <input 
                        type="number" 
                        value={stat.value} 
                        onChange={e => handleSocialStatChange(idx, 'value', e.target.value)} 
                        className="w-full mt-1 px-3 py-2 text-sm bg-white border rounded-lg outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Belgisi</label>
                      <input 
                        type="text" 
                        value={stat.suffix} 
                        onChange={e => handleSocialStatChange(idx, 'suffix', e.target.value)} 
                        className="w-full mt-1 px-3 py-2 text-sm bg-white border rounded-lg outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Nomi</label>
                      <input 
                        type="text" 
                        value={stat.label} 
                        onChange={e => handleSocialStatChange(idx, 'label', e.target.value)} 
                        className="w-full mt-1 px-3 py-2 text-sm bg-white border rounded-lg outline-none" 
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Mukofot matni</label>
                <input 
                  type="text" 
                  value={awardText} 
                  onChange={e => handleAwardTextChange(e.target.value)} 
                  className="w-full mt-1 px-3 py-2 text-sm bg-white border rounded-lg outline-none" 
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1d1d1f]">O'qituvchilar</h2>
            <form onSubmit={handleAddTeacher} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-semibold text-sm text-gray-800">Yangi o'qituvchi qo'shish</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="F.I.Sh." value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} className="px-3 py-2 text-sm border rounded-lg outline-none" />
                <input type="text" placeholder="Mutaxassisligi / Fani" value={newTeacher.role} onChange={e => setNewTeacher({...newTeacher, role: e.target.value})} className="px-3 py-2 text-sm border rounded-lg outline-none" />
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, base64 => setNewTeacher({...newTeacher, image: base64}))} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#0071e3]" />
              </div>
              <button type="submit" className="px-4 py-2 bg-[#0071e3] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition cursor-pointer">Qo'shish</button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {teachers.map(t => (
                <div key={t.id} className="bg-white p-4 rounded-xl border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={t.image || "https://via.placeholder.com/50"} alt="" className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="font-semibold text-sm">{t.name}</h4>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteTeacher(t.id)} className="text-red-500 hover:text-red-700 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'administration' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1d1d1f]">Ma'muriyat</h2>
            <form onSubmit={handleAddAdmin} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-semibold text-sm text-gray-800">Ma'muriyat xodimini qo'shish</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input type="text" placeholder="F.I.Sh." value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} className="px-3 py-2 text-sm border rounded-lg outline-none" />
                <input type="text" placeholder="Lavozimi" value={newAdmin.position} onChange={e => setNewAdmin({...newAdmin, position: e.target.value})} className="px-3 py-2 text-sm border rounded-lg outline-none" />
                <input type="text" placeholder="Qabul vaqti" value={newAdmin.reception} onChange={e => setNewAdmin({...newAdmin, reception: e.target.value})} className="px-3 py-2 text-sm border rounded-lg outline-none" />
                <input type="text" placeholder="Telefon raqami" value={newAdmin.phone} onChange={e => setNewAdmin({...newAdmin, phone: e.target.value})} className="px-3 py-2 text-sm border rounded-lg outline-none" />
              </div>
              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, base64 => setNewAdmin({...newAdmin, image: base64}))} className="text-sm" />
              <button type="submit" className="px-4 py-2 bg-[#0071e3] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 cursor-pointer">Qo'shish</button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {administration.map(a => (
                <div key={a.id} className="bg-white p-4 rounded-xl border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={a.image || "https://via.placeholder.com/50"} alt="" className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="font-semibold text-sm">{a.name}</h4>
                      <p className="text-xs text-gray-500">{a.role || a.position}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteAdmin(a.id)} className="text-red-500 hover:text-red-700 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1d1d1f]">Innovatsiya va Loyihalar</h2>
            <form onSubmit={handleAddProject} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <input type="text" placeholder="Loyiha nomi" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" />
              <textarea placeholder="Tavsifi" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" />
              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, base64 => setNewProject({...newProject, image: base64}))} className="text-sm" />
              <button type="submit" className="px-4 py-2 bg-[#0071e3] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 cursor-pointer">Qo'shish</button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm">{p.title}</h4>
                    <p className="text-xs text-gray-500">{p.description}</p>
                  </div>
                  <button onClick={() => handleDeleteProject(p.id)} className="text-red-500 hover:text-red-700 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1d1d1f]">Galereya</h2>
            <form onSubmit={handleAddGallery} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <input type="text" placeholder="Sarlavha" value={newGallery.title} onChange={e => setNewGallery({...newGallery, title: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" />
              <input type="text" placeholder="Kategoriya" value={newGallery.category} onChange={e => setNewGallery({...newGallery, category: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" />
              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, base64 => setNewGallery({...newGallery, image: base64}))} className="text-sm" />
              <button type="submit" className="px-4 py-2 bg-[#0071e3] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 cursor-pointer">Qo'shish</button>
            </form>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryList.map(g => (
                <div key={g.id} className="bg-white p-2 rounded-xl border relative">
                  <img src={g.image} alt="" className="w-full h-24 object-cover rounded-lg" />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-semibold">{g.title}</span>
                    <button onClick={() => handleDeleteGallery(g.id)} className="text-red-500 hover:text-red-700 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1d1d1f]">Video Darslar</h2>
            <form onSubmit={handleAddVideo} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <input type="text" placeholder="Dars nomi" value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" />
              <input type="text" placeholder="Fan nomi" value={newVideo.subject} onChange={e => setNewVideo({...newVideo, subject: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" />
              <input type="text" placeholder="YouTube havolasi (URL)" value={newVideo.url} onChange={e => setNewVideo({...newVideo, url: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" />
              <button type="submit" className="px-4 py-2 bg-[#0071e3] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 cursor-pointer">Qo'shish</button>
            </form>
            <div className="space-y-2">
              {videoLessons.map(v => (
                <div key={v.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm">{v.title}</h4>
                    <p className="text-xs text-gray-500">{v.subject}</p>
                  </div>
                  <button onClick={() => handleDeleteVideo(v.id)} className="text-red-500 hover:text-red-700 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1d1d1f]">E'lonlar</h2>
            <form onSubmit={handleAddAnnouncement} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <input type="text" placeholder="Sarlavha" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" />
              <input type="date" value={newAnnouncement.date} onChange={e => setNewAnnouncement({...newAnnouncement, date: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" />
              <textarea placeholder="Mazmuni" value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" />
              <button type="submit" className="px-4 py-2 bg-[#0071e3] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 cursor-pointer">Qo'shish</button>
            </form>
            <div className="space-y-2">
              {announcements.map(an => (
                <div key={an.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm">{an.title}</h4>
                    <p className="text-xs text-gray-500">{an.content}</p>
                  </div>
                  <button onClick={() => handleDeleteAnnouncement(an.id)} className="text-red-500 hover:text-red-700 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'birthdays' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1d1d1f]">Tug'ilgan kunlar</h2>
            <form onSubmit={handleAddBirthday} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <input type="text" placeholder="O'quvchi F.I.Sh." value={newBirthday.name} onChange={e => setNewBirthday({...newBirthday, name: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" />
              <input type="text" placeholder="Sinfi (masalan: 11-A)" value={newBirthday.class} onChange={e => setNewBirthday({...newBirthday, class: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" />
              <input type="date" value={newBirthday.date} onChange={e => setNewBirthday({...newBirthday, date: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" />
              <button type="submit" className="px-4 py-2 bg-[#0071e3] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 cursor-pointer">Qo'shish</button>
            </form>
            <div className="space-y-2">
              {birthdays.map(b => (
                <div key={b.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm">{b.name} ({b.class})</h4>
                    <p className="text-xs text-gray-500">{b.date}</p>
                  </div>
                  <button onClick={() => handleDeleteBirthday(b.id)} className="text-red-500 hover:text-red-700 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gpa' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1d1d1f]">GPA Reytingi</h2>
            <form onSubmit={handleAddGpa} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <input type="text" placeholder="O'quvchi F.I.Sh." value={newGpa.name} onChange={e => setNewGpa({...newGpa, name: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" />
              <input type="text" placeholder="Sinfi" value={newGpa.class} onChange={e => setNewGpa({...newGpa, class: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" />
              <input type="text" placeholder="GPA ko'rsatkichi (masalan: 4.8)" value={newGpa.gpa} onChange={e => setNewGpa({...newGpa, gpa: e.target.value})} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" />
              <button type="submit" className="px-4 py-2 bg-[#0071e3] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 cursor-pointer">Qo'shish</button>
            </form>
            <div className="space-y-2">
              {gpaList.map(g => (
                <div key={g.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm">{g.name} ({g.class})</h4>
                    <p className="text-xs text-gray-500">GPA: {g.gpa}</p>
                  </div>
                  <button onClick={() => handleDeleteGpa(g.id)} className="text-red-500 hover:text-red-700 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1d1d1f]">Murojaatlar ({messages.length})</h2>
            <div className="space-y-3">
              {messages.map((m: any) => (
                <div key={m.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm">{m.name || "O'quvchi"}</h4>
                    <p className="text-xs text-gray-600 mt-1">{m.message || m.content}</p>
                    <span className="text-[10px] text-gray-400 mt-2 block">{m.date}</span>
                  </div>
                  <button onClick={() => handleDeleteMessage(m.id)} className="text-red-500 hover:text-red-700 cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}