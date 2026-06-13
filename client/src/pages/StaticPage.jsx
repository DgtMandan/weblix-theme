import { SEO } from '../utils/seo.jsx';

export function StaticPage({ title }) {
  return (
    <section className="min-h-screen bg-[#0d0d0d] py-16 text-white">
      <SEO title={title} />
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-5xl font-black text-white">{title}</h1>
        <p className="mt-6 text-lg leading-8 text-white/70">
          This production page is ready for your exact copy and pixel-perfect design reference. It uses the shared Weblix layout, SEO component, and responsive premium styling.
        </p>
      </div>
    </section>
  );
}
