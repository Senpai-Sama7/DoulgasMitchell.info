export default function BentoGrid({ layoutHtml }){
  if(!layoutHtml) return null;
  // We trust content from our own CMS; it includes inline <style> from the editor
  return <div className="bento-grid" dangerouslySetInnerHTML={{ __html: layoutHtml }} />;
}
