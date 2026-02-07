import BentoGrid from '@/components/BentoGrid'
import PostCard from '@/components/PostCard'

export async function getServerSideProps(){
  const base = process.env.CMS_INTERNAL_URL || process.env.CMS_PUBLIC_URL || 'http://localhost:3001';
  let homePage = null;
  let posts = [];
  let hadError = false;

  try {
    const [pageRes, postsRes] = await Promise.all([
      fetch(`${base}/api/pages?where[slug][equals]=home`),
      fetch(`${base}/api/posts?where[featured][equals]=true&limit=6&sort=-date`)
    ]);

    if (pageRes.ok) {
      const pageData = await pageRes.json();
      homePage = pageData?.docs?.[0] || null;
    } else {
      hadError = true;
      console.error('Failed to load home page layout', pageRes.status, pageRes.statusText);
    }

    if (postsRes.ok) {
      const postsData = await postsRes.json();
      posts = Array.isArray(postsData?.docs) ? postsData.docs : [];
    } else {
      hadError = true;
      console.error('Failed to load featured posts', postsRes.status, postsRes.statusText);
    }
  } catch (error) {
    hadError = true;
    console.error('Unable to reach Payload CMS', error);
  }

  return { props: { homePage, posts, hadError } };
}

export default function Home({ homePage, posts, hadError }){
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>Share ideas in a modern <em>bento grid</em></h1>
          <p>Publish articles, videos, audio, galleries, and notes—then rearrange your homepage visually.</p>
        </div>
        <div className="phone-mock"><img alt="Phone mockup" src="/media/phone-frame.svg" /></div>
      </section>

      {hadError && (
        <p className="error-callout">
          Unable to reach the CMS right now. Showing the latest saved layout and posts when available.
        </p>
      )}

      {homePage?.layoutHtml ? (
        <BentoGrid layoutHtml={homePage.layoutHtml} />
      ) : (
        <p className="empty-state">Design your homepage in the admin to see the Bento layout here.</p>
      )}

      <h2>Featured posts</h2>
      {posts.length > 0 ? (
        <section className="posts">
          {posts.map(p => <PostCard key={p.id || p.slug} post={p} />)}
        </section>
      ) : (
        <p className="empty-state">Mark posts as featured in Payload to populate this section.</p>
      )}
    </>
  );
}
