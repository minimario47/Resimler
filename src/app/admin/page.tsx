'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  Image,
  Video,
  Link2,
  Plus,
  Settings,
  BarChart3,
  FolderOpen,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

type AdminView = 'login' | 'dashboard' | 'add-link' | 'media' | 'settings';

export default function AdminPage() {
  const [view, setView] = useState<AdminView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulated login - in production this would call an API
    await new Promise((r) => setTimeout(r, 1000));

    if (email === 'admin@example.com' && password === 'admin123') {
      setView('dashboard');
    } else {
      setError('Geçersiz e-posta veya şifre');
    }
    setIsLoading(false);
  };

  if (view === 'login') {
    return <LoginView
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      isLoading={isLoading}
      error={error}
      onSubmit={handleLogin}
    />;
  }

  return (
    <div className="min-h-screen bg-slate/5">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate text-white p-4 hidden lg:block">
        <div className="font-serif text-xl font-semibold mb-8 px-2">
          Admin Panel
        </div>

        <nav className="space-y-1">
          <NavButton
            icon={<BarChart3 className="w-5 h-5" />}
            label="Dashboard"
            active={view === 'dashboard'}
            onClick={() => setView('dashboard')}
          />
          <NavButton
            icon={<Link2 className="w-5 h-5" />}
            label="Link Ekle"
            active={view === 'add-link'}
            onClick={() => setView('add-link')}
          />
          <NavButton
            icon={<FolderOpen className="w-5 h-5" />}
            label="Medya Yönetimi"
            active={view === 'media'}
            onClick={() => setView('media')}
          />
          <NavButton
            icon={<Settings className="w-5 h-5" />}
            label="Ayarlar"
            active={view === 'settings'}
            onClick={() => setView('settings')}
          />
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => setView('login')}
            className="w-full px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 bg-slate text-white p-4 z-40">
        <div className="flex items-center justify-between">
          <span className="font-serif text-lg font-semibold">Admin Panel</span>
          <button
            onClick={() => setView('login')}
            className="text-sm text-white/60"
          >
            Çıkış
          </button>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate text-white safe-bottom z-40">
        <div className="flex justify-around py-2">
          <MobileNavButton
            icon={<BarChart3 className="w-5 h-5" />}
            label="Dashboard"
            active={view === 'dashboard'}
            onClick={() => setView('dashboard')}
          />
          <MobileNavButton
            icon={<Link2 className="w-5 h-5" />}
            label="Ekle"
            active={view === 'add-link'}
            onClick={() => setView('add-link')}
          />
          <MobileNavButton
            icon={<FolderOpen className="w-5 h-5" />}
            label="Medya"
            active={view === 'media'}
            onClick={() => setView('media')}
          />
          <MobileNavButton
            icon={<Settings className="w-5 h-5" />}
            label="Ayarlar"
            active={view === 'settings'}
            onClick={() => setView('settings')}
          />
        </div>
      </nav>

      {/* Main content */}
      <main className="lg:ml-64 p-4 lg:p-8 pb-24 lg:pb-8">
        {view === 'dashboard' && <DashboardView />}
        {view === 'add-link' && <AddLinkView />}
        {view === 'media' && <MediaManagementView />}
        {view === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

// Login View Component
function LoginView({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isLoading,
  error,
  onSubmit,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  isLoading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="min-h-screen bg-slate flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-cream rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-accent" />
            </div>
            <h1 className="font-serif text-2xl font-bold">Admin Girişi</h1>
            <p className="text-slate/60 text-sm mt-2">
              Yönetim paneline erişmek için giriş yapın
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate/20 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-slate/20 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate/40 hover:text-slate"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Giriş Yap
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate/40 mt-6">
            Demo: admin@example.com / admin123
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Dashboard View
function DashboardView() {
  const stats = [
    { label: 'Toplam Fotoğraf', value: 312, icon: <Image className="w-6 h-6" /> },
    { label: 'Toplam Video', value: 45, icon: <Video className="w-6 h-6" /> },
    { label: 'Kategoriler', value: 3, icon: <FolderOpen className="w-6 h-6" /> },
    { label: 'Kullanıcılar', value: 2, icon: <Users className="w-6 h-6" /> },
  ];

  const recentActivity = [
    { action: 'Link çözümlendi', detail: '156 medya bulundu', time: '2 saat önce', status: 'success' },
    { action: 'Albüm oluşturuldu', detail: 'Kına Gecesi', time: '5 saat önce', status: 'success' },
    { action: 'iCloud hatası', detail: 'Bazı dosyalar alınamadı', time: '1 gün önce', status: 'error' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-bold">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-slate/60">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Son Aktivite</h2>
        <div className="space-y-3">
          {recentActivity.map((activity, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate/5 rounded-lg">
              {activity.status === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-slate/60">{activity.detail}</p>
              </div>
              <span className="text-xs text-slate/40 flex items-center gap-1 whitespace-nowrap">
                <Clock className="w-3 h-3" />
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-4 bg-accent/10 hover:bg-accent/20 rounded-xl transition-colors text-left">
            <Link2 className="w-6 h-6 text-accent mb-2" />
            <p className="font-medium">Link Ekle</p>
            <p className="text-sm text-slate/60">Google Drive veya iCloud</p>
          </button>
          <button className="p-4 bg-slate/5 hover:bg-slate/10 rounded-xl transition-colors text-left">
            <Plus className="w-6 h-6 text-slate mb-2" />
            <p className="font-medium">Albüm Oluştur</p>
            <p className="text-sm text-slate/60">Yeni koleksiyon</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Link View
function AddLinkView() {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkType, setLinkType] = useState<'google_drive' | 'icloud'>('google_drive');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<{ count: number; previews: string[] } | null>(null);

  const handleParse = async () => {
    setIsParsing(true);
    // Simulated parsing
    await new Promise((r) => setTimeout(r, 2000));
    setParseResult({
      count: 156,
      previews: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=200',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=200',
        'https://images.unsplash.com/photo-1529636798458-92182e662485?w=200',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=200',
      ],
    });
    setIsParsing(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-serif text-2xl font-bold">Link Ekle</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="space-y-4">
          {/* Link type selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Kaynak Türü</label>
            <div className="flex gap-2">
              <button
                onClick={() => setLinkType('google_drive')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  linkType === 'google_drive'
                    ? 'border-accent bg-accent/5'
                    : 'border-slate/20 hover:border-slate/40'
                }`}
              >
                <span className="font-medium">Google Drive</span>
              </button>
              <button
                onClick={() => setLinkType('icloud')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  linkType === 'icloud'
                    ? 'border-accent bg-accent/5'
                    : 'border-slate/20 hover:border-slate/40'
                }`}
              >
                <span className="font-medium">iCloud</span>
              </button>
            </div>
          </div>

          {/* Link input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Paylaşılan Klasör Linki
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate/40" />
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate/20 focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder={
                  linkType === 'google_drive'
                    ? 'https://drive.google.com/drive/folders/...'
                    : 'https://www.icloud.com/sharedalbum/...'
                }
              />
            </div>
          </div>

          {/* Warning for iCloud */}
          {linkType === 'icloud' && (
            <div className="p-3 bg-amber-50 text-amber-700 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              iCloud paylaşımlarında bazı dosyalar doğrudan çekilemeyebilir. 
              Google Drive önerilir.
            </div>
          )}

          {/* Parse button */}
          <button
            onClick={handleParse}
            disabled={!linkUrl || isParsing}
            className="w-full py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isParsing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Çözümleniyor...
              </>
            ) : (
              <>
                <Link2 className="w-5 h-5" />
                Linki Çözümle
              </>
            )}
          </button>
        </div>

        {/* Parse results */}
        {parseResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-6 border-t border-slate/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-green-600">
                  <CheckCircle className="w-5 h-5 inline mr-2" />
                  Link çözümlendi!
                </p>
                <p className="text-sm text-slate/60">
                  {parseResult.count} adet medya bulundu
                </p>
              </div>
            </div>

            {/* Preview thumbnails */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
              {parseResult.previews.map((url, i) => (
                <div
                  key={i}
                  className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                >
                  <img
                    src={url}
                    alt={`Önizleme ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {parseResult.count > 4 && (
                <div className="w-20 h-20 rounded-lg bg-slate/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm text-slate/60">
                    +{parseResult.count - 4}
                  </span>
                </div>
              )}
            </div>

            {/* Import options */}
            <div className="space-y-3">
              <select className="w-full py-2 px-3 rounded-lg border border-slate/20">
                <option value="">Kategori seçin...</option>
                <option value="dugunden-once">Düğünden Önce</option>
                <option value="kina-gecesi">Kına Gecesi</option>
                <option value="dugun">Düğün</option>
              </select>

              <button className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                <CheckCircle className="w-5 h-5 inline mr-2" />
                Tümünü İçe Aktar
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Media Management View
function MediaManagementView() {
  const mockMedia = [
    { id: '1', title: 'Düğün - 1', thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200', type: 'photo' },
    { id: '2', title: 'Düğün - 2', thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=200', type: 'photo' },
    { id: '3', title: 'Düğün - 3', thumbnail: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=200', type: 'video' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold">Medya Yönetimi</h1>
        <button className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors">
          <Plus className="w-4 h-4 inline mr-1" />
          Ekle
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate/5">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium">Medya</th>
              <th className="text-left py-3 px-4 text-sm font-medium hidden md:table-cell">Tür</th>
              <th className="text-left py-3 px-4 text-sm font-medium hidden md:table-cell">Durum</th>
              <th className="text-right py-3 px-4 text-sm font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate/10">
            {mockMedia.map((item) => (
              <tr key={item.id} className="hover:bg-slate/5">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-medium">{item.title}</span>
                  </div>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.type === 'video' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {item.type === 'video' ? 'Video' : 'Fotoğraf'}
                  </span>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <span className="text-green-600 text-sm">Yayında</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-sm text-accent hover:underline">
                    Düzenle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Settings View
function SettingsView() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-serif text-2xl font-bold">Ayarlar</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="font-semibold mb-4">Genel Ayarlar</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Site Başlığı</label>
              <input
                type="text"
                defaultValue="Özlem & Zübeyir — Nusaybin Anıları"
                className="w-full px-4 py-2 rounded-lg border border-slate/20 focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Açıklama</label>
              <textarea
                rows={3}
                defaultValue="Özlem ve Zübeyir'in Nusaybin'deki düğün haftasından fotoğraf ve video arşivi"
                className="w-full px-4 py-2 rounded-lg border border-slate/20 focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate/10">
          <h2 className="font-semibold mb-4">API Anahtarları</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Google Drive API Anahtarı
              </label>
              <input
                type="password"
                placeholder="••••••••••••••••"
                className="w-full px-4 py-2 rounded-lg border border-slate/20 focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>
        </div>

        <button className="w-full py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition-colors">
          Kaydet
        </button>
      </div>
    </div>
  );
}

// Navigation button components
function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function MobileNavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 ${
        active ? 'text-accent' : 'text-white/60'
      }`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}
