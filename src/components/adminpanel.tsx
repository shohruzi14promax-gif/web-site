import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Image as ImageIcon,
  Video,
  Bell,
  Cake,
  Trophy,
  MessageSquare,
  Trash2,
  LogOut,
  ShieldCheck,
  X,
  Rocket,
  Lock,
  Calendar,
  RefreshCw,
  Upload,
  Inbox,
  Pencil,
  Search,
  Save,
  AlertTriangle,
} from "lucide-react";

interface AdminPanelProps {
  onClose: () => void;
}

type ID = number;

interface Teacher {
  id: ID;
  name: string;
  role: string;
  assignedClass: string;
  experience: string;
  bio: string;
  image: string;
}

interface Project {
  id: ID;
  title: string;
  goal: string;
  participants: string;
  status: string;
  description: string;
  image: string;
}

interface GalleryItem {
  id: ID;
  title: string;
  date: string;
  description: string;
  image: string;
}

interface VideoLesson {
  id: ID;
  title: string;
  subject: string;
  teacher: string;
  url: string;
}

interface Announcement {
  id: ID;
  title: string;
  date: string;
  content: string;
}

interface Birthday {
  id: ID;
  name: string;
  date: string;
  class: string;
}

interface GPA {
  id: ID;
  name: string;
  class: string;
  gpa: number;
}

interface Message {
  id: ID | string;
  name?: string;
  full_name?: string;
  message?: string;
  description?: string;
  date?: string;
}

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const ADMIN_PASSWORD = "2026";

const STORAGE_KEYS = {
  teachers: "teachers",
  projects: "projects",
  gallery: "galleryList",
  videos: "videoLessons",
  announcements: "announcements",
  birthdays: "birthdays",
  gpa: "gpaList",
  messages: "student_proposals",
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);

    if (!value) return fallback;

    const parsed = JSON.parse(value);

    return parsed as T;
  } catch (error) {
    console.error(`localStorage error [${key}]`, error);
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));

    window.dispatchEvent(
      new CustomEvent("admin_data_updated", {
        detail: { key },
      })
    );
  } catch (error) {
    console.error(`localStorage save error [${key}]`, error);
    throw error;
  }
}

function createId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function formatYouTubeUrl(url: string): string {
  if (!url.trim()) return "";

  const value = url.trim();

  if (value.includes("/embed/")) return value;

  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
    /youtube\.com\/live\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);

    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return value;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard");

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [videoLessons, setVideoLessons] = useState<VideoLesson[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [gpaList, setGpaList] = useState<GPA[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const [toasts, setToasts] = useState<Toast[]>([]);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: string;
    id: ID | string;
  } | null>(null);

  const [editingTeacher, setEditingTeacher] = useState<ID | null>(null);
  const [editingProject, setEditingProject] = useState<ID | null>(null);
  const [editingGallery, setEditingGallery] = useState<ID | null>(null);
  const [editingVideo, setEditingVideo] = useState<ID | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<ID | null>(
    null
  );
  const [editingBirthday, setEditingBirthday] = useState<ID | null>(null);
  const [editingGpa, setEditingGpa] = useState<ID | null>(null);

  const [newTeacher, setNewTeacher] = useState<Omit<Teacher, "id">>({
    name: "",
    role: "",
    assignedClass: "",
    experience: "",
    bio: "",
    image: "",
  });

  const [newProject, setNewProject] = useState<Omit<Project, "id">>({
    title: "",
    goal: "",
    participants: "",
    status: "Amalda",
    description: "",
    image: "",
  });

  const [newGallery, setNewGallery] = useState<Omit<GalleryItem, "id">>({
    title: "",
    date: "",
    description: "",
    image: "",
  });

  const [newVideo, setNewVideo] = useState<Omit<VideoLesson, "id">>({
    title: "",
    subject: "",
    teacher: "",
    url: "",
  });

  const [newAnnouncement, setNewAnnouncement] = useState<
    Omit<Announcement, "id">
  >({
    title: "",
    date: "",
    content: "",
  });

  const [newBirthday, setNewBirthday] = useState<Omit<Birthday, "id">>({
    name: "",
    date: "",
    class: "",
  });

  const [newGpa, setNewGpa] = useState({
    name: "",
    class: "",
    gpa: "",
  });

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = createId();

      setToasts((prev) => [...prev, { id, message, type }]);

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3000);
    },
    []
  );

  const loadAllData = useCallback(() => {
    setTeachers(readStorage<Teacher[]>(STORAGE_KEYS.teachers, []));
    setProjects(readStorage<Project[]>(STORAGE_KEYS.projects, []));
    setGalleryList(
      readStorage<GalleryItem[]>(STORAGE_KEYS.gallery, [])
    );
    setVideoLessons(
      readStorage<VideoLesson[]>(STORAGE_KEYS.videos, [])
    );
    setAnnouncements(
      readStorage<Announcement[]>(STORAGE_KEYS.announcements, [])
    );
    setBirthdays(
      readStorage<Birthday[]>(STORAGE_KEYS.birthdays, [])
    );
    setGpaList(
      readStorage<GPA[]>(STORAGE_KEYS.gpa, [])
    );

    loadMessages();
  }, []);

  const loadMessages = useCallback(() => {
    const keys = [
      "student_proposals",
      "admin_messages",
      "admin_proposals",
      "proposals",
      "messages",
    ];

    const map = new Map<string, Message>();

    keys.forEach((key) => {
      const data = readStorage<Message[]>(key, []);

      if (!Array.isArray(data)) return;

      data.forEach((item, index) => {
        const id = item.id ?? `${key}-${index}`;

        map.set(String(id), {
          ...item,
          id,
        });
      });
    });

    const result = Array.from(map.values()).sort((a, b) => {
      const aId = Number(a.id);
      const bId = Number(b.id);

      if (!Number.isNaN(aId) && !Number.isNaN(bId)) {
        return bId - aId;
      }

      return String(b.id).localeCompare(String(a.id));
    });

    setMessages(result);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    loadAllData();

    const handleUpdate = () => {
      loadAllData();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("admin_data_updated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("admin_data_updated", handleUpdate);
    };
  }, [isAuthenticated, loadAllData]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadAllData();

    window.setTimeout(() => {
      setIsRefreshing(false);
      showToast("Ma'lumotlar yangilandi", "success");
    }, 500);
  };

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();

    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setErrorMsg("");
      setPasswordInput("");
    } else {
      setErrorMsg("Parol noto‘g‘ri!");
    }
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    callback: (base64: string) => void
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Faqat rasm fayllarini yuklash mumkin", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Rasm hajmi 5 MB dan oshmasligi kerak", "error");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      callback(String(reader.result));
    };

    reader.onerror = () => {
      showToast("Rasmni yuklashda xatolik", "error");
    };

    reader.readAsDataURL(file);
  };

  /* =========================
     TEACHERS
  ========================= */

  const resetTeacher = () => {
    setNewTeacher({
      name: "",
      role: "",
      assignedClass: "",
      experience: "",
      bio: "",
      image: "",
    });

    setEditingTeacher(null);
  };

  const handleSaveTeacher = (event: React.FormEvent) => {
    event.preventDefault();

    if (!newTeacher.name.trim()) {
      showToast("O‘qituvchi ismini kiriting", "error");
      return;
    }

    if (editingTeacher) {
      const updated = teachers.map((teacher) =>
        teacher.id === editingTeacher
          ? { ...teacher, ...newTeacher }
          : teacher
      );

      setTeachers(updated);
      writeStorage(STORAGE_KEYS.teachers, updated);
      showToast("O‘qituvchi yangilandi");
    } else {
      const updated = [
        ...teachers,
        {
          id: createId(),
          ...newTeacher,
        },
      ];

      setTeachers(updated);
      writeStorage(STORAGE_KEYS.teachers, updated);
      showToast("O‘qituvchi qo‘shildi");
    }

    resetTeacher();
  };

  const startEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher.id);
    setNewTeacher({
      name: teacher.name,
      role: teacher.role,
      assignedClass: teacher.assignedClass,
      experience: teacher.experience,
      bio: teacher.bio,
      image: teacher.image,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* =========================
     PROJECTS
  ========================= */

  const resetProject = () => {
    setNewProject({
      title: "",
      goal: "",
      participants: "",
      status: "Amalda",
      description: "",
      image: "",
    });

    setEditingProject(null);
  };

  const handleSaveProject = (event: React.FormEvent) => {
    event.preventDefault();

    if (!newProject.title.trim()) {
      showToast("Loyiha nomini kiriting", "error");
      return;
    }

    if (editingProject) {
      const updated = projects.map((project) =>
        project.id === editingProject
          ? { ...project, ...newProject }
          : project
      );

      setProjects(updated);
      writeStorage(STORAGE_KEYS.projects, updated);
      showToast("Loyiha yangilandi");
    } else {
      const updated = [
        ...projects,
        {
          id: createId(),
          ...newProject,
        },
      ];

      setProjects(updated);
      writeStorage(STORAGE_KEYS.projects, updated);
      showToast("Loyiha qo‘shildi");
    }

    resetProject();
  };

  const startEditProject = (project: Project) => {
    setEditingProject(project.id);

    setNewProject({
      title: project.title,
      goal: project.goal,
      participants: project.participants,
      status: project.status,
      description: project.description,
      image: project.image,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* =========================
     GALLERY
  ========================= */

  const resetGallery = () => {
    setNewGallery({
      title: "",
      date: "",
      description: "",
      image: "",
    });

    setEditingGallery(null);
  };

  const handleSaveGallery = (event: React.FormEvent) => {
    event.preventDefault();

    if (!newGallery.title.trim()) {
      showToast("Galereya sarlavhasini kiriting", "error");
      return;
    }

    if (editingGallery) {
      const updated = galleryList.map((item) =>
        item.id === editingGallery
          ? { ...item, ...newGallery }
          : item
      );

      setGalleryList(updated);
      writeStorage(STORAGE_KEYS.gallery, updated);
      showToast("Galereya materiali yangilandi");
    } else {
      const updated = [
        ...galleryList,
        {
          id: createId(),
          ...newGallery,
        },
      ];

      setGalleryList(updated);
      writeStorage(STORAGE_KEYS.gallery, updated);
      showToast("Galereya materiali qo‘shildi");
    }

    resetGallery();
  };

  const startEditGallery = (item: GalleryItem) => {
    setEditingGallery(item.id);

    setNewGallery({
      title: item.title,
      date: item.date,
      description: item.description,
      image: item.image,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* =========================
     VIDEOS
  ========================= */

  const resetVideo = () => {
    setNewVideo({
      title: "",
      subject: "",
      teacher: "",
      url: "",
    });

    setEditingVideo(null);
  };

  const handleSaveVideo = (event: React.FormEvent) => {
    event.preventDefault();

    if (!newVideo.title.trim()) {
      showToast("Video nomini kiriting", "error");
      return;
    }

    if (!newVideo.url.trim()) {
      showToast("YouTube linkini kiriting", "error");
      return;
    }

    const preparedVideo = {
      ...newVideo,
      url: formatYouTubeUrl(newVideo.url),
    };

    if (editingVideo) {
      const updated = videoLessons.map((video) =>
        video.id === editingVideo
          ? { ...video, ...preparedVideo }
          : video
      );

      setVideoLessons(updated);
      writeStorage(STORAGE_KEYS.videos, updated);
      showToast("Video dars yangilandi");
    } else {
      const updated = [
        ...videoLessons,
        {
          id: createId(),
          ...preparedVideo,
        },
      ];

      setVideoLessons(updated);
      writeStorage(STORAGE_KEYS.videos, updated);
      showToast("Video dars qo‘shildi");
    }

    resetVideo();
  };

  const startEditVideo = (video: VideoLesson) => {
    setEditingVideo(video.id);

    setNewVideo({
      title: video.title,
      subject: video.subject,
      teacher: video.teacher,
      url: video.url,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* =========================
     ANNOUNCEMENTS
  ========================= */

  const resetAnnouncement = () => {
    setNewAnnouncement({
      title: "",
      date: "",
      content: "",
    });

    setEditingAnnouncement(null);
  };

  const handleSaveAnnouncement = (event: React.FormEvent) => {
    event.preventDefault();

    if (!newAnnouncement.title.trim()) {
      showToast("E'lon sarlavhasini kiriting", "error");
      return;
    }

    if (editingAnnouncement) {
      const updated = announcements.map((item) =>
        item.id === editingAnnouncement
          ? { ...item, ...newAnnouncement }
          : item
      );

      setAnnouncements(updated);
      writeStorage(STORAGE_KEYS.announcements, updated);
      showToast("E'lon yangilandi");
    } else {
      const updated = [
        ...announcements,
        {
          id: createId(),
          ...newAnnouncement,
        },
      ];

      setAnnouncements(updated);
      writeStorage(STORAGE_KEYS.announcements, updated);
      showToast("E'lon qo‘shildi");
    }

    resetAnnouncement();
  };

  const startEditAnnouncement = (item: Announcement) => {
    setEditingAnnouncement(item.id);

    setNewAnnouncement({
      title: item.title,
      date: item.date,
      content: item.content,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* =========================
     BIRTHDAYS
  ========================= */

  const resetBirthday = () => {
    setNewBirthday({
      name: "",
      date: "",
      class: "",
    });

    setEditingBirthday(null);
  };

  const handleSaveBirthday = (event: React.FormEvent) => {
    event.preventDefault();

    if (!newBirthday.name.trim()) {
      showToast("Ism Familiyani kiriting", "error");
      return;
    }

    if (editingBirthday) {
      const updated = birthdays.map((item) =>
        item.id === editingBirthday
          ? { ...item, ...newBirthday }
          : item
      );

      setBirthdays(updated);
      writeStorage(STORAGE_KEYS.birthdays, updated);
      showToast("Tug‘ilgan kun ma'lumoti yangilandi");
    } else {
      const updated = [
        ...birthdays,
        {
          id: createId(),
          ...newBirthday,
        },
      ];

      setBirthdays(updated);
      writeStorage(STORAGE_KEYS.birthdays, updated);
      showToast("Tug‘ilgan kun qo‘shildi");
    }

    resetBirthday();
  };

  const startEditBirthday = (item: Birthday) => {
    setEditingBirthday(item.id);

    setNewBirthday({
      name: item.name,
      date: item.date,
      class: item.class,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* =========================
     GPA
  ========================= */

  const resetGpa = () => {
    setNewGpa({
      name: "",
      class: "",
      gpa: "",
    });

    setEditingGpa(null);
  };

  const handleSaveGpa = (event: React.FormEvent) => {
    event.preventDefault();

    if (!newGpa.name.trim()) {
      showToast("O‘quvchi ismini kiriting", "error");
      return;
    }

    const gpaValue = Number(newGpa.gpa);

    if (Number.isNaN(gpaValue) || gpaValue < 0 || gpaValue > 5) {
      showToast("GPA 0 dan 5 gacha bo‘lishi kerak", "error");
      return;
    }

    if (editingGpa) {
      const updated = gpaList
        .map((item) =>
          item.id === editingGpa
            ? {
                ...item,
                name: newGpa.name,
                class: newGpa.class,
                gpa: gpaValue,
              }
            : item
        )
        .sort((a, b) => b.gpa - a.gpa);

      setGpaList(updated);
      writeStorage(STORAGE_KEYS.gpa, updated);
      showToast("GPA yangilandi");
    } else {
      const updated = [
        ...gpaList,
        {
          id: createId(),
          name: newGpa.name,
          class: newGpa.class,
          gpa: gpaValue,
        },
      ].sort((a, b) => b.gpa - a.gpa);

      setGpaList(updated);
      writeStorage(STORAGE_KEYS.gpa, updated);
      showToast("GPA qo‘shildi");
    }

    resetGpa();
  };

  const startEditGpa = (item: GPA) => {
    setEditingGpa(item.id);

    setNewGpa({
      name: item.name,
      class: item.class,
      gpa: String(item.gpa),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* =========================
     DELETE
  ========================= */

  const requestDelete = (type: string, id: ID | string) => {
    setDeleteTarget({ type, id });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    const { type, id } = deleteTarget;

    if (type === "teacher") {
      const updated = teachers.filter((item) => item.id !== id);
      setTeachers(updated);
      writeStorage(STORAGE_KEYS.teachers, updated);
    }

    if (type === "project") {
      const updated = projects.filter((item) => item.id !== id);
      setProjects(updated);
      writeStorage(STORAGE_KEYS.projects, updated);
    }

    if (type === "gallery") {
      const updated = galleryList.filter((item) => item.id !== id);
      setGalleryList(updated);
      writeStorage(STORAGE_KEYS.gallery, updated);
    }

    if (type === "video") {
      const updated = videoLessons.filter((item) => item.id !== id);
      setVideoLessons(updated);
      writeStorage(STORAGE_KEYS.videos, updated);
    }

    if (type === "announcement") {
      const updated = announcements.filter((item) => item.id !== id);
      setAnnouncements(updated);
      writeStorage(STORAGE_KEYS.announcements, updated);
    }

    if (type === "birthday") {
      const updated = birthdays.filter((item) => item.id !== id);
      setBirthdays(updated);
      writeStorage(STORAGE_KEYS.birthdays, updated);
    }

    if (type === "gpa") {
      const updated = gpaList.filter((item) => item.id !== id);
      setGpaList(updated);
      writeStorage(STORAGE_KEYS.gpa, updated);
    }

    if (type === "message") {
      const keys = [
        "student_proposals",
        "admin_messages",
        "admin_proposals",
        "proposals",
        "messages",
      ];

      keys.forEach((key) => {
        const current = readStorage<Message[]>(key, []);

        const updated = current.filter(
          (item, index) => String(item.id ?? index) !== String(id)
        );

        writeStorage(key, updated);
      });

      loadMessages();
    }

    setDeleteTarget(null);
    showToast("Ma'lumot o‘chirildi");
  };

  /* =========================
     SEARCH
  ========================= */

  const filteredTeachers = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return teachers;

    return teachers.filter((item) =>
      `${item.name} ${item.role} ${item.assignedClass}`
        .toLowerCase()
        .includes(q)
    );
  }, [teachers, search]);

  const filteredProjects = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return projects;

    return projects.filter((item) =>
      `${item.title} ${item.goal} ${item.status}`
        .toLowerCase()
        .includes(q)
    );
  }, [projects, search]);

  const filteredGallery = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return galleryList;

    return galleryList.filter((item) =>
      `${item.title} ${item.description} ${item.date}`
        .toLowerCase()
        .includes(q)
    );
  }, [galleryList, search]);

  const filteredVideos = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return videoLessons;

    return videoLessons.filter((item) =>
      `${item.title} ${item.subject} ${item.teacher}`
        .toLowerCase()
        .includes(q)
    );
  }, [videoLessons, search]);

  const filteredAnnouncements = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return announcements;

    return announcements.filter((item) =>
      `${item.title} ${item.content} ${item.date}`
        .toLowerCase()
        .includes(q)
    );
  }, [announcements, search]);

  const filteredBirthdays = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return birthdays;

    return birthdays.filter((item) =>
      `${item.name} ${item.class} ${item.date}`
        .toLowerCase()
        .includes(q)
    );
  }, [birthdays, search]);

  const filteredGpa = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return gpaList;

    return gpaList.filter((item) =>
      `${item.name} ${item.class} ${item.gpa}`
        .toLowerCase()
        .includes(q)
    );
  }, [gpaList, search]);

  /* =========================
     DASHBOARD
  ========================= */

  const stats = [
    {
      label: "O‘qituvchilar",
      value: teachers.length,
      icon: Users,
    },
    {
      label: "Loyihalar",
      value: projects.length,
      icon: Rocket,
    },
    {
      label: "Galereya",
      value: galleryList.length,
      icon: ImageIcon,
    },
    {
      label: "Video darslar",
      value: videoLessons.length,
      icon: Video,
    },
    {
      label: "E'lonlar",
      value: announcements.length,
      icon: Bell,
    },
    {
      label: "GPA",
      value: gpaList.length,
      icon: Trophy,
    },
    {
      label: "Murojaatlar",
      value: messages.length,
      icon: MessageSquare,
    },
  ];

  /* =========================
     LOGIN
  ========================= */

  if (!isAuthenticated) {
    return (
      <>
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-7">
              <div className="h-16 w-16 rounded-2xl bg-blue-50 text-[#0071e3] flex items-center justify-center mb-4">
                <ShieldCheck className="h-8 w-8" />
              </div>

              <h2 className="text-2xl font-bold text-[#1d1d1f]">
                Admin Panel
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Davom etish uchun admin parolini kiriting
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMsg("");
                    }}
                    placeholder="Admin paroli"
                    autoFocus
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071e3] focus:bg-white transition"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-500 mt-2 font-medium">
                    {errorMsg}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#0071e3] text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
              >
                Kirish
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  /* =========================
     SIDEBAR
  ========================= */

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: ShieldCheck,
    },
    {
      id: "teachers",
      label: "O'qituvchilar",
      icon: Users,
    },
    {
      id: "projects",
      label: "Innovatsiya",
      icon: Rocket,
    },
    {
      id: "gallery",
      label: "Galereya",
      icon: ImageIcon,
    },
    {
      id: "videos",
      label: "Video Darslar",
      icon: Video,
    },
    {
      id: "announcements",
      label: "E'lonlar",
      icon: Bell,
    },
    {
      id: "birthdays",
      label: "Tug'ilgan kunlar",
      icon: Cake,
    },
    {
      id: "gpa",
      label: "GPA Reytingi",
      icon: Trophy,
    },
    {
      id: "messages",
      label: "Murojaatlar",
      icon: MessageSquare,
      badge: messages.length,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-[#f5f5f7] flex overflow-hidden">
      {/* TOASTS */}
      <div className="fixed top-5 right-5 z-[200] space-y-2 w-[320px] max-w-[calc(100vw-32px)]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-2xl px-4 py-3 shadow-xl border bg-white flex items-start gap-3 ${
              toast.type === "error"
                ? "border-red-100"
                : toast.type === "info"
                ? "border-blue-100"
                : "border-green-100"
            }`}
          >
            <div
              className={`mt-0.5 h-2.5 w-2.5 rounded-full shrink-0 ${
                toast.type === "error"
                  ? "bg-red-500"
                  : toast.type === "info"
                  ? "bg-blue-500"
                  : "bg-green-500"
              }`}
            />

            <p className="text-sm text-gray-700 font-medium">
              {toast.message}
            </p>
          </div>
        ))}
      </div>

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
                <AlertTriangle className="h-7 w-7" />
              </div>

              <h3 className="text-lg font-bold text-[#1d1d1f]">
                O‘chirishni tasdiqlaysizmi?
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Bu amalni bekor qilib bo‘lmaydi.
              </p>

              <div className="flex gap-3 w-full mt-6">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition"
                >
                  Bekor qilish
                </button>

                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition"
                >
                  O‘chirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 text-[#0071e3] flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div>
                <h1 className="font-bold text-[#1d1d1f] text-sm">
                  Admin Panel
                </h1>

                <p className="text-xs text-gray-400">
                  Jizzax 1-son IMI
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSearch("");
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition ${
                  active
                    ? "bg-[#0071e3] text-white shadow-md shadow-blue-500/20"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
                      active
                        ? "bg-white text-[#0071e3]"
                        : "bg-blue-50 text-[#0071e3]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setActiveTab("dashboard");
            }}
            className="w-full flex items-center gap-3 px-3.5 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition"
          >
            <LogOut className="h-5 w-5" />
            Chiqish
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
        {/* MOBILE HEADER */}
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-[#1d1d1f]">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-400">
                Jizzax 1-son IMI
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleManualRefresh}
                className="p-2 rounded-xl bg-gray-50 text-gray-600"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-gray-50 text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-xl text-xs font-semibold ${
                    activeTab === item.id
                      ? "bg-[#0071e3] text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-[1500px] mx-auto">
          {/* TOP BAR */}
          {activeTab !== "dashboard" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1d1d1f]">
                  {menuItems.find((item) => item.id === activeTab)?.label}
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Ma'lumotlarni boshqarish
                </p>
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Qidirish..."
                    className="w-full sm:w-56 pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0071e3]"
                  />
                </div>

                <button
                  onClick={handleManualRefresh}
                  className="px-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50"
                  title="Yangilash"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      isRefreshing ? "animate-spin text-[#0071e3]" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-7">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#1d1d1f]">
                    Xush kelibsiz 👋
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Maktab saytining barcha ma'lumotlarini shu yerdan
                    boshqaring.
                  </p>
                </div>

                <button
                  onClick={handleManualRefresh}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      isRefreshing ? "animate-spin" : ""
                    }`}
                  />
                  Yangilash
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <button
                      key={stat.label}
                      onClick={() => {
                        const target = menuItems.find(
                          (item) => item.label === stat.label
                        );

                        if (target) setActiveTab(target.id);
                      }}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#0071e3] flex items-center justify-center">
                          <Icon className="h-5 w-5" />
                        </div>

                        <span className="text-2xl font-extrabold text-[#1d1d1f]">
                          {stat.value}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-gray-500 mt-4">
                        {stat.label}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="font-bold text-[#1d1d1f]">
                    Tezkor ma'lumot
                  </h3>

                  <div className="mt-5 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        O‘rtacha GPA
                      </span>

                      <strong className="text-[#0071e3]">
                        {gpaList.length
                          ? (
                              gpaList.reduce(
                                (sum, item) => sum + Number(item.gpa),
                                0
                              ) / gpaList.length
                            ).toFixed(2)
                          : "0.00"}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        Tug‘ilgan kunlar
                      </span>

                      <strong>{birthdays.length}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        Ochiq murojaatlar
                      </span>

                      <strong className="text-red-500">
                        {messages.length}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#0071e3] to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
                  <ShieldCheck className="h-8 w-8 mb-4" />

                  <h3 className="text-xl font-bold">
                    Admin boshqaruv markazi
                  </h3>

                  <p className="text-sm text-blue-100 mt-2 leading-relaxed">
                    Sayt tarkibidagi o‘qituvchilar, loyihalar, media,
                    e'lonlar va o‘quvchilar ma'lumotlarini boshqarishingiz
                    mumkin.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TEACHERS */}
          {activeTab === "teachers" && (
            <div className="space-y-6">
              <form
                onSubmit={handleSaveTeacher}
                className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#1d1d1f]">
                    {editingTeacher
                      ? "O‘qituvchini tahrirlash"
                      : "Yangi o‘qituvchi qo‘shish"}
                  </h3>

                  {editingTeacher && (
                    <button
                      type="button"
                      onClick={resetTeacher}
                      className="text-xs text-gray-500 hover:text-red-500"
                    >
                      Bekor qilish
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    value={newTeacher.name}
                    onChange={(e) =>
                      setNewTeacher({
                        ...newTeacher,
                        name: e.target.value,
                      })
                    }
                    placeholder="Ism Familiya"
                    className="input"
                  />

                  <input
                    value={newTeacher.role}
                    onChange={(e) =>
                      setNewTeacher({
                        ...newTeacher,
                        role: e.target.value,
                      })
                    }
                    placeholder="Lavozimi / Fani"
                    className="input"
                  />

                  <input
                    value={newTeacher.assignedClass}
                    onChange={(e) =>
                      setNewTeacher({
                        ...newTeacher,
                        assignedClass: e.target.value,
                      })
                    }
                    placeholder="Biriktirilgan sinf"
                    className="input"
                  />

                  <input
                    value={newTeacher.experience}
                    onChange={(e) =>
                      setNewTeacher({
                        ...newTeacher,
                        experience: e.target.value,
                      })
                    }
                    placeholder="Ish staji"
                    className="input"
                  />
                </div>

                <textarea
                  value={newTeacher.bio}
                  onChange={(e) =>
                    setNewTeacher({
                      ...newTeacher,
                      bio: e.target.value,
                    })
                  }
                  placeholder="Biografiya va yutuqlar..."
                  rows={3}
                  className="input w-full"
                />

                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100">
                    <Upload className="h-4 w-4" />
                    Rasm yuklash
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(e, (image) =>
                          setNewTeacher({
                            ...newTeacher,
                            image,
                          })
                        )
                      }
                    />
                  </label>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0071e3] text-white rounded-xl text-sm font-semibold"
                  >
                    {editingTeacher ? (
                      <>
                        <Save className="h-4 w-4" />
                        Saqlash
                      </>
                    ) : (
                      "Qo‘shish"
                    )}
                  </button>
                </div>
              </form>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex justify-between">
                      <div className="flex gap-3">
                        {teacher.image ? (
                          <img
                            src={teacher.image}
                            alt={teacher.name}
                            className="h-14 w-14 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-2xl bg-blue-50 text-[#0071e3] flex items-center justify-center font-bold">
                            {teacher.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <h4 className="font-bold text-sm">
                            {teacher.name}
                          </h4>

                          <p className="text-xs text-blue-600 mt-1">
                            {teacher.role || "Lavozim ko‘rsatilmagan"}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {teacher.assignedClass || "Sinf yo‘q"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditTeacher(teacher)}
                          className="p-2 text-gray-400 hover:text-[#0071e3]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            requestDelete("teacher", teacher.id)
                          }
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {teacher.experience && (
                      <p className="text-xs text-gray-400 mt-4">
                        Staj: {teacher.experience}
                      </p>
                    )}

                    {teacher.bio && (
                      <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-50 line-clamp-3">
                        {teacher.bio}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <form
                onSubmit={handleSaveProject}
                className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4"
              >
                <div className="flex justify-between">
                  <h3 className="font-bold">
                    {editingProject
                      ? "Loyihani tahrirlash"
                      : "Yangi innovatsion loyiha"}
                  </h3>

                  {editingProject && (
                    <button
                      type="button"
                      onClick={resetProject}
                      className="text-xs text-gray-500"
                    >
                      Bekor qilish
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    value={newProject.title}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        title: e.target.value,
                      })
                    }
                    placeholder="Loyiha nomi"
                    className="input"
                  />

                  <input
                    value={newProject.goal}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        goal: e.target.value,
                      })
                    }
                    placeholder="Loyiha maqsadi"
                    className="input"
                  />

                  <input
                    value={newProject.participants}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        participants: e.target.value,
                      })
                    }
                    placeholder="Qatnashchilar"
                    className="input"
                  />

                  <select
                    value={newProject.status}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        status: e.target.value,
                      })
                    }
                    className="input"
                  >
                    <option>Amalda</option>
                    <option>Qilinmoqda</option>
                    <option>Tugallangan</option>
                  </select>
                </div>

                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  placeholder="Loyiha haqida..."
                  rows={3}
                  className="input w-full"
                />

                <div className="flex justify-between gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Rasm
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(e, (image) =>
                          setNewProject({
                            ...newProject,
                            image,
                          })
                        )
                      }
                    />
                  </label>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0071e3] text-white rounded-xl text-sm font-semibold"
                  >
                    {editingProject ? "Saqlash" : "Qo‘shish"}
                  </button>
                </div>
              </form>

              <div className="grid md:grid-cols-2 gap-5">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    {project.image && (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-44 object-cover"
                      />
                    )}

                    <div className="p-5">
                      <div className="flex justify-between gap-3">
                        <h4 className="font-bold">
                          {project.title}
                        </h4>

                        <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-[#0071e3] font-semibold h-fit">
                          {project.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-3">
                        <strong>Maqsad:</strong> {project.goal}
                      </p>

                      <p className="text-xs text-gray-500 mt-2">
                        <strong>Qatnashchilar:</strong>{" "}
                        {project.participants}
                      </p>

                      {project.description && (
                        <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 mt-3">
                          {project.description}
                        </p>
                      )}

                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={() => startEditProject(project)}
                          className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:text-[#0071e3]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            requestDelete("project", project.id)
                          }
                          className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GALLERY */}
          {activeTab === "gallery" && (
            <div className="space-y-6">
              <form
                onSubmit={handleSaveGallery}
                className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4"
              >
                <div className="flex justify-between">
                  <h3 className="font-bold">
                    {editingGallery
                      ? "Materialni tahrirlash"
                      : "Yangi galereya materiali"}
                  </h3>

                  {editingGallery && (
                    <button
                      type="button"
                      onClick={resetGallery}
                      className="text-xs text-gray-500"
                    >
                      Bekor qilish
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    value={newGallery.title}
                    onChange={(e) =>
                      setNewGallery({
                        ...newGallery,
                        title: e.target.value,
                      })
                    }
                    placeholder="Sarlavha"
                    className="input"
                  />

                  <input
                    value={newGallery.date}
                    onChange={(e) =>
                      setNewGallery({
                        ...newGallery,
                        date: e.target.value,
                      })
                    }
                    placeholder="Sana"
                    className="input"
                  />
                </div>

                <textarea
                  value={newGallery.description}
                  onChange={(e) =>
                    setNewGallery({
                      ...newGallery,
                      description: e.target.value,
                    })
                  }
                  placeholder="Tavsif"
                  rows={3}
                  className="input w-full"
                />

                <div className="flex justify-between gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Rasm yuklash
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(e, (image) =>
                          setNewGallery({
                            ...newGallery,
                            image,
                          })
                        )
                      }
                    />
                  </label>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0071e3] text-white rounded-xl text-sm font-semibold"
                  >
                    {editingGallery ? "Saqlash" : "Qo‘shish"}
                  </button>
                </div>
              </form>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGallery.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-44 object-cover"
                      />
                    )}

                    <div className="p-4">
                      <h4 className="font-bold text-sm">
                        {item.title}
                      </h4>

                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.date}
                      </p>

                      {item.description && (
                        <p className="text-xs text-gray-500 mt-3 line-clamp-3">
                          {item.description}
                        </p>
                      )}

                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={() => startEditGallery(item)}
                          className="p-2 bg-gray-50 rounded-lg text-gray-500 hover:text-[#0071e3]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            requestDelete("gallery", item.id)
                          }
                          className="p-2 bg-gray-50 rounded-lg text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIDEOS */}
          {activeTab === "videos" && (
            <div className="space-y-6">
              <form
                onSubmit={handleSaveVideo}
                className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4"
              >
                <div className="flex justify-between">
                  <h3 className="font-bold">
                    {editingVideo
                      ? "Video darsni tahrirlash"
                      : "Yangi video dars"}
                  </h3>

                  {editingVideo && (
                    <button
                      type="button"
                      onClick={resetVideo}
                      className="text-xs text-gray-500"
                    >
                      Bekor qilish
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    value={newVideo.title}
                    onChange={(e) =>
                      setNewVideo({
                        ...newVideo,
                        title: e.target.value,
                      })
                    }
                    placeholder="Video nomi"
                    className="input"
                  />

                  <input
                    value={newVideo.subject}
                    onChange={(e) =>
                      setNewVideo({
                        ...newVideo,
                        subject: e.target.value,
                      })
                    }
                    placeholder="Fan"
                    className="input"
                  />

                  <input
                    value={newVideo.teacher}
                    onChange={(e) =>
                      setNewVideo({
                        ...newVideo,
                        teacher: e.target.value,
                      })
                    }
                    placeholder="Ustoz"
                    className="input"
                  />
                </div>

                <input
                  value={newVideo.url}
                  onChange={(e) =>
                    setNewVideo({
                      ...newVideo,
                      url: e.target.value,
                    })
                  }
                  placeholder="YouTube link"
                  className="input w-full"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0071e3] text-white rounded-xl text-sm font-semibold"
                  >
                    {editingVideo ? "Saqlash" : "Qo‘shish"}
                  </button>
                </div>
              </form>

              <div className="grid md:grid-cols-2 gap-5">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                  >
                    <div className="aspect-video bg-black rounded-xl overflow-hidden">
                      <iframe
                        src={video.url}
                        title={video.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>

                    <div className="mt-4 flex justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm">
                          {video.title}
                        </h4>

                        <p className="text-xs text-gray-500 mt-1">
                          {video.subject} • {video.teacher}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditVideo(video)}
                          className="p-2 text-gray-400 hover:text-[#0071e3]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            requestDelete("video", video.id)
                          }
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS */}
          {activeTab === "announcements" && (
            <div className="space-y-6">
              <form
                onSubmit={handleSaveAnnouncement}
                className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4"
              >
                <div className="flex justify-between">
                  <h3 className="font-bold">
                    {editingAnnouncement
                      ? "E'lonni tahrirlash"
                      : "Yangi e'lon"}
                  </h3>

                  {editingAnnouncement && (
                    <button
                      type="button"
                      onClick={resetAnnouncement}
                      className="text-xs text-gray-500"
                    >
                      Bekor qilish
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        title: e.target.value,
                      })
                    }
                    placeholder="Sarlavha"
                    className="input"
                  />

                  <input
                    value={newAnnouncement.date}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        date: e.target.value,
                      })
                    }
                    placeholder="Sana"
                    className="input"
                  />
                </div>

                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      content: e.target.value,
                    })
                  }
                  placeholder="E'lon matni"
                  rows={4}
                  className="input w-full"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0071e3] text-white rounded-xl text-sm font-semibold"
                  >
                    {editingAnnouncement ? "Saqlash" : "Qo‘shish"}
                  </button>
                </div>
              </form>

              <div className="grid md:grid-cols-2 gap-5">
                {filteredAnnouncements.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold">
                          <Bell className="h-4 w-4" />
                          {item.date}
                        </div>

                        <h4 className="font-bold mt-2">
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            startEditAnnouncement(item)
                          }
                          className="p-2 text-gray-400 hover:text-[#0071e3]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            requestDelete("announcement", item.id)
                          }
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 mt-4 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BIRTHDAYS */}
          {activeTab === "birthdays" && (
            <div className="space-y-6">
              <form
                onSubmit={handleSaveBirthday}
                className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4"
              >
                <div className="flex justify-between">
                  <h3 className="font-bold">
                    {editingBirthday
                      ? "Tug‘ilgan kunni tahrirlash"
                      : "Yangi tug‘ilgan kun"}
                  </h3>

                  {editingBirthday && (
                    <button
                      type="button"
                      onClick={resetBirthday}
                      className="text-xs text-gray-500"
                    >
                      Bekor qilish
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    value={newBirthday.name}
                    onChange={(e) =>
                      setNewBirthday({
                        ...newBirthday,
                        name: e.target.value,
                      })
                    }
                    placeholder="Ism Familiya"
                    className="input"
                  />

                  <input
                    value={newBirthday.date}
                    onChange={(e) =>
                      setNewBirthday({
                        ...newBirthday,
                        date: e.target.value,
                      })
                    }
                    placeholder="Sana"
                    className="input"
                  />

                  <input
                    value={newBirthday.class}
                    onChange={(e) =>
                      setNewBirthday({
                        ...newBirthday,
                        class: e.target.value,
                      })
                    }
                    placeholder="Sinf"
                    className="input"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0071e3] text-white rounded-xl text-sm font-semibold"
                  >
                    {editingBirthday ? "Saqlash" : "Qo‘shish"}
                  </button>
                </div>
              </form>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBirthdays.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center">
                        <Cake className="h-5 w-5" />
                      </div>

                      <div>
                        <h4 className="font-bold text-sm">
                          {item.name}
                        </h4>

                        <p className="text-xs text-gray-400 mt-1">
                          {item.date} • {item.class}
                        </p>
                      </div>
                    </div>

                    <div className="flex">
                      <button
                        onClick={() => startEditBirthday(item)}
                        className="p-2 text-gray-400 hover:text-[#0071e3]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() =>
                          requestDelete("birthday", item.id)
                        }
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GPA */}
          {activeTab === "gpa" && (
            <div className="space-y-6">
              <form
                onSubmit={handleSaveGpa}
                className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4"
              >
                <div className="flex justify-between">
                  <h3 className="font-bold">
                    {editingGpa
                      ? "GPA ma'lumotini tahrirlash"
                      : "O‘quvchi GPA balini kiritish"}
                  </h3>

                  {editingGpa && (
                    <button
                      type="button"
                      onClick={resetGpa}
                      className="text-xs text-gray-500"
                    >
                      Bekor qilish
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    value={newGpa.name}
                    onChange={(e) =>
                      setNewGpa({
                        ...newGpa,
                        name: e.target.value,
                      })
                    }
                    placeholder="Ism Familiya"
                    className="input"
                  />

                  <input
                    value={newGpa.class}
                    onChange={(e) =>
                      setNewGpa({
                        ...newGpa,
                        class: e.target.value,
                      })
                    }
                    placeholder="Sinf"
                    className="input"
                  />

                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.01"
                    value={newGpa.gpa}
                    onChange={(e) =>
                      setNewGpa({
                        ...newGpa,
                        gpa: e.target.value,
                      })
                    }
                    placeholder="GPA: 4.86"
                    className="input"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0071e3] text-white rounded-xl text-sm font-semibold"
                  >
                    {editingGpa ? "Saqlash" : "Qo‘shish"}
                  </button>
                </div>
              </form>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    O‘quvchilar reytingi
                  </span>

                  <span className="text-xs text-gray-400">
                    Jami: {gpaList.length}
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {filteredGpa.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-xs">
                          #{index + 1}
                        </div>

                        <div>
                          <h4 className="font-bold text-sm">
                            {item.name}
                          </h4>

                          <p className="text-xs text-gray-400 mt-1">
                            {item.class}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-lg font-extrabold text-[#0071e3]">
                            {Number(item.gpa).toFixed(2)}
                          </span>

                          <span className="text-xs text-gray-400">
                            {" "}
                            / 5.0
                          </span>
                        </div>

                        <button
                          onClick={() => startEditGpa(item)}
                          className="p-2 text-gray-400 hover:text-[#0071e3]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            requestDelete("gpa", item.id)
                          }
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {!filteredGpa.length && (
                    <div className="p-10 text-center text-sm text-gray-400">
                      GPA ma'lumotlari topilmadi.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {activeTab === "messages" && (
            <div className="space-y-5">
              {messages.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
                    <Inbox className="h-7 w-7" />
                  </div>

                  <h3 className="font-bold mt-4">
                    Hozircha murojaatlar yo‘q
                  </h3>

                  <p className="text-sm text-gray-400 mt-1">
                    Sayt orqali yuborilgan murojaatlar shu yerda
                    ko‘rinadi.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.id}-${index}`}
                      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-sm">
                            {message.full_name ||
                              message.name ||
                              "Anonim foydalanuvchi"}
                          </h4>

                          {message.date && (
                            <p className="text-xs text-gray-400 mt-1">
                              {message.date}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() =>
                            requestDelete("message", message.id)
                          }
                          className="p-2 text-gray-300 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed">
                        {message.description ||
                          message.message ||
                          "Xabar matni yo‘q"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .input {
          padding: 10px 14px;
          font-size: 14px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          outline: none;
          background: white;
          transition: 0.2s;
        }

        .input:focus {
          border-color: #0071e3;
          box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.08);
        }
      `}</style>
    </div>
  );
}