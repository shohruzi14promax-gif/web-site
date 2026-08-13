import { useState, useEffect } from 'react';
import {
  Calculator,
  Atom,
  Code2,
  FlaskConical,
  Dna,
  Languages,
  Landmark,
  BookOpen,
  Award,
  TrendingUp,
  Users,
  GraduationCap,
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

  const {
    ref: subjectsRef,
    isVisible: subjectsVisible,
  } = useScrollAnimation<HTMLDivElement>();

  const {
    ref: teachersRef,
    isVisible: teachersVisible,
  } = useScrollAnimation<HTMLDivElement>();

  const {
    ref: gpaRef,
    isVisible: gpaVisible,
  } = useScrollAnimation<HTMLDivElement>();

  // ==================================================
  // TEACHERS
  // ==================================================

  const loadTeachers = () => {
    const saved =
      localStorage.getItem('teachers') ||
      localStorage.getItem('admin_teachers') ||
      localStorage.getItem('school_teachers');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((t: any) => ({
            name: t.name || t.fullName || "O'qituvchi",
            subject:
              t.subject ||
              t.role ||
              t.fan ||
              "Fan o'qituvchisi",
            classes:
              t.classes ||
              t.sinf ||
              '5-11 sinflar',
            experience:
              t.experience ||
              t.staj ||
              '5+ yil',
            category:
              t.category ||
              t.toifa ||
              'Oliy toifa',
            image:
              t.image ||
              t.avatar ||
              t.photo ||
              '',
          }));
        }
      } catch (e) {
        console.error('Teachers parse error:', e);
      }
    }

    return [];
  };

  // ==================================================
  // GPA
  // ==================================================

  const loadGpa = () => {
    const saved =
      localStorage.getItem('gpaList') ||
      localStorage.getItem('gpaRankings') ||
      localStorage.getItem('admin_gpa');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((g: any, idx: number) => ({
            rank: g.rank || idx + 1,
            name:
              g.name ||
              g.fullName ||
              "O'quvchi",
            class:
              g.class ||
              g.className ||
              '11-A',
            gpa:
              parseFloat(g.gpa) || 4.9,
            achievements:
              g.achievements ||
              g.yutuq ||
              5,
          }));
        }
      } catch (e) {
        console.error('GPA parse error:', e);
      }
    }

    return defaultGpa;
  };

  const [teachersList, setTeachersList] =
    useState(loadTeachers);

  const [gpaList, setGpaList] =
    useState(loadGpa);

  // ==================================================
  // LIVE LOCAL STORAGE UPDATE
  // ==================================================

  useEffect(() => {
    const handleStorageChange = () => {
      setTeachersList(loadTeachers());
      setGpaList(loadGpa());
    };

    window.addEventListener(
      'storage',
      handleStorageChange
    );

    const interval = setInterval(
      handleStorageChange,
      1000
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorageChange
      );

      clearInterval(interval);
    };
  }, []);

  // ==================================================
  // TAB DATA
  // ==================================================

  const tabs = [
    {
      key: 'teachers' as Tab,
      label: "O'qituvchilar",
      icon: Users,
    },
    {
      key: 'subjects' as Tab,
      label: 'Fanlar',
      icon: GraduationCap,
    },
    {
      key: 'gpa' as Tab,
      label: 'GPA Reyting',
      icon: TrendingUp,
    },
  ];

  return (
    <section
      id="academic"
      className="
        apple-section
        relative
        overflow-hidden
      "
    >
      {/* ==================================================
          BACKGROUND GLOW
      ================================================== */}

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

        <div
          className="
            absolute
            left-[-180px]
            top-[10%]
            h-[450px]
            w-[450px]
            rounded-full
            bg-blue-200/15
            blur-3xl
            animate-liquid
          "
        />

        <div
          className="
            absolute
            right-[-150px]
            bottom-[10%]
            h-[450px]
            w-[450px]
            rounded-full
            bg-cyan-200/15
            blur-3xl
            animate-liquid
          "
          style={{
            animationDelay: '3s',
          }}
        />

      </div>

      <div className="apple-container">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="
            mx-auto
            mb-16
            max-w-3xl
            text-center
          "
        >
          <p className="apple-eyebrow mb-4">
            Akademik Portal
          </p>

          <h2 className="apple-heading">
            O'qituvchilar, fanlar va reytinglar
          </h2>

          <p className="apple-subheading mt-4">
            Chuqurlashtirilgan ta'lim dasturi,
            professional pedagoglar va GPA reytingi
          </p>
        </div>

        {/* ==================================================
            TABS
        ================================================== */}

        <div className="mb-10 flex justify-center">

          <div
            className="
              inline-flex
              max-w-full
              gap-1
              overflow-x-auto
              rounded-full
              border
              border-white/70
              bg-white/50
              p-1.5
              shadow-lg
              shadow-slate-900/5
              backdrop-blur-2xl
            "
          >

            {tabs.map(
              ({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`
                    relative
                    flex
                    shrink-0
                    items-center
                    gap-2
                    rounded-full
                    px-5
                    py-2.5
                    text-sm
                    font-medium
                    cursor-pointer

                    transition-all
                    duration-300

                    ${
                      tab === key
                        ? `
                          bg-white
                          text-[#0071e3]
                          shadow-md
                          shadow-slate-900/5
                          scale-[1.02]
                        `
                        : `
                          text-[#6e6e73]
                          hover:bg-white/50
                          hover:text-[#1d1d1f]
                        `
                    }
                  `}
                >
                  <Icon
                    className={`
                      h-4
                      w-4
                      transition-transform
                      duration-300
                      ${
                        tab === key
                          ? 'scale-110'
                          : ''
                      }
                    `}
                  />

                  {label}
                </button>
              )
            )}

          </div>
        </div>

        {/* ==================================================
            TEACHERS
        ================================================== */}

        {tab === 'teachers' && (
          <div ref={teachersRef}>

            {teachersList.length > 0 ? (

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                {teachersList.map(
                  (teacher: any, index: number) => (
                    <div
                      key={index}
                      className={`
                        apple-card
                        group
                        flex
                        flex-col
                        justify-between
                        !p-6

                        transition-all
                        duration-700
                        ease-[cubic-bezier(0.16,1,0.3,1)]

                        ${
                          teachersVisible
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-12'
                        }
                      `}
                      style={{
                        transitionDelay: `${index * 100}ms`,
                      }}
                    >

                      {/* Teacher image */}

                      <div>

                        <div
                          className="
                            relative
                            mb-5
                            h-40
                            w-full
                            overflow-hidden
                            rounded-2xl
                            bg-gradient-to-br
                            from-blue-50
                            to-slate-100
                            transition-all
                            duration-500
                            group-hover:shadow-lg
                            group-hover:shadow-blue-500/10
                          "
                        >

                          {teacher.image ? (
                            <img
                              src={teacher.image}
                              alt={teacher.name}
                              className="
                                h-full
                                w-full
                                object-cover
                                transition-transform
                                duration-700
                                group-hover:scale-105
                              "
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Users
                                className="
                                  h-12
                                  w-12
                                  text-[#0071e3]/50
                                  transition-transform
                                  duration-500
                                  group-hover:scale-110
                                "
                              />
                            </div>
                          )}

                          {/* Image overlay */}

                          <div
                            className="
                              pointer-events-none
                              absolute
                              inset-0
                              bg-gradient-to-t
                              from-black/10
                              via-transparent
                              to-white/20
                              opacity-0
                              transition-opacity
                              duration-500
                              group-hover:opacity-100
                            "
                          />

                        </div>

                        <h3
                          className="
                            text-base
                            font-semibold
                            leading-snug
                            text-[#1d1d1f]
                            transition-colors
                            duration-300
                            group-hover:text-[#0071e3]
                          "
                        >
                          {teacher.name}
                        </h3>

                        <p className="mt-1 text-sm font-medium text-[#0071e3]">
                          {teacher.subject}
                        </p>

                      </div>

                      {/* Teacher details */}

                      <div
                        className="
                          mt-5
                          space-y-2
                          border-t
                          border-black/5
                          pt-4
                        "
                      >

                        <div className="flex justify-between text-xs">
                          <span className="text-[#6e6e73]">
                            Sinflar
                          </span>

                          <span className="font-medium text-[#1d1d1f]">
                            {teacher.classes}
                          </span>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-[#6e6e73]">
                            Staj
                          </span>

                          <span className="font-medium text-[#1d1d1f]">
                            {teacher.experience}
                          </span>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-[#6e6e73]">
                            Toifa
                          </span>

                          <span className="font-medium text-[#1d1d1f]">
                            {teacher.category}
                          </span>
                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>

            ) : (

              <div
                className="
                  mx-auto
                  max-w-xl
                  rounded-3xl
                  border
                  border-white/70
                  bg-white/50
                  p-16
                  text-center
                  shadow-lg
                  backdrop-blur-xl
                  animate-fade-in
                "
              >

                <div
                  className="
                    mx-auto
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-blue-50
                  "
                >
                  <Users
                    className="
                      h-8
                      w-8
                      text-[#0071e3]
                    "
                  />
                </div>

                <p className="mt-5 text-sm font-medium text-[#6e6e73]">
                  Hozircha admin paneldan
                  o'qituvchilar qo'shilmagan.
                </p>

              </div>

            )}

          </div>
        )}

        {/* ==================================================
            SUBJECTS
        ================================================== */}

        {tab === 'subjects' && (
          <div
            ref={subjectsRef}
            className="
              grid
              gap-5
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >

            {subjects.map(
              (subject, index) => {
                const Icon =
                  iconMap[subject.icon] ??
                  Calculator;

                return (
                  <div
                    key={index}
                    className={`
                      apple-card
                      group
                      relative
                      overflow-hidden

                      transition-all
                      duration-700
                      ease-[cubic-bezier(0.16,1,0.3,1)]

                      ${
                        subjectsVisible
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-12'
                      }
                    `}
                    style={{
                      transitionDelay: `${index * 80}ms`,
                    }}
                  >

                    {/* Glow */}

                    <div
                      className="
                        pointer-events-none
                        absolute
                        -right-16
                        -top-16
                        h-32
                        w-32
                        rounded-full
                        bg-blue-200/20
                        blur-3xl
                        transition-transform
                        duration-700
                        group-hover:scale-[2]
                      "
                    />

                    <div
                      className={`
                        relative
                        z-10
                        mb-4
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl

                        transition-all
                        duration-500

                        group-hover:scale-110
                        group-hover:rotate-3

                        ${
                          colorMap[subject.color] ??
                          colorMap.blue
                        }
                      `}
                    >
                      <Icon
                        className="
                          h-6
                          w-6
                          transition-transform
                          duration-300
                          group-hover:scale-110
                        "
                        strokeWidth={2}
                      />
                    </div>

                    <h3
                      className="
                        relative
                        z-10
                        mb-2
                        text-lg
                        font-semibold
                        text-[#1d1d1f]
                        transition-colors
                        duration-300
                        group-hover:text-[#0071e3]
                      "
                    >
                      {subject.name}
                    </h3>

                    <p
                      className="
                        relative
                        z-10
                        text-sm
                        font-normal
                        leading-relaxed
                        text-[#6e6e73]
                      "
                    >
                      {subject.desc}
                    </p>

                    <span
                      className={`
                        relative
                        z-10
                        mt-4
                        inline-block
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-medium
                        transition-transform
                        duration-300
                        group-hover:scale-105

                        ${
                          badgeColor[subject.color] ??
                          badgeColor.blue
                        }
                      `}
                    >
                      Chuqurlashtirilgan
                    </span>

                  </div>
                );
              }
            )}

          </div>
        )}

        {/* ==================================================
            GPA
        ================================================== */}

        {tab === 'gpa' && (
          <div
            ref={gpaRef}
            className={`
              mx-auto
              max-w-3xl

              transition-all
              duration-700

              ${
                gpaVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }
            `}
          >

            <div
              className="
                overflow-hidden
                rounded-[28px]
                border
                border-white/70
                bg-white/70
                shadow-xl
                shadow-slate-900/5
                backdrop-blur-2xl
              "
            >

              {/* Header */}

              <div
                className="
                  grid
                  grid-cols-12
                  gap-2
                  border-b
                  border-black/5
                  bg-white/50
                  px-6
                  py-4
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-[#6e6e73]
                "
              >

                <div className="col-span-2 text-center">
                  Reyting
                </div>

                <div className="col-span-5">
                  O'quvchi
                </div>

                <div className="col-span-2 text-center">
                  Sinf
                </div>

                <div className="col-span-2 text-center">
                  GPA
                </div>

                <div className="col-span-1 text-center">
                  Yutuq
                </div>

              </div>

              {/* Rows */}

              {gpaList.map(
                (student: any, index: number) => (
                  <div
                    key={index}
                    className={`
                      grid
                      grid-cols-12
                      items-center
                      gap-2
                      px-6
                      py-4
                      text-sm

                      transition-all
                      duration-300

                      hover:bg-white/80
                      hover:translate-x-1

                      ${
                        index !==
                        gpaList.length - 1
                          ? 'border-b border-black/5'
                          : ''
                      }
                    `}
                  >

                    {/* Rank */}

                    <div className="col-span-2 text-center">

                      <span
                        className={`
                          inline-flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-full
                          text-sm
                          font-bold

                          transition-transform
                          duration-300
                          hover:scale-110

                          ${
                            student.rank <= 3
                              ? 'bg-[#0071e3] text-white shadow-md shadow-blue-500/20'
                              : 'bg-black/5 text-[#1d1d1f]'
                          }
                        `}
                      >
                        {student.rank}
                      </span>

                    </div>

                    {/* Name */}

                    <div
                      className="
                        col-span-5
                        font-medium
                        text-[#1d1d1f]
                      "
                    >
                      {student.name}
                    </div>

                    {/* Class */}

                    <div
                      className="
                        col-span-2
                        text-center
                        text-[#6e6e73]
                      "
                    >
                      {student.class}
                    </div>

                    {/* GPA */}

                    <div className="col-span-2 text-center">

                      <span
                        className="
                          font-bold
                          text-[#0071e3]
                        "
                      >
                        {typeof student.gpa === 'number'
                          ? student.gpa.toFixed(2)
                          : student.gpa}
                      </span>

                    </div>

                    {/* Achievement */}

                    <div className="col-span-1 text-center">

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-0.5
                          text-xs
                          font-medium
                          text-[#6e6e73]
                        "
                      >

                        <Award
                          className="
                            h-3.5
                            w-3.5
                            text-[#ff9500]
                          "
                        />

                        {student.achievements}

                      </span>

                    </div>

                  </div>
                )
              )}

            </div>

            <p
              className="
                mt-4
                text-center
                text-sm
                text-[#6e6e73]
              "
            >
              Reyting natijalari admin panel orqali
              boshqariladi
            </p>

          </div>
        )}

      </div>
    </section>
  );
}