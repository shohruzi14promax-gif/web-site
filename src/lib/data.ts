export const schoolInfo = {
  name: 'Jizzax shahridagi 1-sonli ixtisoslashtirilgan maktab-internati',
  shortName: '1-IMI Jizzax',
  founded: null as number | null,
  address: '',
  phone: '',
  phone2: '',
  email: '',
  mapUrl: '',
  mapEmbed: '',
  social: { telegram: '', youtube: '', instagram: '', facebook: '' },
};

// Public-facing statistics are intentionally empty until verified by an official source.
export const stats: Array<{ label: string; value: number; suffix: string }> = [];

// Historical claims are intentionally empty until verified by an official source.
export const historyTimeline: Array<{ year: string; title: string; description: string }> = [];

export const goals: Array<{ icon: string; title: string; description: string }> = [];

export interface Teacher {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  reception?: string;
  phone?: string;
  subject?: string;
  classes?: string;
  experience?: string;
  category?: string;
}

export const administration: Teacher[] = [];
export const teachers: Teacher[] = [];

export const subjects = [
  { name: 'Matematika', icon: 'Calculator', color: 'blue', desc: '' },
  { name: 'Ingliz tili', icon: 'Languages', color: 'blue', desc: '' },
  { name: 'Fizika', icon: 'Atom', color: 'green', desc: '' },
  { name: 'Biologiya', icon: 'Dna', color: 'green', desc: '' },
  { name: 'Kimyo', icon: 'FlaskConical', color: 'red', desc: '' },
];

export const gpaRankings: Array<{ rank: number; name: string; class: string; gpa: number; achievements: number }> = [];
export const videoLessons: Array<Record<string, string>> = [];
export const videos = videoLessons;
export const projects: Array<Record<string, unknown>> = [];
export const socialActions: Array<{ label: string; value: number; suffix: string }> = [];

export const schoolPresident = {
  name: '',
  telegram: '',
  role: 'Maktab Prezidenti',
  description: '',
};

export type Ministry = {
  name: string;
  icon: string;
  color: string;
  minister: string;
  telegram: string;
  description: string;
  initiatives: string[];
};

export const ministries: Ministry[] = [];
export const galleryItems: Array<{ type: string; url: string; title: string }> = [];

export const navLinks = [
  { label: 'Bosh sahifa', href: '#hero' },
  { label: 'Maktab haqida', href: '#about' },
  { label: 'Akademik', href: '#academic' },
  { label: 'Ma’muriyat', href: '#administration' },
  { label: 'Video darsliklar', href: '#videolessons' },
  { label: 'Prezident Devoni', href: '#president' },
  { label: 'Innovatsiya', href: '#innovation' },
  { label: 'Galereya', href: '#gallery' },
  { label: 'Aloqa', href: '#contact' },
];
