import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Megaphone, X } from 'lucide-react';
import { api, assetUrl } from '../../services/api.js';
import { Button } from '../common/Button.jsx';

export function AnnouncementPopup() {
  const location = useLocation();
  const [announcement, setAnnouncement] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;
    api.get('/announcements/active')
      .then(({ data }) => {
        if (!data?._id) return;
        const key = `weblix_announcement_closed_${data._id}`;
        if (data.showOnce && localStorage.getItem(key)) return;
        setAnnouncement(data);
        window.setTimeout(() => setVisible(true), 700);
      })
      .catch(() => {});
  }, [location.pathname]);

  function close() {
    if (announcement?.showOnce) localStorage.setItem(`weblix_announcement_closed_${announcement._id}`, '1');
    setVisible(false);
  }

  if (!announcement || !visible) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md">
      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-[24px] border border-white/10 bg-[#101010] text-white shadow-[0_40px_140px_rgba(0,0,0,0.65)] md:grid-cols-[0.9fr_1.1fr]">
        <button onClick={close} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-[10px] border border-white/10 bg-black/45 text-white/70 transition hover:border-[#4F7BFF] hover:text-white" aria-label="Close announcement">
          <X size={18} />
        </button>
        <div className="relative min-h-[240px] bg-[#06134A]">
          {announcement.image ? (
            <img src={assetUrl(announcement.image)} alt={announcement.title} className="h-full min-h-[240px] w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(79,123,255,0.45),transparent_34%),linear-gradient(135deg,#06134A,#0d0d0d)]">
              <Megaphone size={86} className="text-[#4F7BFF]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        </div>
        <div className="p-7 md:p-10">
          {announcement.badge && <span className="inline-flex rounded-full border border-[#4F7BFF]/35 bg-[#2155FF]/15 px-3 py-1 text-xs font900 uppercase tracking-[0.16em] text-[#8fabff]">{announcement.badge}</span>}
          <h2 className="mt-4 text-3xl font-medium leading-tight md:text-5xl">{announcement.title}</h2>
          {announcement.subtitle && <p className="mt-3 text-lg font700 text-[#4F7BFF]">{announcement.subtitle}</p>}
          <p className="mt-5 whitespace-pre-line text-base leading-7 text-white/62">{announcement.content}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {announcement.buttonText && announcement.buttonUrl && <Button to={announcement.buttonUrl}>{announcement.buttonText}</Button>}
            <button onClick={close} className="min-h-12 rounded-[10px] border border-white/15 bg-white/5 px-6 py-3.5 text-base font-medium text-white transition hover:border-[#4F7BFF] hover:text-[#4F7BFF]">Maybe later</button>
          </div>
        </div>
      </div>
    </div>
  );
}
