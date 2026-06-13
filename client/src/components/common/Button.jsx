import { Link } from 'react-router-dom';

export function Button({ children, to, variant = 'primary', className = '', ...props }) {
  const classes = `inline-flex min-h-12 items-center justify-center rounded-[10px] px-6 py-3.5 text-base font-medium transition ${
    variant === 'primary'
      ? 'bg-[#2155FF] text-white shadow-premium hover:-translate-y-0.5 hover:bg-[#4F7BFF]'
      : 'border border-white/15 bg-white/5 text-white shadow-glass backdrop-blur hover:border-[#4F7BFF] hover:bg-[#4F7BFF]/10'
  } ${className}`;
  if (to) return <Link to={to} className={classes}>{children}</Link>;
  return <button className={classes} {...props}>{children}</button>;
}
