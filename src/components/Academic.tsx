import { useState, useEffect } from 'react';
import {
  Calculator, Atom, Code2, FlaskConical, Dna, Languages, Landmark, BookOpen,
  Award, TrendingUp, Users, GraduationCap,
} from 'lucide-react';
import { subjects, gpaRankings as defaultGpa } from '../lib/data';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const iconMap: Record<string, typeof Calculator> = {
  Calculator,
  Atom,
  Code2,
  FlaskConical,
  Dna,
  Languages,
  Landmark,
  BookOpen,
};

const colorMap: Record<string, string> = {
  blue: 'bg-[#0071e3]/10 text-[#0071e3]',
  green: 'bg-[#34c759]/10 text-[#34c759]',
  orange: 'bg-[#ff9500]/10 text-[#ff9500]',
  red: 'bg-[#ff3b30]/10 text-[#ff3b30]',
};

const badgeColor: Record<string, string> = {
  blue: 'bg-[#0071e3] text-white',
  green: 'bg-[#34c759] text-white',
  orange: 'bg-[#ff9500] text-white',
  red: 'bg-[#ff3b30] text-white',
};

type Tab = 'teachers' | 'subjects' | 'gpa';

export default function Academic() {
  const [tab, setTab] = useState<Tab>('teachers');
  const { ref: subjectsRef, isVisible: subjectsVisible } = useScrollAnimation<HTMLDivElement>();

  // Faqat admin paneldan kiritilgan ma'lumotlarni o'qish (standart bazasiz)
  const loadTeachers = () => {
    const saved = 
      localStorage.getItem("teachers") || 
      localStorage.getItem("admin_teachers") || 
      localStorage.getItem("school_teachers");
      
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((t: any) => ({
            name: t.name || t.fullName || "O'qituvchi",
            subject: t.subject || t.role || t.fan || "Fan o'qituvchisi",
            classes: t.classes || t.sinf || "5-11 sinflar",
            experience: t.experience || t.staj || "5+ yil",
            category: t.category || t.toifa || "Oliy toifa",
            image: t.image || t.avatar || t.photo || ""
          }));
        }
      } catch (e) {}
    }
    return []; // Hech narsa qo'shilmagan bo'lsa bo'sh qaytaradi
  };

  const loadGpa = () => {
    const saved = 
      localStorage.getItem("gpaList") || 
      localStorage.getItem("gpaRankings") || 
      localStorage.getItem("admin_gpa");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((g: any, idx: number) => ({
            rank: g.rank || idx + 1,
            name: g.name || g.fullName || "O'quvchi",
            class: g.class || g.className || "11-A",
            gpa: parseFloat(g.gpa) || 4.90,
            achievements: g.achievements || g.yutuq || 5
          }));
        }
      } catch (e) {}
    }
    return defaultGpa;
  };

  const [teachersList, setTeachersList] = useState(loadTeachers);
  const [gpaList, setGpaList] = useState(loadGpa);

  useEffect(() => {
    const handleStorageChange = () => {
      setTeachersList(loadTeachers());
      setGpaList(loadGpa());
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <section id="academic" className="apple-section">
      <div className="apple-container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="apple-eyebrow mb-4">Akademik Portal</p>
          <h2 className="apple-heading">O'qituvchilar, fanlar va reytinglar</h2>
          <p className="apple-subheading mt-4">
            Chuqurlashtirilgan ta'lim dasturi, professional pedagoglar va GPA reytingi
          </p>
        </div>

        <div className="mb-10 flex justify-center">
          <div className="inline-flex gap-1 rounded-full bg-black/5 p-1">
            {([
              { key: 'teachers', label: "O'qituvchilar", icon: Users },
              { key: 'subjects', label: "Fanlar", icon: GraduationCap },
              { key: 'gpa', label: 'GPA Reyting', icon: TrendingUp },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                  tab === key
                    ? 'bg-white text-[#0071e3] shadow-sm'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'teachers' && (
          <div>
            {teachersList.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
                {teachersList.map((teacher: any, index: number) => (
                  <div key={index} className="apple-card group !p-6 flex flex-col justify-between">
                    <div>
                      <div className="mb-4 h-36 w-full overflow-hidden rounded-2xl bg-[#0071e3]/10 flex items-center justify-center transition-transform group-hover:scale-[1.02]">
                        {teacher.image ? (
                          <img 
                            src={teacher.image} 
                            alt={teacher.name} 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <Users className="h-10 w-10 text-[#0071e3]" />
                        )}
                      </div>
                      <h3 className="text-base font-semibold leading-snug text-[#1d1d1f]">{teacher.name}</h3>
                      <p className="mt-1 text-sm font-medium text-[#0071e3]">{teacher.subject}</p>
                    </div>

                    <div className="mt-4 space-y-1.5 border-t border-black/5 pt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#6e6e73]">Sinflar</span>
                        <span className="font-medium text-[#1d1d1f]">{teacher.classes}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#6e6e73]">Staj</span>
                        <span className="font-medium text-[#1d1d1f]">{teacher.experience}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#6e6e73]">Toifa</span>
                        <span className="font-medium text-[#1d1d1f]">{teacher.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Users className="mx-auto h-12 w-12 text-[#6e6e73]/40" />
                <p className="mt-4 text-sm font-medium text-[#6e6e73]">Hozircha admin paneldan o'qituvchilar qo'shilmagan.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'subjects' && (
          <div ref={subjectsRef} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((subject, index) => {
              const Icon = iconMap[subject.icon] ?? Calculator;
              return (
                <div
                  key={index}
                  className={`apple-card group transition-all duration-700 ease-out ${
                    subjectsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${
                      colorMap[subject.color] ?? colorMap.blue
                    }`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[#1d1d1f]">{subject.name}</h3>
                  <p className="text-sm font-normal leading-relaxed text-[#6e6e73]">{subject.desc}</p>
                  <span
                    className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      badgeColor[subject.color] ?? badgeColor.blue
                    }`}
                  >
                    Chuqurlashtirilgan
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'gpa' && (
          <div className="mx-auto max-w-3xl animate-fade-in">
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <div className="grid grid-cols-12 gap-2 border-b border-black/5 bg-[#f5f5f7] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6e6e73]">
                <div className="col-span-2 text-center">Reyting</div>
                <div className="col-span-5">O'quvchi</div>
                <div className="col-span-2 text-center">Sinf</div>
                <div className="col-span-2 text-center">GPA</div>
                <div className="col-span-1 text-center">Yutuq</div>
              </div>
              {gpaList.map((student: any, index: number) => (
                <div
                  key={index}
                  className={`grid grid-cols-12 items-center gap-2 px-6 py-4 text-sm transition-colors hover:bg-[#f5f5f7]/50 ${
                    index !== gpaList.length - 1 ? 'border-b border-black/5' : ''
                  }`}
                >
                  <div className="col-span-2 text-center">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        student.rank <= 3
                          ? 'bg-[#0071e3] text-white'
                          : 'bg-black/5 text-[#1d1d1f]'
                      }`}
                    >
                      {student.rank}
                    </span>
                  </div>
                  <div className="col-span-5 font-medium text-[#1d1d1f]">{student.name}</div>
                  <div className="col-span-2 text-center text-[#6e6e73]">{student.class}</div>
                  <div className="col-span-2 text-center">
                    <span className="font-bold text-[#0071e3]">
                      {typeof student.gpa === 'number' ? student.gpa.toFixed(2) : student.gpa}
                    </span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-[#6e6e73]">
                      <Award className="h-3.5 w-3.5 text-[#ff9500]" />
                      {student.achievements}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-sm text-[#6e6e73]">
              Reyting natijalari admin panel orqali boshqariladi
            </p>
          </div>
        )}
      </div>
    </section>
  );
}