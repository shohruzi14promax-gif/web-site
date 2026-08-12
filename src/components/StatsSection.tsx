import { createContext, useContext, useState, useEffect } from 'react';

const StatsContext = createContext<any>(null);

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [schoolStats, setSchoolStats] = useState(() => {
    const saved = localStorage.getItem('schoolStats');
    return saved ? JSON.parse(saved) : [
      { value: 450, suffix: "+", label: "O'quvchilar" },
      { value: 48, suffix: "", label: "O'qituvchilar" },
      { value: 5, suffix: "", label: "Chuqurlashtirilgan fanlar" },
      { value: 23, suffix: "", label: "Yutuqlar (2024)" },
      { value: 120, suffix: "+", label: "Birinchi bitiruvchilar" },
      { value: 94, suffix: "%", label: "Oliy o'quv muassasalariga kirish" }
    ];
  });

  const updateStats = (newData: any[]) => {
    setSchoolStats(newData);
    localStorage.setItem('schoolStats', JSON.stringify(newData));
  };

  return (
    <StatsContext.Provider value={{ schoolStats, updateStats }}>
      {children}
    </StatsContext.Provider>
  );
}

export const useStats = () => useContext(StatsContext);