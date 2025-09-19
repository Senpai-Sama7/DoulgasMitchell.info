import BentoGrid from '@/components/BentoGrid'
import PostCard from '@/components/PostCard'
import HeaderFooter from '@/components/HeaderFooter';

export async function getServerSideProps(){
  const base = process.env.CMS_INTERNAL_URL || process.env.CMS_PUBLIC_URL || 'http://localhost:3001';
  const [pageRes, postsRes] = await Promise.all([
    fetch(`${base}/api/pages?where[slug][equals]=home`),
    fetch(`${base}/api/posts?where[featured][equals]=true&limit=6&sort=-date`)
  ]);
  const pageData = await pageRes.json();
  const postsData = await postsRes.json();
  return { props: { homePage: pageData?.docs?.[0] || null, posts: postsData?.docs || [] } };
}

export default function Home({ homePage, posts }){
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>Share ideas in a modern <em>bento grid</em></h1>
          <p>Publish articles, videos, audio, galleries, and notes—then rearrange your homepage visually.</p>
        </div>
        <div className="phone-mock"><img alt="Phone mockup" src="/media/phone-frame.svg" /></div>
      </section>

      <BentoGrid layoutHtml={homePage?.layoutHtml} />

      <h2>Featured posts</h2>
      <section className="posts">
        {posts.map(p => <PostCard key={p.id || p.slug} post={p} />)}
      </section>
    </>
  );
}
