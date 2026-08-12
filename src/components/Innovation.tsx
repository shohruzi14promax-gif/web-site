import { useState, useEffect } from 'react';
import { Rocket, Leaf, TrendingUp, Award } from 'lucide-react';
import { useScrollAnimation, useCountUp } from '../hooks/useScrollAnimation';

function SocialStat({ stat, index, visible }: { stat: { value: number; suffix: string; label: string }; index: number; visible: boolean }) {
  const count = useCountUp(stat.value, 2000, visible);
  return (
    <div
      className={`text-center transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {count.toLocaleString()}
        <span className="text-[#42a5f5]">{stat.suffix}</span>
      </div>
      <div className="mt-1 text-sm text-white/70">{stat.label}</div>
    </div>
  );
}

export default function Innovation() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation<HTMLDivElement>();

  const [projects, setProjects] = useState<any[]>([]);
  const [socialActions, setSocialActions] = useState([
    { value: 200, suffix: "+", label: "Aksiya qatnashchilari" },
    { value: 15, suffix: " ta", label: "Maxsus loyihalar" },
    { value: 100, suffix: "%", label: "Ochiq portal" },
    { value: 1, suffix: "-o'rin", label: "Grant yutuqlari" }
  ]);
  const [awardText, setAwardText] = useState("Yilning eng faol maktabi – Jizzax viloyati, 2026");

  // Admin paneldan yoki localStorage'dan ma'lumotlarni yangilab turish
  useEffect(() => {
    const loadSavedStats = () => {
      try {
        const saved = localStorage.getItem('schoolStats');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSocialActions(parsed);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadSavedStats();
    window.addEventListener('storage', loadSavedStats);
    window.addEventListener('schoolStatsUpdated', loadSavedStats);

    return () => {
      window.removeEventListener('storage', loadSavedStats);
      window.removeEventListener('schoolStatsUpdated', loadSavedStats);
    };
  }, []);

  return (
    <section ref={ref} className="py-20 bg-gray-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Innovatsiya va Yutuqlar</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2">Maktabimizning Raqamlardagi Muvaffaqiyatlari</h2>
          <p className="text-gray-400 mt-4 text-base">
            {awardText}
          </p>
        </div>

        {/* Statistika qismi */}
        <div ref={statsRef} className="grid grid-cols-2 gap-8 md:grid-cols-4 bg-gray-800/50 border border-gray-700/50 rounded-3xl p-8 backdrop-blur-sm">
          {socialActions.map((stat, index) => (
            <SocialStat key={index} stat={stat} index={index} visible={statsVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}