import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Settings,
  LayoutDashboard,
  ListOrdered,
  Calendar,
  LogOut,
  User,
  Trash2,
  Edit2,
  X,
  Check,
  Copy,
  Lock,
  Key,
  Shield,
  Users,
  Eye,
  EyeOff,
  Download,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// --- SABİTLER ---
const MONTHS = [
  { value: "01", label: "Ocak" },
  { value: "02", label: "Şubat" },
  { value: "03", label: "Mart" },
  { value: "04", label: "Nisan" },
  { value: "05", label: "Mayıs" },
  { value: "06", label: "Haziran" },
  { value: "07", label: "Temmuz" },
  { value: "08", label: "Ağustos" },
  { value: "09", label: "Eylül" },
  { value: "10", label: "Ekim" },
  { value: "11", label: "Kasım" },
  { value: "12", label: "Aralık" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => String(currentYear - 3 + i));

const DEFAULT_CATEGORIES = [
  { id: "1", name: "KİRA", type: "GİDER" },
  { id: "2", name: "AİDAT", type: "GİDER" },
  { id: "3", name: "YOL", type: "GELİR" },
  { id: "4", name: "MAAŞ", type: "GELİR" },
  { id: "5", name: "GARANTİ", type: "GİDER" },
  { id: "6", name: "AKBANK", type: "GİDER" },
  { id: "7", name: "NAKİT", type: "GİDER" },
  { id: "8", name: "EK GELİR", type: "GELİR" },
  { id: "9", name: "MARKET", type: "GİDER" },
];

const CITIES = [
  { name: "Bursa", lat: 40.1824, lon: 29.0669 },
  { name: "İstanbul", lat: 41.0082, lon: 28.9784 },
  { name: "İzmir", lat: 38.4192, lon: 27.1287 },
];

// --- HAVA DURUMU VE ARKA PLAN MOTORU ---
const WeatherBackground = ({ city, override, systemBgColor, userBgImage }) => {
  const [weatherData, setWeatherData] = useState({ type: "clear", temp: null });
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!city) return;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`,
    )
      .then((res) => res.json())
      .then((data) => {
        const code = data.current_weather.weathercode;
        const temp = data.current_weather.temperature;
        let type = "clear";

        if ([71, 73, 75, 77, 85, 86].includes(code)) type = "snow";
        else if (
          [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)
        )
          type = "rain";
        else if ([1, 2, 3, 45, 48].includes(code)) type = "clouds";

        setWeatherData({ type, temp });
      })
      .catch((err) => console.error("Hava durumu çekilemedi", err));
  }, [city]);

  const displayType = override === "auto" ? weatherData.type : override;
  const temp = weatherData.temp;

  useEffect(() => {
    const newParticles = Array.from({
      length: displayType === "rain" ? 80 : displayType === "snow" ? 60 : 10,
    }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `-${Math.random() * 20 + 10}vh`,
      duration:
        displayType === "rain"
          ? Math.random() * 0.5 + 0.5
          : Math.random() * 3 + 3,
      delay: Math.random() * 2,
      size:
        displayType === "rain" ? Math.random() * 2 + 1 : Math.random() * 4 + 3,
      opacity: Math.random() * 0.5 + 0.3,
    }));
    setParticles(newParticles);
  }, [displayType]);

  const bgGradients = {
    snow: "linear-gradient(-45deg, #7dd3fc, #bae6fd, #e2e8f0, #7dd3fc)",
    rain: "linear-gradient(-45deg, #64748b, #94a3b8, #cbd5e1, #64748b)",
    clouds: "linear-gradient(-45deg, #cbd5e1, #e2e8f0, #f1f5f9, #cbd5e1)",
    clear: "linear-gradient(-45deg, #f0fdfa, #fefce8, #fff1f2, #e0e7ff)",
  };

  const weatherIcons = { snow: "❄️", rain: "🌧️", clouds: "☁️", clear: "☀️" };

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <style>{`
        @keyframes dynamic-weather-bg { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes fall-down { to { transform: translateY(120vh); } }
        @keyframes drift { 0% { transform: translate(0, -10vh); } 50% { transform: translate(30px, 50vh); } 100% { transform: translate(-20px, 120vh); } }
        @keyframes float-cloud { 0% { transform: translateX(-5%) translateY(0); } 50% { transform: translateX(5%) translateY(20px); } 100% { transform: translateX(-5%) translateY(0); } }
        
        .bg-weather-animate { 
          position: absolute; inset: 0;
          background-size: 400% 400%; 
          animation: dynamic-weather-bg 15s ease infinite; 
          background-image: ${bgGradients[displayType]}; 
          transition: background-image 2s ease; 
        }
      `}</style>

      {/* 1. KATMAN: ZEMİN (FOTOĞRAF VEYA SİSTEM RENGİ VEYA HAVA DURUMU RENGİ) */}
      {userBgImage ? (
        <div className="absolute inset-0">
          <img
            src={userBgImage}
            alt="bg"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        </div>
      ) : systemBgColor && systemBgColor !== "default" ? (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            systemBgColor === "gece"
              ? "from-slate-900 via-indigo-950 to-slate-900"
              : systemBgColor === "doga"
                ? "from-emerald-900 via-teal-950 to-green-900"
                : systemBgColor === "gunbatimi"
                  ? "from-rose-900 via-red-950 to-orange-900"
                  : "from-gray-900 via-black to-gray-900"
          }`}
        ></div>
      ) : (
        <div className="bg-weather-animate"></div>
      )}

      {/* 2. KATMAN: HAVA DURUMU EFEKTLERİ (HER ZAMAN GÖRÜNÜR) */}
      <div className="absolute inset-0 z-0">
        {displayType === "rain" &&
          particles.map((p) => (
            <div
              key={p.id}
              className="absolute bg-slate-400 rounded-full"
              style={{
                left: p.left,
                top: p.top,
                width: p.size + "px",
                height: p.size * 12 + "px",
                opacity: p.opacity,
                animation: `fall-down ${p.duration}s linear infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}

        {displayType === "snow" &&
          particles.map((p) => (
            <div
              key={p.id}
              className="absolute bg-white rounded-full shadow-md"
              style={{
                left: p.left,
                top: p.top,
                width: p.size + 2 + "px",
                height: p.size + 2 + "px",
                opacity: p.opacity + 0.4,
                animation: `drift ${p.duration}s linear infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}

        {displayType === "clouds" && (
          <>
            <div
              className="absolute top-10 left-10 w-96 h-40 bg-white/40 blur-3xl rounded-full"
              style={{ animation: "float-cloud 20s ease-in-out infinite" }}
            ></div>
            <div
              className="absolute top-40 right-20 w-[30rem] h-60 bg-white/30 blur-3xl rounded-full"
              style={{
                animation: "float-cloud 25s ease-in-out infinite reverse",
              }}
            ></div>
          </>
        )}

        {displayType === "clear" && (
          <>
            <div
              className="absolute -top-20 -right-20 w-96 h-96 bg-amber-200/20 blur-3xl rounded-full"
              style={{ animation: "float-cloud 15s ease-in-out infinite" }}
            ></div>
            <div
              className="absolute bottom-10 left-10 w-64 h-64 bg-orange-200/10 blur-3xl rounded-full"
              style={{
                animation: "float-cloud 18s ease-in-out infinite reverse",
              }}
            ></div>
          </>
        )}
      </div>

      {/* HAVA DURUMU KARTI */}
      {temp !== null && (
        <div className="fixed bottom-6 right-6 z-50 bg-white/70 backdrop-blur-md border border-white/60 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-3 pointer-events-auto transition-transform hover:scale-105">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {city?.name || "BURSA"} {override !== "auto" && "(Manuel)"}
            </span>
            <span className="text-sm font-black text-slate-700">{temp}°C</span>
          </div>
          <span className="text-2xl drop-shadow-sm">
            {weatherIcons[displayType]}
          </span>
        </div>
      )}
    </div>
  );
};

const InteractiveDateClock = () => {
  const [time, setTime] = useState(new Date());
  const [isAutoOpen, setIsAutoOpen] = useState(false); // Otomatik açılma durumu
  const [isHovered, setIsHovered] = useState(false); // Fare ile üzerine gelme durumu

  // Saatin her saniye güncellenmesi
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 15 saniye kapalı, 5 saniye açık döngüsü
  useEffect(() => {
    let timeoutId;

    const cycle = () => {
      // 15 saniye bekle
      timeoutId = setTimeout(() => {
        setIsAutoOpen(true); // Saati aç

        // 5 saniye sonra geri kapat
        timeoutId = setTimeout(() => {
          setIsAutoOpen(false); // Saati kapat
          cycle(); // Döngüyü başa sar
        }, 5000);
      }, 15000);
    };

    cycle(); // Bileşen yüklendiğinde döngüyü başlat

    return () => clearTimeout(timeoutId); // Bileşen silinirse temizle
  }, []);

  const hours = String(time.getHours()).padStart(2, "0");
  const minutes = String(time.getMinutes()).padStart(2, "0");
  const seconds = String(time.getSeconds()).padStart(2, "0");
  const dayNum = time.getDate();

  const months = [
    "OCAK",
    "ŞUBAT",
    "MART",
    "NİSAN",
    "MAYIS",
    "HAZİRAN",
    "TEMMUZ",
    "AĞUSTOS",
    "EYLÜL",
    "EKİM",
    "KASIM",
    "ARALIK",
  ];
  const days = [
    "PAZAR",
    "PAZARTESİ",
    "SALI",
    "ÇARŞAMBA",
    "PERŞEMBE",
    "CUMA",
    "CUMARTESİ",
  ];

  const monthStr = months[time.getMonth()];
  const dayStr = days[time.getDay()];

  // Saat ya otomatik döngüde açılmışsa ya da kullanıcı üzerine gelmişse genişlet
  const isExpanded = isAutoOpen || isHovered;

  return (
    <div
      className="relative w-12 h-12 cursor-pointer select-none z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Genişlediğinde menünün kaybolmaması için gizli tıklama alanı (Hitbox) */}
      {isExpanded && (
        <div className="absolute top-0 left-0 w-[350%] h-[150%] z-50 pointer-events-auto"></div>
      )}

      {/* SAAT KUTUSU (Kırmızı) */}
      <div
        className={`absolute inset-0 bg-[#ef4444] rounded-xl flex items-center justify-center text-white text-xl font-black transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform shadow-md z-0 pointer-events-none ${isExpanded ? "rotate-0" : "-rotate-6"}`}
      >
        <span
          className={`transition-opacity duration-300 delay-100 ${isExpanded ? "opacity-100" : "opacity-0"}`}
        >
          {hours}
        </span>
      </div>

      {/* SANİYE KUTUSU (Sarı) */}
      <div
        className={`absolute inset-0 bg-[#fbbf24] rounded-xl flex items-center justify-center text-white text-xl font-black transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform shadow-md z-10 pointer-events-none ${isExpanded ? "rotate-0 translate-x-[220%]" : "rotate-6"}`}
      >
        <span
          className={`transition-opacity duration-300 delay-100 ${isExpanded ? "opacity-100" : "opacity-0"}`}
        >
          {seconds}
        </span>
      </div>

      {/* TARİH / DAKİKA KUTUSU (Mavi) */}
      <div
        className={`absolute inset-0 bg-[#3b82f6] rounded-xl shadow-lg z-20 flex items-center justify-center overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none ${isExpanded ? "translate-x-[110%]" : "translate-x-0"}`}
      >
        {/* Kapalı Hal: Tarih */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${isExpanded ? "opacity-0" : "opacity-100"}`}
        >
          <span className="text-[0.45rem] font-bold text-white/90 tracking-wider mt-0.5">
            {monthStr}
          </span>
          <span className="text-xl font-black text-white leading-none my-0.5">
            {dayNum}
          </span>
          <span className="text-[0.4rem] font-bold text-white/90 tracking-wider mb-0.5 truncate max-w-[90%]">
            {dayStr}
          </span>
        </div>

        {/* Açık Hal: Dakika */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0"}`}
        >
          <span className="text-xl font-black text-white">{minutes}</span>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  // --- STATE ---
  const [appUsers, setAppUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [systemCity, setSystemCity] = useState(
    CITIES.find((c) => c.name === "Bursa"),
  );
  const [weatherOverride, setWeatherOverride] = useState("auto");
  const [systemBgColor, setSystemBgColor] = useState("default");

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0"),
  );
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  // Form States

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    type: "GİDER",
    categoryId: "",
    categoryName: "",
    date: "",
    amount: "",
    description: "",
  });
  const [categoryForm, setCategoryForm] = useState({
    id: null,
    name: "",
    type: "GİDER",
  });

  // Auth States

  const [isLoginView, setIsLoginView] = useState(true); // EKSİK OLAN BUYDU, BURAYA EKLENDİ
  const [showPassword, setShowPassword] = useState(false);
  // Profile & Admin States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    currentPass: "",
    newPass: "",
  });
  const [newUserForm, setNewUserForm] = useState({
    username: "",
    password: "",
    role: "user",
  });

  // Dialog State
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: "alert",
    message: "",
    onConfirm: null,
  });

  const showAlert = (message) =>
    setDialog({ isOpen: true, type: "alert", message, onConfirm: null });
  const showConfirm = (message, onConfirmAction) =>
    setDialog({
      isOpen: true,
      type: "confirm",
      message,
      onConfirm: onConfirmAction,
    });
  const closeDialog = () =>
    setDialog({ isOpen: false, type: "alert", message: "", onConfirm: null });

  // --- KULLANICILARI VERİTABANINDAN ÇEKME FONKSİYONU ---
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("app_token"); // 1. BİLETİ AL
      if (!token) return; // Bilet yoksa işlem yapma

      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`, // 2. BİLETİ GÖSTER
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppUsers(data); // Listeyi ekrana bas

        // Global Ayarları Uygula
        const adminUser = data.find((u) => u.role === "admin");
        if (adminUser) {
          if (adminUser.systemBgColor)
            setSystemBgColor(adminUser.systemBgColor);
          if (adminUser.weatherOverride)
            setWeatherOverride(adminUser.weatherOverride);
          if (adminUser.systemCity) setSystemCity(adminUser.systemCity);
        }

        // Kendi Ayarlarını Uygula
        const loggedInUser = JSON.parse(
          localStorage.getItem("app_currentUser_v2"),
        );
        if (loggedInUser) {
          const freshUserData = data.find(
            (u) => String(u.id) === String(loggedInUser.id),
          );
          if (freshUserData) {
            setCurrentUser({
              id: freshUserData.id,
              username: freshUserData.username,
              role: freshUserData.role,
              profilePhoto: freshUserData.profilePhoto,
              backgroundImage: freshUserData.backgroundImage,
            });
          }
        }
      }
    } catch (error) {
      console.error("API Hatası", error);
    }
  };

  // --- İLK YÜKLEME VE SİSTEM AYARLARI ---
  useEffect(() => {
    const savedBg = localStorage.getItem("app_system_bg_color");
    if (savedBg) setSystemBgColor(savedBg);
    const savedCity = localStorage.getItem("app_system_city");
    if (savedCity) {
      const foundCity = CITIES.find((c) => c.name === savedCity);
      if (foundCity) setSystemCity(foundCity);
    }

    const savedOverride = localStorage.getItem("app_weather_override");
    if (savedOverride) setWeatherOverride(savedOverride);

    // Kullanıcıları yükle
    fetchUsers();
  }, []);

  // --- VERİTABANINDAN VERİLERİ ÇEKME EFEKTİ ---
  useEffect(() => {
    if (currentUser) {
      const token = localStorage.getItem("app_token"); // Güvenli biletimizi alıyoruz

      const fetchTransactions = async () => {
        try {
          const response = await fetch("/api/transaction", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setTransactions(data);
          } else throw new Error("API Bulunamadı veya Yetkisiz");
        } catch (error) {
          console.error("İşlemler çekilemedi:", error);
        }
      };

      const fetchCategories = async () => {
        try {
          const response = await fetch("/api/category", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setCategories(data);
          } else throw new Error("API Bulunamadı veya Yetkisiz");
        } catch (error) {
          console.error("Kategoriler çekilemedi:", error);
        }
      };

      if (token) {
        fetchTransactions();
        fetchCategories();

        // YENİ EKLENDİ: Eğer kullanıcı Admin sekmesine geçerse listeyi arka planda tazele
        if (activeTab === "admin") {
          fetchUsers();
        }
      }

      if (
        ["admin", "settings"].includes(activeTab) &&
        currentUser.role !== "admin"
      ) {
        setActiveTab("dashboard");
      }
    }
  }, [currentUser, activeTab]);

  // --- HESAPLAMALAR ---
  const currentMonthTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (!t.date) return false;
        const [tYear, tMonth] = t.date.split("-");
        return (
          parseInt(tMonth) === parseInt(selectedMonth) &&
          parseInt(tYear) === parseInt(selectedYear)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedMonth, selectedYear]);

  const summary = useMemo(() => {
    const income = currentMonthTransactions
      .filter((t) => t.type === "GELİR")
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const expense = currentMonthTransactions
      .filter((t) => t.type === "GİDER")
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    return { income, expense, net: income - expense };
  }, [currentMonthTransactions]);

  const dashboardData = useMemo(() => {
    const year = parseInt(selectedYear);
    return MONTHS.map((m) => {
      const monthNum = parseInt(m.value);
      const mTrans = transactions.filter((t) => {
        if (!t.date) return false;
        const [tYear, tMonth] = t.date.split("-");
        return parseInt(tYear) === year && parseInt(tMonth) === monthNum;
      });

      const income = mTrans
        .filter((t) => t.type === "GELİR")
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const expense = mTrans
        .filter((t) => t.type === "GİDER")
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      return {
        name: m.label,
        Gelir: income,
        Gider: expense,
        Net: income - expense,
      };
    });
  }, [transactions, selectedYear]);

  // --- KOPYALAMA MANTIĞI ---
  const { prevMonthStr, prevYearStr } = useMemo(() => {
    let m = parseInt(selectedMonth) - 1;
    let y = parseInt(selectedYear);
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    return { prevMonthStr: String(m).padStart(2, "0"), prevYearStr: String(y) };
  }, [selectedMonth, selectedYear]);

  const previousMonthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (!t.date) return false;
      const [tYear, tMonth] = t.date.split("-");
      return tMonth === prevMonthStr && tYear === prevYearStr;
    });
  }, [transactions, prevMonthStr, prevYearStr]);

  const canCopyFromPreviousMonth =
    currentMonthTransactions.length === 0 &&
    previousMonthTransactions.length > 0;

  const handleCopyFromPreviousMonth = () => {
    const currentMonthLabel = MONTHS.find(
      (m) => m.value === selectedMonth,
    )?.label;
    showConfirm(
      `Önceki aya ait ${previousMonthTransactions.length} adet kayıt bu aya (${currentMonthLabel} ${selectedYear}) aktarılacak. Onaylıyor musunuz?`,
      () => {
        const newTransactions = previousMonthTransactions.map((t, index) => {
          const parts = t.date.split("-");
          let dayStr = parts[2] || "01";
          const maxDaysInTargetMonth = new Date(
            parseInt(selectedYear),
            parseInt(selectedMonth),
            0,
          ).getDate();
          const adjustedDay = Math.min(
            parseInt(dayStr, 10),
            maxDaysInTargetMonth,
          );
          return {
            ...t,
            id: `copied-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
            date: `${selectedYear}-${selectedMonth}-${String(adjustedDay).padStart(2, "0")}`,
            createdBy: currentUser.id,
          };
        });

        const updatedTransactions = [...transactions, ...newTransactions];
        setTransactions(updatedTransactions);
        closeDialog();
        setTimeout(
          () => showAlert(`${newTransactions.length} kayıt başarıyla eklendi!`),
          200,
        );
      },
    );
  };

  // --- İŞLEMLER ---
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) return showAlert("Lütfen bir kategori seçiniz!");

    const formYearMonth = formData.date.substring(0, 7);
    const isDuplicate = transactions.some((t) => {
      if (formData.id && String(t.id) === String(formData.id)) return false;
      const tYearMonth = t.date ? t.date.substring(0, 7) : "";
      return (
        String(t.categoryId) === String(formData.categoryId) &&
        tYearMonth === formYearMonth
      );
    });

    if (isDuplicate) {
      return showAlert("Bu ay için bu kategoride zaten bir kayıt mevcut!");
    }

    const selectedCat = categories.find(
      (c) => String(c.id) === String(formData.categoryId),
    );
    const newTransaction = {
      ...formData,
      id: formData.id || Date.now().toString(),
      categoryName: selectedCat ? selectedCat.name : formData.categoryId,
      createdBy: currentUser.id,
    };

    try {
      const token = localStorage.getItem("app_token"); // Token'ı al

      const response = await fetch("/api/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // API'ye bileti sun
        },
        body: JSON.stringify(newTransaction),
      });

      if (response.ok) {
        // ... (Geri kalan kodunuz aynı, fetchUsers / setTransactions kısımları)
        let updatedList = formData.id
          ? transactions.map((t) =>
              String(t.id) === String(formData.id) ? newTransaction : t,
            )
          : [...transactions, newTransaction];

        setTransactions(updatedList);
        closeForm();
        showAlert(
          formData.id
            ? "Kayıt başarıyla güncellendi!"
            : "Kayıt başarıyla buluta eklendi!",
        );
      } else {
        throw new Error("Yetkisiz veya API Hatası");
      }
    } catch (error) {
      console.warn("API bulunamadı, kayıt yerel belleğe eklendi.", error);
      let updatedList = formData.id
        ? transactions.map((t) =>
            String(t.id) === String(formData.id) ? newTransaction : t,
          )
        : [...transactions, newTransaction];

      setTransactions(updatedList);
      closeForm();
      showAlert(
        formData.id
          ? "Kayıt başarıyla güncellendi! (Yerel Test)"
          : "Kayıt başarıyla eklendi! (Yerel Test)",
      );
    }
  };

  const handleDeleteTransaction = (id) => {
    showConfirm("Bu kaydı silmek istediğinize emin misiniz?", async () => {
      try {
        const response = await fetch(`/api/transaction?id=${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          const updatedList = transactions.filter(
            (t) => String(t.id) !== String(id),
          );
          setTransactions(updatedList);
          closeDialog();
          setTimeout(
            () => showAlert("Kayıt veritabanından başarıyla silindi!"),
            200,
          );
        } else {
          throw new Error("API Sunucu Hatası");
        }
      } catch (error) {
        const updatedList = transactions.filter(
          (t) => String(t.id) !== String(id),
        );
        setTransactions(updatedList);
        closeDialog();
        setTimeout(
          () => showAlert("Kayıt başarıyla silindi! (Yerel Test)"),
          200,
        );
      }
    });
  };

  const openForm = (t = null) => {
    setFormData(
      t || {
        id: null,
        type: "GİDER",
        categoryId: "",
        categoryName: "",
        date: `${selectedYear}-${selectedMonth}-01`,
        amount: "",
        description: "",
      },
    );
    setIsFormOpen(true);
  };
  const closeForm = () => setIsFormOpen(false);

  // --- KATEGORİ EKLEME ---
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    const newCategory = {
      ...categoryForm,
      name: categoryForm.name.toLocaleUpperCase("tr-TR"),
    };

    try {
      // 1. BİLETİ AL (Token)
      const token = localStorage.getItem("app_token");

      // 2. BİLETİ GÖSTEREREK API'YE İSTEK AT
      const response = await fetch("/api/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Güvenlik duvarını geçmek için bilet
        },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        // Backend'den veritabanına işlenmiş gerçek kategoriyi al
        const addedCategory = await response.json();

        let updatedCats = categoryForm.id
          ? categories.map((c) =>
              String(c._id || c.id) === String(categoryForm.id)
                ? addedCategory
                : c,
            )
          : [...categories, addedCategory];

        setCategories(updatedCats);
        setCategoryForm({ id: null, name: "", type: "GİDER" });
        showAlert(
          categoryForm.id
            ? "Kategori başarıyla güncellendi!"
            : "Kategori veritabanına başarıyla eklendi!",
        );
      } else {
        throw new Error("API Hatası: Yetkisiz erişim");
      }
    } catch (error) {
      console.error("Kategori eklenemedi:", error);
      showAlert(
        "Kategori eklenirken hata oluştu. Oturumunuzun açık olduğundan emin olun.",
      );
    }
  };

  // --- KATEGORİ SİLME ---
  const handleDeleteCategory = (id) => {
    showConfirm(
      "Bu kategoriyi tamamen silmek istediğinize emin misiniz?",
      async () => {
        try {
          const token = localStorage.getItem("app_token"); // BİLETİ AL

          const response = await fetch(`/api/category?id=${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`, // BİLETİ GÖSTER
            },
          });

          if (response.ok) {
            const updatedCats = categories.filter(
              (c) => String(c._id || c.id) !== String(id),
            );
            setCategories(updatedCats);
            closeDialog();
            setTimeout(
              () => showAlert("Kategori veritabanından başarıyla silindi!"),
              200,
            );
          } else {
            throw new Error("API Sunucu Hatası");
          }
        } catch (error) {
          console.error("Silme hatası:", error);
          closeDialog();
          setTimeout(
            () => showAlert("Silme işlemi başarısız. Yetkiniz olmayabilir."),
            200,
          );
        }
      },
    );
  };

  const handleEditCategory = (category) => {
    setCategoryForm({
      id: category.id,
      name: category.name,
      type: category.type,
    });
  };

  // --- AUTH VE KULLANICI ---
  // --- GÜVENLİ GİRİŞ YAP (LOGIN) ---

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const username = e.target.reg_username.value.trim().toLowerCase();
    const password = e.target.reg_password.value;

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        showAlert(
          "Kayıt başarılı! Şimdi oluşturduğunuz hesapla giriş yapabilirsiniz.",
        );
        setIsLoginView(true); // Kayıt başarılıysa animasyonla giriş ekranına geri kaydır
      } else {
        showAlert(data.error || "Kayıt başarısız!");
      }
    } catch (error) {
      showAlert("Sunucuya bağlanılamadı.");
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim().toLowerCase();
    const password = e.target.password.value;

    try {
      // 1. Gerçek Backend API'sine bilgileri gönder
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Yeni kullanıcıya geçmeden hemen önce eski listeleri temizle
        setTransactions([]);
        setCategories([]);
        setAppUsers([]);

        // Giriş başarılıysa Token ve Kullanıcı bilgilerini al
        const sessionUser = data.user;
        const token = data.token;

        // Bilgileri yerel hafızaya yaz ve oturumu başlat
        localStorage.setItem("app_currentUser_v2", JSON.stringify(sessionUser));
        localStorage.setItem("app_token", token);
        setCurrentUser(sessionUser);

        // YENİ EKLENDİ: Sisteme giriş yapar yapmaz kullanıcıları hemen çek!
        fetchUsers();

        const savedBg = localStorage.getItem("app_system_bg_color");
        if (savedBg) setSystemBgColor(savedBg);
      }
    } catch (error) {
      console.error("Giriş Hatası:", error);
      // Backend kapalıysa veya API henüz Vercel'e yüklenmediyse yerel test (fallback) mekanizması eklenebilir,
      // ancak SaaS yapısında gerçek API zorunludur.
      showAlert("Sunucuya bağlanılamadı. API ayarlarınızı kontrol edin.");
    }
  };

  // --- GÜVENLİ ÇIKIŞ YAP (LOGOUT) ---
  // --- GÜVENLİ ÇIKIŞ YAP (LOGOUT) ---
  const handleLogout = () => {
    // 1. State'leri (RAM'i) tamamen sıfırla ki veri anlık görünmesin
    setTransactions([]);
    setCategories([]);
    setAppUsers([]);
    setActiveTab("dashboard");

    // 2. Oturumu kapat
    setCurrentUser(null);

    // 3. Tarayıcı hafızasındaki (Local Storage) her şeyi sil
    localStorage.removeItem("app_currentUser_v2");
    localStorage.removeItem("app_token");
    localStorage.removeItem("app_test_transactions"); // Test kalıntıları
    localStorage.removeItem("app_test_categories"); // Test kalıntıları
    localStorage.removeItem("app_users_v2"); // Test kalıntıları
  };

  // --- FOTOĞRAF SIKIŞTIRMA VE AKILLI KIRPMA (CENTER CROP) ---
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 800;

          const width = img.width;
          const height = img.height;

          const size = Math.min(width, height);
          const startX = (width - size) / 2;
          const startY = (height - size) / 2;

          canvas.width = MAX_SIZE;
          canvas.height = MAX_SIZE;
          const ctx = canvas.getContext("2d");

          ctx.drawImage(
            img,
            startX,
            startY,
            size,
            size,
            0,
            0,
            MAX_SIZE,
            MAX_SIZE,
          );

          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedBase64 = await compressImage(file);

      const targetUser = appUsers.find((u) => u.id === currentUser.id);
      const updatedUser = { ...targetUser, profilePhoto: compressedBase64 };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        await fetchUsers();
        const newSession = { ...currentUser, profilePhoto: compressedBase64 };
        setCurrentUser(newSession);
        localStorage.setItem("app_currentUser_v2", JSON.stringify(newSession));
        showAlert("Profil fotoğrafınız başarıyla güncellendi!");
      } else {
        throw new Error("API Hatası");
      }
    } catch (error) {
      console.error(error);
      showAlert("Fotoğraf yüklenirken bir hata oluştu.");
    }
  };

  // --- KİŞİSEL ARKA PLAN SIKIŞTIRMA VE YÜKLEME ---
  const compressBackgroundImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
          resolve(dataUrl);
        };
      };
    });
  };

  const handleBgImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024)
      return showAlert("Lütfen 10MB'dan daha küçük bir fotoğraf seçin.");

    try {
      const compressedBase64 = await compressBackgroundImage(file);
      const targetUser = appUsers.find((u) => u.id === currentUser.id);
      const updatedUser = { ...targetUser, backgroundImage: compressedBase64 };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        await fetchUsers();
        const newSession = {
          ...currentUser,
          backgroundImage: compressedBase64,
        };
        setCurrentUser(newSession);
        localStorage.setItem("app_currentUser_v2", JSON.stringify(newSession));
        showAlert("Kişisel arka plan resminiz başarıyla güncellendi!");
      }
    } catch (error) {
      showAlert("Arka plan yüklenirken bir hata oluştu.");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const targetUser = appUsers.find((u) => u.id === currentUser.id);
    if (!targetUser || targetUser.password !== profileForm.currentPass) {
      return showAlert("Mevcut şifrenizi yanlış girdiniz!");
    }

    const updatedUser = { ...targetUser, password: profileForm.newPass };

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        await fetchUsers(); // Veritabanından listeyi tazele
        setProfileForm({ currentPass: "", newPass: "" });
        setIsProfileOpen(false);
        showAlert("Şifreniz bulut veritabanında başarıyla güncellendi!");
      } else {
        throw new Error("API Hatası");
      }
    } catch (error) {
      console.warn(
        "Kullanıcı API bağlantısı yok, yerel test güncelleniyor.",
        error,
      );
      const updatedUsers = appUsers.map((u) =>
        u.id === currentUser.id ? updatedUser : u,
      );
      setAppUsers(updatedUsers);
      localStorage.setItem("app_users_v2", JSON.stringify(updatedUsers));
      setProfileForm({ currentPass: "", newPass: "" });
      setIsProfileOpen(false);
      showAlert("Şifreniz başarıyla güncellendi! (Yerel Test)");
    }
  };

  // --- ADMIN FONKSİYONLARI (KULLANICIYI VERİTABANINA YAZMA) ---
  const handleAdminAddUser = async (e) => {
    e.preventDefault();
    const username = newUserForm.username.trim().toLowerCase();

    if (appUsers.find((u) => u.username === username))
      return showAlert("Bu kullanıcı adı zaten mevcut!");
    if (!username || !newUserForm.password)
      return showAlert("Lütfen kullanıcı adı ve şifre giriniz.");

    // DİKKAT: Artık ID'yi biz oluşturmuyoruz, MongoDB _id atayacak.
    const newUserPayload = {
      username,
      password: newUserForm.password,
      role: newUserForm.role,
    };

    try {
      const token = localStorage.getItem("app_token"); // BİLETİ AL

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // BİLETİ GÖSTER
        },
        body: JSON.stringify(newUserPayload),
      });

      if (response.ok) {
        await fetchUsers(); // Veritabanından taze listeyi çek
        setNewUserForm({ username: "", password: "", role: "user" });
        showAlert(
          `${username} kullanıcısı başarıyla aynı çalışma alanınıza eklendi!`,
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "API Hatası");
      }
    } catch (error) {
      console.error("Kayıt Hatası:", error);
      // Yerel belleğe kaydetme (fallback) kısmını tamamen silebilirsin, çünkü artık veritabanı %100 şart.
      showAlert("Kullanıcı veritabanına eklenemedi: " + error.message);
    }
  };

  const handleAdminUpdateUser = async (userId, field, newValue) => {
    const targetUser = appUsers.find((u) => u.id === userId);
    if (!targetUser || targetUser[field] === newValue) return;

    const updatedUser = { ...targetUser, [field]: newValue };

    try {
      const token = localStorage.getItem("app_token"); // BİLETİ AL

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // BİLETİ GÖSTER
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        await fetchUsers();
        showAlert("Kullanıcı bilgisi başarıyla güncellendi.");
      } else {
        throw new Error("API Hatası");
      }
    } catch (error) {
      showAlert("Kullanıcı güncellenirken hata oluştu.");
    }
  };

  const handleAdminDeleteUser = (userId) => {
    if (userId === currentUser.id)
      return showAlert("Kendi hesabınızı silemezsiniz!");

    showConfirm(
      "Bu kullanıcıyı tamamen silmek istediğinize emin misiniz?",
      async () => {
        try {
          const token = localStorage.getItem("app_token"); // BİLETİ AL

          const response = await fetch(`/api/users?id=${userId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`, // BİLETİ GÖSTER
            },
          });

          if (response.ok) {
            await fetchUsers();
            closeDialog();
            setTimeout(
              () => showAlert("Kullanıcı veritabanından tamamen silindi!"),
              200,
            );
          } else {
            throw new Error("API Hatası");
          }
        } catch (error) {
          closeDialog();
          setTimeout(
            () => showAlert("Silme işlemi başarısız. Yetkiniz olmayabilir."),
            200,
          );
        }
      },
    );
  };
  const handleCityChange = async (e) => {
    const selectedCityName = e.target.value;
    const cityObj = CITIES.find((c) => c.name === selectedCityName);
    if (cityObj) {
      setSystemCity(cityObj);

      const targetUser = appUsers.find((u) => u.id === currentUser.id);
      if (targetUser) {
        const updatedUser = { ...targetUser, systemCity: cityObj };
        try {
          await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser),
          });
          fetchUsers();
        } catch (err) {}
      }
      // Alert kaldırıldı
    }
  };

  const handleWeatherOverrideChange = async (e) => {
    const mode = e.target.value;
    setWeatherOverride(mode);
    localStorage.setItem("app_weather_override", mode);

    const targetUser = appUsers.find((u) => u.id === currentUser.id);
    if (targetUser) {
      const updatedUser = { ...targetUser, weatherOverride: mode };

      const updatedUsersList = appUsers.map((u) =>
        u.id === currentUser.id ? updatedUser : u,
      );
      setAppUsers(updatedUsersList);
      localStorage.setItem("app_users_v2", JSON.stringify(updatedUsersList));

      try {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser),
        });
        if (response.ok) fetchUsers();
      } catch (err) {
        console.warn("API yok, hava durumu efekti yerel belleğe kaydedildi.");
      }
    }
    // Alert kaldırıldı
  };

  const handleThemeChange = async (e) => {
    const newTheme = e.target.value;
    setSystemBgColor(newTheme);
    localStorage.setItem("app_system_bg_color", newTheme);

    const targetUser = appUsers.find((u) => u.id === currentUser.id);
    if (targetUser) {
      const updatedUser = { ...targetUser, systemBgColor: newTheme };

      const updatedUsersList = appUsers.map((u) =>
        u.id === currentUser.id ? updatedUser : u,
      );
      setAppUsers(updatedUsersList);
      localStorage.setItem("app_users_v2", JSON.stringify(updatedUsersList));

      try {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser),
        });
        if (response.ok) fetchUsers();
      } catch (err) {
        console.warn("API yok, sistem teması yerel belleğe kaydedildi.");
      }
    }
    // Alert kaldırıldı
  };

  // --- HELPERS ---
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);

  const minDate = `${selectedYear}-${selectedMonth}-01`;
  const maxDate = `${selectedYear}-${selectedMonth}-${new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate()}`;
  const currentTypeCategories = categories.filter(
    (c) => c.type === formData.type,
  );

  const handleExportExcel = () => {
    const headers = ["Tür", "Kategori", "Tarih", "Tutar (TL)", "Açıklama"];
    const rows = currentMonthTransactions.map((t) => [
      t.type,
      t.categoryName || t.categoryId,
      t.date.split("-").reverse().join("."),
      t.amount.toString().replace(".", ","),
      (t.description || "").replace(/;/g, " ").replace(/\n/g, " "),
    ]);
    const csvContent = [
      headers.join(";"),
      ...rows.map((r) => r.join(";")),
    ].join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Finans_Kayitlar_${MONTHS.find((m) => m.value === selectedMonth)?.label}_${selectedYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- EKRANLAR ---

  if (!currentUser) {
    return (
      <div className="min-h-[100dvh] relative flex items-center justify-center p-4 overflow-hidden bg-[#0a0f1c] [perspective:1200px]">
        {/* ARKA PLAN EFEKTLERİ */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] bg-indigo-600/20 blur-[100px] rounded-full mix-blend-screen anim-blob-1"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-violet-600/20 blur-[120px] rounded-full mix-blend-screen anim-blob-2"></div>
        </div>

        <style>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.2); }
            to { transform: rotate(360deg) scale(1); }
          }
          @keyframes slide-up-fade {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .anim-slide-up { animation: slide-up-fade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .anim-blob-1 { animation: spin-slow 15s linear infinite; }
          .anim-blob-2 { animation: spin-slow 20s linear infinite reverse; }
          .preserve-3d { transform-style: preserve-3d; }
          .backface-hidden { backface-visibility: hidden; }
          .rotate-y-180 { transform: rotateY(180deg); }
        `}</style>

        {/* ========================================================== */}
        {/* MOBİL GÖRÜNÜM: 3D KART ÇEVİRME (Sadece küçük ekranlarda) */}
        {/* ========================================================== */}
        <div className="anim-slide-up relative w-full max-w-md z-10 block md:hidden">
          <div
            className={`relative w-full h-[620px] transition-transform duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] preserve-3d ${!isLoginView ? "rotate-y-180" : ""}`}
          >
            {/* ÖN YÜZ: GİRİŞ YAP */}
            <div className="absolute inset-0 w-full h-full bg-white/95 backdrop-blur-xl p-6 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-900/20 flex flex-col border border-white/20 backface-hidden">
              <div className="relative w-20 h-20 mx-auto mb-8 mt-2 shrink-0 group">
                <div className="absolute inset-0 bg-indigo-500 rounded-[1.5rem] blur-xl opacity-40"></div>
                <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-[1.5rem] shadow-inner transform -rotate-6">
                  <Wallet size={36} />
                </div>
              </div>
              <h1 className="text-3xl font-black text-center text-slate-800 mb-2 tracking-tight">
                Hoş Geldiniz
              </h1>
              <p className="text-center text-slate-500 mb-8 font-medium text-sm">
                Finans Takip sistemine giriş yapın
              </p>
              <form onSubmit={handleAuth} className="space-y-4 flex-1">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User size={22} />
                  </div>
                  <input
                    type="text"
                    name="username"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 ring-1 ring-slate-200 !bg-slate-50 focus:!bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-slate-800"
                    placeholder="Kullanıcı Adı"
                    defaultValue="admin"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={22} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-0 ring-1 ring-slate-200 !bg-slate-50 focus:!bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-slate-800"
                    placeholder="Şifre"
                    defaultValue="123"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 p-2"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black mt-6 shadow-lg"
                >
                  Giriş Yap
                </button>
                <button
                  type="button"
                  onClick={() => setIsLoginView(false)}
                  className="w-full bg-indigo-50 text-indigo-600 py-4 rounded-2xl font-black mt-3"
                >
                  Yeni Hesap Oluştur
                </button>
              </form>
            </div>

            {/* ARKA YÜZ: KAYIT OL */}
            <div className="absolute inset-0 w-full h-full bg-white/95 backdrop-blur-xl p-6 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-900/20 flex flex-col border border-white/20 backface-hidden rotate-y-180">
              <div className="relative w-20 h-20 mx-auto mb-8 mt-2 shrink-0 group">
                <div className="absolute inset-0 bg-violet-500 rounded-[1.5rem] blur-xl opacity-40"></div>
                <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-[1.5rem] shadow-inner transform rotate-6">
                  <User size={36} />
                </div>
              </div>
              <h1 className="text-3xl font-black text-center text-slate-800 mb-2 tracking-tight">
                Kayıt Ol
              </h1>
              <p className="text-center text-slate-500 mb-8 font-medium text-sm">
                Sisteme katılmak için bilgilerinizi girin
              </p>
              <form
                onSubmit={handleRegisterSubmit}
                className="space-y-4 flex-1"
              >
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User size={22} />
                  </div>
                  <input
                    type="text"
                    name="reg_username"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 ring-1 ring-slate-200 !bg-slate-50 focus:!bg-white focus:ring-2 focus:ring-violet-600 outline-none font-bold text-slate-800"
                    placeholder="Kullanıcı Adı"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={22} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="reg_password"
                    required
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-0 ring-1 ring-slate-200 !bg-slate-50 focus:!bg-white focus:ring-2 focus:ring-violet-600 outline-none font-bold text-slate-800"
                    placeholder="Güvenli Bir Şifre"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-2xl font-black mt-6 shadow-lg"
                >
                  Kayıt İşlemini Tamamla
                </button>
                <button
                  type="button"
                  onClick={() => setIsLoginView(true)}
                  className="w-full bg-slate-50 text-slate-600 py-4 rounded-2xl font-black mt-3 border"
                >
                  Giriş Ekranına Dön
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* MASAÜSTÜ GÖRÜNÜM: SLIDING OVERLAY (Büyük Ekranlarda) */}
        {/* ========================================================== */}
        <div className="anim-slide-up relative hidden md:block w-full max-w-[900px] h-[550px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden z-10 border border-white/20">
          {/* 1. SOL FORM: GİRİŞ YAP */}
          <div
            className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center px-12 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${!isLoginView ? "translate-x-[100%] opacity-0 z-0 pointer-events-none" : "translate-x-0 opacity-100 z-20 pointer-events-auto"}`}
          >
            <h1 className="text-4xl font-black text-slate-800 mb-2 text-center">
              Giriş Yap
            </h1>
            <p className="text-slate-500 font-medium text-sm text-center mb-8">
              Hesabınıza erişmek için bilgilerinizi girin.
            </p>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 focus:bg-white border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold text-slate-800"
                  placeholder="Kullanıcı Adı"
                  defaultValue="admin"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-50 focus:bg-white border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold text-slate-800"
                  placeholder="Şifre"
                  defaultValue="123"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 p-2"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    showAlert("Sistem yöneticisi ile iletişime geçin.")
                  }
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Şifremi Unuttum?
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-black shadow-lg shadow-slate-900/20 hover:bg-slate-900 transition-colors mt-2"
              >
                Giriş Yap
              </button>
            </form>
          </div>

          {/* 2. SAĞ FORM: KAYIT OL */}
          <div
            className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center px-12 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${!isLoginView ? "translate-x-[100%] opacity-100 z-20 pointer-events-auto" : "translate-x-0 opacity-0 z-0 pointer-events-none"}`}
          >
            <h1 className="text-4xl font-black text-slate-800 mb-2 text-center">
              Hesap Oluştur
            </h1>
            <p className="text-slate-500 font-medium text-sm text-center mb-8">
              Yeni bir başlangıç için aramıza katılın.
            </p>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  name="reg_username"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 focus:bg-white border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-600 outline-none transition-all font-bold text-slate-800"
                  placeholder="Kullanıcı Adı"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="reg_password"
                  required
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-50 focus:bg-white border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-600 outline-none transition-all font-bold text-slate-800"
                  placeholder="Güvenli Bir Şifre"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3.5 rounded-xl font-black shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 transition-colors mt-6"
              >
                Kayıt İşlemini Tamamla
              </button>
            </form>
          </div>

          {/* 3. KAYAN RENKLİ OVERLAY KATMANI */}
          <div
            className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 ${!isLoginView ? "-translate-x-full" : "translate-x-0"}`}
          >
            {/* Arka Planın Ters Yönde Kayması (Sabit Kalma İllüzyonu) */}
            <div
              className={`bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 relative -left-[100%] h-full w-[200%] transform transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${!isLoginView ? "translate-x-1/2" : "translate-x-0"}`}
            >
              {/* Overlay SOL (Kayıt Ol Ekranındayken Görünen Metin) */}
              <div
                className={`absolute top-0 left-0 flex flex-col items-center justify-center w-1/2 h-full px-12 text-center text-white transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${!isLoginView ? "translate-x-0" : "-translate-x-[20%]"}`}
              >
                <h1 className="text-4xl font-black mb-4">Tekrar Hoş Geldin!</h1>
                <p className="text-indigo-100 font-medium mb-8 leading-relaxed">
                  Bizimle kalmak ve tüm finansal verilerine erişmek için kendi
                  hesabına giriş yap.
                </p>
                <button
                  onClick={() => setIsLoginView(true)}
                  className="px-10 py-3 rounded-full border-2 border-white/50 hover:border-white hover:bg-white hover:text-indigo-600 font-black tracking-wider transition-all uppercase text-sm"
                >
                  Giriş Yap
                </button>
              </div>

              {/* Overlay SAĞ (Giriş Ekranındayken Görünen Metin) */}
              <div
                className={`absolute top-0 right-0 flex flex-col items-center justify-center w-1/2 h-full px-12 text-center text-white transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${!isLoginView ? "translate-x-[20%]" : "translate-x-0"}`}
              >
                <h1 className="text-4xl font-black mb-4">Merhaba, Dostum!</h1>
                <p className="text-indigo-100 font-medium mb-8 leading-relaxed">
                  Kişisel bilgilerinle kayıt olarak finansal yolculuğuna bizimle
                  hemen başla.
                </p>
                <button
                  onClick={() => setIsLoginView(false)}
                  className="px-10 py-3 rounded-full border-2 border-white/50 hover:border-white hover:bg-white hover:text-violet-600 font-black tracking-wider transition-all uppercase text-sm"
                >
                  Kayıt Ol
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Dialog (Sabit) */}
        {dialog.isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center transform scale-100 animate-[slide-up-fade_0.3s_ease-out]">
              <p className="text-slate-800 font-bold mb-6">{dialog.message}</p>
              <button
                onClick={closeDialog}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors w-full"
              >
                Tamam
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="min-h-screen relative text-slate-800 font-sans pb-20">
      <WeatherBackground
        city={systemCity}
        override={weatherOverride}
        systemBgColor={systemBgColor}
        userBgImage={currentUser?.backgroundImage}
      />
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-indigo-600">
            <InteractiveDateClock />
            <span className="font-bold text-xl hidden md:block">
              Finans Takip
            </span>
          </div>

          <div className="hidden md:flex flex-1 justify-center mx-4 overflow-x-auto hide-scrollbar">
            {" "}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "dashboard" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <LayoutDashboard size={18} />{" "}
                <span className="hidden sm:block">Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab("list")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <ListOrdered size={18} />{" "}
                <span className="hidden sm:block">Kayıtlar</span>
              </button>
              {currentUser.role === "admin" && (
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "settings" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <Settings size={18} />{" "}
                  <span className="hidden sm:block">Ayarlar</span>
                </button>
              )}
              {currentUser.role === "admin" && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "admin" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <Shield size={18} />{" "}
                  <span className="hidden sm:block">Admin</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-xl transition-colors border border-transparent hover:border-slate-200"
              title="Profilim"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden">
                {currentUser.profilePhoto ? (
                  <img
                    src={currentUser.profilePhoto}
                    alt="Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser.username.substring(0, 2).toUpperCase()
                )}
              </div>
              <span className="font-bold text-sm text-slate-700 hidden sm:block capitalize">
                {currentUser.username}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
              title="Çıkış Yap"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {(activeTab === "dashboard" || activeTab === "list") && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Calendar className="text-slate-400" size={20} />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 flex-1 sm:flex-none"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 flex-1 sm:flex-none"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {currentUser.role === "admin" && (
              <div className="flex gap-2 w-full sm:w-auto">
                {activeTab === "list" && canCopyFromPreviousMonth && (
                  <button
                    onClick={handleCopyFromPreviousMonth}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-colors font-bold shadow-sm"
                  >
                    <Copy size={18} /> Geçen Aydan Aktar
                  </button>
                )}
                <button
                  onClick={() => openForm()}
                  /* hidden sm:flex eklendi: Mobilde gizlenecek, yerine FAB gelecek */
                  className="hidden sm:flex relative overflow-hidden group flex-1 sm:flex-none items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-indigo-200 font-bold"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-700 ease-out -skew-x-12 -translate-x-full"></div>
                  <Plus
                    size={20}
                    className="group-hover:rotate-90 transition-transform duration-300"
                  />{" "}
                  Yeni Kayıt
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-violet-50 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-center gap-5 z-10 w-full md:w-auto">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center ${summary.net >= 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                  >
                    <Wallet size={32} />
                  </div>
                  <div>
                    <p className="text-slate-500 font-bold mb-1">
                      Net Durum (
                      {MONTHS.find((m) => m.value === selectedMonth)?.label})
                    </p>
                    <p
                      className={`text-4xl sm:text-5xl font-black tracking-tight ${summary.net >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {summary.net > 0 ? "+" : ""}
                      {formatCurrency(summary.net)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                    <ArrowUpCircle size={28} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-bold mb-1">
                      Toplam Gelir (
                      {MONTHS.find((m) => m.value === selectedMonth)?.label})
                    </p>
                    <p className="text-2xl font-black text-green-600">
                      {formatCurrency(summary.income)}
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                    <ArrowDownCircle size={28} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-bold mb-1">
                      Toplam Gider (
                      {MONTHS.find((m) => m.value === selectedMonth)?.label})
                    </p>
                    <p className="text-2xl font-black text-red-600">
                      {formatCurrency(summary.expense)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">
                {selectedYear} Yılı Net Durum Grafiği
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                      tickFormatter={(value) => `₺${value}`}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        fontWeight: "bold",
                      }}
                    />
                    <Bar dataKey="Net" radius={[4, 4, 0, 0]}>
                      {dashboardData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.Net >= 0 ? "#10b981" : "#ef4444"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">
                  {selectedYear} Yılı Aylık Detay Listesi
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse hidden md:table">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                      <th className="px-6 py-4 font-bold">Ay</th>
                      <th className="px-6 py-4 font-bold text-right">
                        Toplam Gelir
                      </th>
                      <th className="px-6 py-4 font-bold text-right">
                        Toplam Gider
                      </th>
                      <th className="px-6 py-4 font-bold text-right">
                        Net Durum
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {dashboardData.map((data, index) => (
                      <tr
                        key={index}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                          {data.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-green-600 font-bold">
                          {formatCurrency(data.Gelir)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-red-600 font-bold">
                          {formatCurrency(data.Gider)}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-right font-black ${data.Net >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {data.Net > 0 ? "+" : ""}
                          {formatCurrency(data.Net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="md:hidden flex flex-col divide-y divide-slate-100">
                  {dashboardData.map((data, index) => (
                    <div
                      key={`mobile-dash-${index}`}
                      className="p-4 bg-white flex flex-col gap-2 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">
                          {data.name}
                        </span>
                        <span
                          className={`font-black ${data.Net >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {data.Net > 0 ? "+" : ""}
                          {formatCurrency(data.Net)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">
                          Gelir:{" "}
                          <span className="text-green-600 font-bold">
                            {formatCurrency(data.Gelir)}
                          </span>
                        </span>
                        <span className="text-slate-500 font-medium">
                          Gider:{" "}
                          <span className="text-red-600 font-bold">
                            {formatCurrency(data.Gider)}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KAYIT LİSTESİ */}
        {activeTab === "list" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">
                İşlem Listesi (
                {MONTHS.find((m) => m.value === selectedMonth)?.label}{" "}
                {selectedYear})
              </h2>

              {currentMonthTransactions.length > 0 && (
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg font-bold transition-colors text-sm shadow-sm"
                >
                  <Download size={16} /> Excel İndir
                </button>
              )}
            </div>
            {currentMonthTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <ListOrdered size={32} />
                </div>
                <p className="text-slate-500 font-bold">
                  Bu döneme ait kayıt bulunamadı.
                </p>
                <p className="text-slate-400 text-sm mt-1 font-medium">
                  {currentUser.role === "admin"
                    ? '"Yeni Kayıt" butonuna tıklayarak eklemeye başlayın.'
                    : "Bu dönemde henüz işlem yapılmamış."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse hidden md:table">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                      <th className="px-6 py-4 font-bold">Kategori</th>
                      <th className="px-6 py-4 font-bold">Tarih</th>
                      <th className="px-6 py-4 font-bold">Açıklama</th>
                      <th className="px-6 py-4 font-bold text-right">Tutar</th>
                      {currentUser.role === "admin" && (
                        <th className="px-6 py-4 font-bold text-right">
                          İşlem
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {currentMonthTransactions.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${t.type === "GELİR" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
                          >
                            {t.categoryName || t.categoryId}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {t.date.split("-").reverse().join(".")}
                        </td>
                        <td
                          className="px-6 py-4 text-sm text-slate-600 font-medium max-w-xs truncate"
                          title={t.description}
                        >
                          {t.description || "-"}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-right font-black ${t.type === "GELİR" ? "text-green-600" : "text-red-600"}`}
                        >
                          {t.type === "GELİR" ? "+" : "-"}
                          {formatCurrency(t.amount)}
                        </td>
                        {currentUser.role === "admin" && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button
                              onClick={() => openForm(t)}
                              className="text-slate-400 hover:text-indigo-600 p-1.5 transition-colors"
                              title="Düzenle"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="text-slate-400 hover:text-red-600 p-1.5 transition-colors ml-2"
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="md:hidden flex flex-col divide-y divide-slate-100">
                  {currentMonthTransactions.map((t) => (
                    <div
                      key={`mobile-trans-${t.id}`}
                      className="p-4 bg-white flex flex-col gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border self-start ${t.type === "GELİR" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
                          >
                            {t.categoryName || t.categoryId}
                          </span>
                          <span className="text-xs text-slate-500 mt-1 font-medium">
                            {t.date.split("-").reverse().join(".")}
                          </span>
                        </div>
                        <span
                          className={`font-black ${t.type === "GELİR" ? "text-green-600" : "text-red-600"}`}
                        >
                          {t.type === "GELİR" ? "+" : "-"}
                          {formatCurrency(t.amount)}
                        </span>
                      </div>
                      {t.description && (
                        <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg font-medium">
                          {t.description}
                        </p>
                      )}
                      {currentUser.role === "admin" && (
                        <div className="flex justify-end gap-1 mt-1 border-t border-slate-50 pt-2">
                          <button
                            onClick={() => openForm(t)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={14} /> Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                          >
                            <Trash2 size={14} /> Sil
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AYARLAR (KATEGORİ) */}
        {activeTab === "settings" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Settings size={20} className="text-indigo-600" /> Kategori
                Yönetimi
              </h2>

              <form
                onSubmit={handleCategorySubmit}
                className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wider">
                    KATEGORİ ADI
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    /* KESİN BEYAZ ZORLAMASI BURADA */
                    style={{ colorScheme: "light" }}
                    className="w-full px-3 py-2 !bg-white !text-slate-800 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-medium"
                    placeholder="Örn: YEMEK"
                    required
                  />
                </div>
                <div className="w-full sm:w-32">
                  <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wider">
                    TÜR
                  </label>
                  <select
                    value={categoryForm.type}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, type: e.target.value })
                    }
                    /* KESİN BEYAZ ZORLAMASI BURADA */
                    style={{ colorScheme: "light" }}
                    className="w-full px-3 py-2 !bg-white !text-slate-800 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="GİDER">GİDER</option>
                    <option value="GELİR">GELİR</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold h-[42px] min-w-[100px]"
                  >
                    {categoryForm.id ? "Güncelle" : "Ekle"}
                  </button>
                  {categoryForm.id && (
                    <button
                      type="button"
                      onClick={() =>
                        setCategoryForm({ id: null, name: "", type: "GİDER" })
                      }
                      className="px-3 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors h-[42px] flex items-center justify-center"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </form>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-red-600 mb-3 tracking-wider border-b border-slate-100 pb-2">
                    GİDER KATEGORİLERİ
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories
                      .filter((c) => c.type === "GİDER")
                      .map((c) => (
                        <div
                          key={c._id || c.id}
                          className="group relative flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm text-slate-700 hover:border-slate-300 shadow-sm transition-all font-medium"
                        >
                          <span>{c.name}</span>
                          <div className="hidden group-hover:flex items-center ml-2 border-l border-slate-200 pl-2">
                            <button
                              onClick={() => handleEditCategory(c)}
                              className="text-slate-400 hover:text-indigo-600 p-1"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteCategory(c._id || c.id)
                              }
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="pt-4">
                  <h3 className="text-sm font-bold text-green-600 mb-3 tracking-wider border-b border-slate-100 pb-2">
                    GELİR KATEGORİLERİ
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories
                      .filter((c) => c.type === "GELİR")
                      .map((c) => (
                        <div
                          key={c._id || c.id}
                          className="group relative flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm text-slate-700 hover:border-slate-300 shadow-sm transition-all font-medium"
                        >
                          <span>{c.name}</span>
                          <div className="hidden group-hover:flex items-center ml-2 border-l border-slate-200 pl-2">
                            <button
                              onClick={() => handleEditCategory(c)}
                              className="text-slate-400 hover:text-indigo-600 p-1"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteCategory(c._id || c.id)
                              }
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ADMIN PANELİ */}
        {activeTab === "admin" && currentUser.role === "admin" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                <MapPin size={20} className="text-indigo-600" /> Sistem Ayarları
                (Hava Durumu)
              </h2>
              {/* Flex yapısı düzeltildi: flex-1 w-full ile üç kutu eşit dağıtıldı */}
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Geçerli Şehir (Sıcaklık)
                  </label>
                  <select
                    value={systemCity.name}
                    onChange={handleCityChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 font-medium bg-slate-50"
                  >
                    {CITIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Arka Plan Efekti
                  </label>
                  <select
                    value={weatherOverride}
                    onChange={handleWeatherOverrideChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 font-medium bg-slate-50"
                  >
                    <option value="auto">Otomatik (Gerçek Zamanlı)</option>
                    <option value="clear">Güneşli / Açık</option>
                    <option value="clouds">Bulutlu</option>
                    <option value="rain">Yağmurlu</option>
                    <option value="snow">Karlı</option>
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Sistem Teması (Global)
                  </label>
                  <select
                    value={systemBgColor}
                    onChange={handleThemeChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 font-medium bg-slate-50"
                  >
                    <option value="default">Hava Durumu (Varsayılan)</option>
                    <option value="gece">Gece Mavisi</option>
                    <option value="doga">Doğa Yeşili</option>
                    <option value="gunbatimi">Gün Batımı</option>
                    <option value="karanlik">Koyu Tema</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                <Users size={20} className="text-indigo-600" /> Yeni Kullanıcı
                Ekle
              </h2>
              <form
                onSubmit={handleAdminAddUser}
                className="flex flex-col md:flex-row gap-4"
              >
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserForm.username}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        username: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 font-medium bg-slate-50"
                    placeholder="Örn: ahmet123"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Geçici Şifre
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserForm.password}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 font-medium bg-slate-50"
                    placeholder="Örn: 123456"
                  />
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Yetki
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, role: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 font-medium bg-slate-50"
                  >
                    <option value="user">Standart</option>
                    <option value="admin">Superadmin</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-bold flex items-center justify-center gap-2 h-[42px]"
                  >
                    <Plus size={18} /> Ekle
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Shield size={20} className="text-indigo-600" /> Sistem
                  Kullanıcıları
                </h2>
                <span className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-xs font-bold">
                  Toplam: {appUsers.length}
                </span>
              </div>

              <div className="overflow-x-auto p-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                      <th className="px-4 py-3 font-bold">ID / Rol</th>
                      <th className="px-4 py-3 font-bold">Kullanıcı Adı</th>
                      <th className="px-4 py-3 font-bold">Şifre Belirle</th>
                      <th className="px-4 py-3 font-bold text-right">
                        Aksiyon
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {/* 1. ROL GÜNCELLEME */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            defaultValue={u.role}
                            onChange={(e) =>
                              handleAdminUpdateUser(
                                u.id,
                                "role",
                                e.target.value,
                              )
                            }
                            disabled={u.id === currentUser.id}
                            className={`px-2 py-1 rounded text-xs font-bold outline-none border focus:ring-1 focus:ring-indigo-500 ${u.role === "admin" ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}
                          >
                            <option value="admin">SUPERADMIN</option>
                            <option value="user">STANDART</option>
                          </select>
                        </td>

                        {/* 2. KULLANICI ADI GÜNCELLEME */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="text"
                            defaultValue={u.username}
                            onBlur={(e) =>
                              handleAdminUpdateUser(
                                u.id,
                                "username",
                                e.target.value.trim().toLowerCase(),
                              )
                            }
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm w-32 focus:ring-1 focus:ring-indigo-500 outline-none font-bold text-slate-700 bg-transparent"
                          />
                        </td>

                        {/* 3. ŞİFRE GÜNCELLEME (GÖRÜNÜM DÜZELTİLDİ) */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="text"
                            placeholder="Yeni Şifre Ata" // Kullanıcıyı yönlendiren metin
                            defaultValue="" // ŞİFRE BOŞ GELMELİ
                            onBlur={(e) => {
                              // Eğer input'a yeni bir şey yazıldıysa şifreyi güncelle
                              if (e.target.value.trim() !== "") {
                                handleAdminUpdateUser(
                                  u.id,
                                  "password",
                                  e.target.value,
                                );
                                e.target.value = ""; // Güncelleme sonrası alanı tekrar temizle
                              }
                            }}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm w-32 focus:ring-1 focus:ring-indigo-500 outline-none font-medium text-slate-600 bg-transparent placeholder:text-slate-400"
                          />
                        </td>
                        {/* 4. SİLME BUTONU */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleAdminDeleteUser(u.id)}
                            disabled={u.id === currentUser.id}
                            className={`p-1.5 rounded-lg transition-colors ${u.id === currentUser.id ? "text-slate-300 cursor-not-allowed" : "text-slate-400 hover:text-red-600 hover:bg-red-50"}`}
                            title={
                              u.id === currentUser.id
                                ? "Kendinizi silemezsiniz"
                                : "Kullanıcıyı Sil"
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
      {/* --- MOBİL İÇİN YÜZEN EKLE BUTONU (FAB - Floating Action Button) --- */}
      {currentUser.role === "admin" &&
        (activeTab === "dashboard" || activeTab === "list") && (
          <button
            onClick={() => openForm()}
            className="md:hidden fixed bottom-20 right-4 z-[45] w-14 h-14 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full shadow-lg shadow-indigo-300/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={28} />
          </button>
        )}

      {/* --- MOBİL İÇİN ALT NAVİGASYON BARI (BOTTOM NAV) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "dashboard" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-bold">Özet</span>
          </button>

          <button
            onClick={() => setActiveTab("list")}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "list" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <ListOrdered size={20} />
            <span className="text-[10px] font-bold">Kayıtlar</span>
          </button>

          {currentUser.role === "admin" && (
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "settings" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Settings size={20} />
              <span className="text-[10px] font-bold">Kategori</span>
            </button>
          )}

          {currentUser.role === "admin" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === "admin" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Shield size={20} />
              <span className="text-[10px] font-bold">Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* PROFİL MODAL */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <User size={20} className="text-indigo-600" /> Profilim
              </h2>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* --- YENİ FOTOĞRAF YÜKLEME ALANI --- */}
            <div className="p-6 flex flex-col items-center border-b border-slate-100 relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-3xl shadow-lg mb-3 overflow-hidden relative border-4 border-white">
                {currentUser.profilePhoto ? (
                  <img
                    src={currentUser.profilePhoto}
                    alt="Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser.username.substring(0, 2).toUpperCase()
                )}

                {/* Hover Efekti ve Dosya Seçici */}
                <label className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                  <Edit2 size={24} className="text-white" />
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>

              <h3 className="font-black text-xl text-slate-800 capitalize">
                {currentUser.username}
              </h3>
              <span
                className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${currentUser.role === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}
              >
                {currentUser.role === "admin"
                  ? "Superadmin"
                  : "Standart Kullanıcı"}
              </span>
            </div>
            {/* ----------------------------------- */}

            <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex flex-col items-center">
              <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                <MapPin size={16} /> Kişisel Arka Plan
              </h4>
              <div className="flex gap-3 w-full">
                <label className="flex-1 bg-indigo-100 text-indigo-700 py-2.5 rounded-xl font-bold text-center hover:bg-indigo-200 transition-colors cursor-pointer text-sm">
                  Resim Yükle
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                    onChange={handleBgImageUpload}
                  />
                </label>
                {currentUser.backgroundImage && (
                  <button
                    type="button"
                    onClick={async () => {
                      const targetUser = appUsers.find(
                        (u) => u.id === currentUser.id,
                      );
                      const updatedUser = {
                        ...targetUser,
                        backgroundImage: null,
                      };
                      await fetch("/api/users", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updatedUser),
                      });
                      await fetchUsers();
                      const newSession = {
                        ...currentUser,
                        backgroundImage: null,
                      };
                      setCurrentUser(newSession);
                      localStorage.setItem(
                        "app_currentUser_v2",
                        JSON.stringify(newSession),
                      );
                      showAlert("Kişisel arka plan kaldırıldı.");
                    }}
                    className="px-4 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors flex items-center justify-center"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="p-6 bg-slate-50/30">
              <h4 className="font-bold text-sm text-slate-700 mb-4 flex items-center gap-2">
                <Key size={16} /> Şifre Değiştir
              </h4>
              <div className="space-y-4">
                <div>
                  <input
                    type="password"
                    required
                    value={profileForm.currentPass}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        currentPass: e.target.value,
                      })
                    }
                    placeholder="Mevcut Şifreniz"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    required
                    value={profileForm.newPass}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        newPass: e.target.value,
                      })
                    }
                    placeholder="Yeni Şifre"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-800 text-white py-2.5 rounded-xl font-bold hover:bg-slate-700 transition-colors"
                >
                  Şifremi Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORM MODAL (Kayıt/Düzenleme) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {formData.id ? "Kaydı Düzenle" : "Yeni Kayıt Ekle"}
              </h2>
              <button
                onClick={closeForm}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleTransactionSubmit} className="p-5 space-y-5">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, type: "GİDER", categoryId: "" })
                  }
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.type === "GİDER" ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <ArrowDownCircle size={18} /> Gider
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, type: "GELİR", categoryId: "" })
                  }
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.type === "GELİR" ? "bg-white text-green-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <ArrowUpCircle size={18} /> Gelir
                </button>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Kategori
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                  {currentTypeCategories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, categoryId: c.id })
                      }
                      className={`px-3 py-2 rounded-xl text-sm font-bold transition-all border ${String(formData.categoryId) === String(c.id) ? (formData.type === "GELİR" ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700") : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50"}`}
                    >
                      <div className="flex items-center gap-1">
                        {String(formData.categoryId) === String(c.id) && (
                          <Check size={14} />
                        )}{" "}
                        {c.name}
                      </div>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="opacity-0 absolute h-0 w-0"
                  required
                  value={formData.categoryId}
                  onChange={() => {}}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Tarih
                </label>
                <input
                  type="date"
                  required
                  min={minDate}
                  max={maxDate}
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  /* KESİN ÇÖZÜM İÇİN EKLENENLER */
                  style={{ colorScheme: "light" }}
                  className="w-full px-4 py-3 !bg-white !text-slate-800 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Tutar (₺)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold">₺</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    /* BURAYA EKLENDİ: bg-white text-slate-800 */
                    className="w-full pl-10 pr-4 py-3 bg-white text-slate-800 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  /* BURAYA EKLENDİ: bg-white text-slate-800 */
                  className="w-full px-4 py-3 bg-white text-slate-800 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none font-medium"
                  placeholder="İsteğe bağlı..."
                ></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM DIALOG */}
      {dialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
            <p className="text-slate-800 font-bold mb-6">{dialog.message}</p>
            <div className="flex gap-3 justify-center">
              {dialog.type === "confirm" && (
                <button
                  onClick={closeDialog}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors w-full"
                >
                  İptal
                </button>
              )}
              <button
                onClick={() => {
                  if (dialog.type === "confirm") dialog.onConfirm();
                  else closeDialog();
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors w-full"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
