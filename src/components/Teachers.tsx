import { useEffect, useMemo, useState } from 'react';
import { BookOpen, GraduationCap, User, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { teachers as staticTeachers } from '../lib/data';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface Teacher {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  subject?: string;
  classes?: string | null;
  experience?: string;
  category?: string;
}

export default function Teachers() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('Barchasi');
  const [showAll, setShowAll] = useState(false);

  const loadTeachers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('teachers')
      .select('id,name,role,bio,image,subject,classes,experience,category')
      .order('name', { ascending: true });

    if (error || !data?.length) {
      console.error('Teachers load error:', error);
      setTeachers(staticTeachers as Teacher[]);
    } else {
      setTeachers(data as Teacher[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadTeachers();
    const channel = supabase
      .channel('teachers-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teachers' }, () => {
        void loadTeachers();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const subjects = useMemo(() => {
    const unique = Array.from(new Set(teachers.map(t => t.subject).filter(Boolean))) as string[];
    return ['Barchasi', ...unique];
  }, [teachers]);

  const filteredTeachers = useMemo(
    () => subject === 'Barchasi' ? teachers : teachers.filter(t => t.subject === subject),
    [teachers, subject]
  );

  const visibleTeachers = showAll ? filteredTeachers : filteredTeachers.slice(0, 8);

  return (
    <section id="teachers" className="apple-section relative overflow-hidden py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-180px] top-[5%] h-[500px] w-[500px] rounded-full bg-sky-200/20 blur-3xl animate-liquid" />
        <div className="absolute right-[-180px] bottom-[5%] h-[500px] w-[500px] rounded-full bg-indigo-200/20 blur-3xl animate-liquid" style={{ animationDelay: '3s' }} />
      </div>

      <div className="apple-container mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0071e3] shadow-sm backdrop-blur-md">
            <GraduationCap className="h-3.5 w-3.5" /> O'qituvchilar
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1d1d1f] sm:text-5xl md:text-6xl">
            Bizning <span className="text-gradient-blue">ustozlar</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#6e6e73] sm:text-lg">
            Maktabimizda faoliyat yuritayotgan pedagoglar, ularning fanlari va tajribasi.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {subjects.map(item => (
            <button
              key={item}
              onClick={() => { setSubject(item); setShowAll(false); }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${subject === item ? 'bg-[#0071e3] text-white shadow-lg' : 'border border-slate-200 bg-white/70 text-slate-600 hover:bg-white'}`}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">O'qituvchilar yuklanmoqda…</div>
        ) : (
          <div ref={ref} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleTeachers.map((teacher, index) => (
              <article
                key={teacher.id}
                className={`group relative overflow-hidden rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(15,23,42,0.12)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${Math.min(index, 8) * 70}ms` }}
              >
                <div className="mb-5 flex items-center gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[20px] border border-white bg-slate-100 shadow-md">
                    <img src={teacher.image || '/images/default.jpg'} alt={teacher.name} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold leading-tight text-[#1d1d1f] group-hover:text-[#0071e3]">{teacher.name}</h3>
                    <p className="mt-1 text-xs font-semibold text-[#0071e3]">{teacher.subject || teacher.role}</p>
                  </div>
                </div>

                <p className="min-h-[48px] text-sm leading-relaxed text-[#6e6e73]">{teacher.bio}</p>

                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-200/70 pt-4">
                  <div className="rounded-2xl bg-slate-50/80 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400"><BookOpen className="h-3.5 w-3.5" /> Tajriba</div>
                    <div className="mt-1 text-sm font-bold text-slate-700">{teacher.experience || '—'}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50/80 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400"><Users className="h-3.5 w-3.5" /> Sinflar</div>
                    <div className="mt-1 truncate text-sm font-bold text-slate-700">{teacher.classes || 'Aniqlanmoqda'}</div>
                  </div>
                </div>

                {teacher.category && <div className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0071e3]">{teacher.category}</div>}
              </article>
            ))}
          </div>
        )}

        {!loading && filteredTeachers.length > 8 && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setShowAll(value => !value)}
              className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
            >
              {showAll ? 'Kamroq ko‘rsatish' : `Ko‘proq ustozlarni ko‘rish (${filteredTeachers.length - 8})`}
              {showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        )}

        {!loading && filteredTeachers.length === 0 && (
          <div className="mx-auto max-w-xl rounded-[28px] bg-white/70 p-12 text-center shadow-lg backdrop-blur-xl">
            <User className="mx-auto h-10 w-10 text-[#0071e3]" />
            <p className="mt-4 text-sm text-slate-500">Bu fan bo'yicha o'qituvchilar topilmadi.</p>
          </div>
        )}
      </div>
    </section>
  );
}
