export default function BentoGrid({ layoutHtml }){
  if (!layoutHtml) return null;

  return (
    <section className="bento-grid" aria-live="polite">
      <div className="bento-grid__inner" dangerouslySetInnerHTML={{ __html: layoutHtml }} />
    </section>
  );
}
