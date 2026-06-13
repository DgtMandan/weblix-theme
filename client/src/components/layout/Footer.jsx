import { Link } from 'react-router-dom';
import weblixLogo from '../../assets/weblix-logo.png';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0d0d0d] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <img src={weblixLogo} alt="Weblix Website Builder" className="h-14 w-auto object-contain" />
          <p className="mt-3 text-sm text-white/65">Premium builder ZIPs and templates for modern web teams.</p>
        </div>
        {[
          ['Product', ['Pricing', 'Templates', 'Blog', 'Search']],
          ['Company', ['About', 'Contact', 'Request Custom Website', 'FAQ']],
          ['Legal', ['Privacy Policy', 'Terms & Conditions']]
        ].map(([title, items]) => (
          <div key={title}>
            <h4 className="font800">{title}</h4>
            <div className="mt-3 grid gap-2 text-sm text-white/55">
              {items.map((item) => <Link className="transition hover:text-lightBlue" key={item} to={`/${item.toLowerCase().replaceAll(' ', '-').replaceAll('&', 'and')}`}>{item}</Link>)}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
