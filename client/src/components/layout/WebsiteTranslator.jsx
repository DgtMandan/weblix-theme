import { useEffect, useRef, useState } from 'react';
import { Languages } from 'lucide-react';

const languages = [
  ['en', 'English'],
  ['hi', 'Hindi'],
  ['es', 'Spanish'],
  ['fr', 'French'],
  ['de', 'German'],
  ['ar', 'Arabic'],
  ['pt', 'Portuguese'],
  ['ru', 'Russian'],
  ['zh-CN', 'Chinese'],
  ['ja', 'Japanese']
];

function applyLanguage(code) {
  const combo = document.querySelector('.goog-te-combo');
  if (!combo) return false;
  combo.value = code;
  combo.dispatchEvent(new Event('change'));
  return true;
}

export function WebsiteTranslator({ compact = false, onChange }) {
  const [language, setLanguage] = useState(localStorage.getItem('weblix_language') || 'en');
  const attempts = useRef(0);

  useEffect(() => {
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        if (!window.google?.translate?.TranslateElement) return;
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: languages.map(([code]) => code).join(','),
            autoDisplay: false
          },
          'google_translate_element'
        );
      };
    }

    if (!document.querySelector('script[data-weblix-translate]')) {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.dataset.weblixTranslate = 'true';
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (language === 'en') return;
    const timer = window.setInterval(() => {
      attempts.current += 1;
      if (applyLanguage(language) || attempts.current > 20) window.clearInterval(timer);
    }, 400);
    return () => window.clearInterval(timer);
  }, [language]);

  function changeLanguage(event) {
    const next = event.target.value;
    setLanguage(next);
    localStorage.setItem('weblix_language', next);
    if (next === 'en') {
      localStorage.removeItem('googtrans');
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=localhost';
      window.location.reload();
      return;
    }
    applyLanguage(next);
    onChange?.();
  }

  return (
    <div className={`relative inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 text-white transition hover:border-[#4F7BFF] ${compact ? 'w-full px-4 py-3' : 'px-3 py-2'}`}>
      <Languages size={17} className="text-[#4F7BFF]" />
      <select value={language} onChange={changeLanguage} className="w-full bg-transparent text-sm font800 outline-none [&_option]:bg-[#101010]">
        {languages.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
      </select>
      <div id="google_translate_element" className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0" />
    </div>
  );
}
