export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-lg border border-white/10 bg-[#0A0F2C] p-6 text-white shadow-glass backdrop-blur ${className}`}>
      {children}
    </div>
  );
}
