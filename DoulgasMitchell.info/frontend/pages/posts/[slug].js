export async function getServerSideProps({ params }){
  const base = process.env.CMS_INTERNAL_URL || process.env.CMS_PUBLIC_URL || 'http://localhost:3001';
  const res = await fetch(`${base}/api/posts?where[slug][equals]=${params.slug}`);
  const data = await res.json();
  if(!data?.docs?.length){ return { notFound: true }; }
  return { props: { post: data.docs[0] } };
}

export default function PostPage({ post }){
  return (
    <article style={{ padding: '16px 0 40px' }}>
      <p style={{ color: '#9CA3AF' }}>{post.kind} · {post.date ? new Date(post.date).toLocaleDateString() : ''}</p>
      <h1 style={{ margin: '.2rem 0 1rem' }}>{post.title}</h1>
      {post.kind === 'Video' && post.videoUrl && (
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #1F2937', marginBottom: 12 }}>
          <iframe src={post.videoUrl} style={{ width:'100%', aspectRatio:'16/9', border:0 }} allowFullScreen title={post.title} />
        </div>
      )}
      {post.kind === 'Audio' && post.audioUrl && (
        <p><audio controls src={post.audioUrl} /></p>
      )}
      {post.kind === 'Gallery' && Array.isArray(post.gallery) && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:12 }}>
          {post.gallery.map((g, idx) => (
            <img key={idx} src={g.imageUrl} alt={g.alt || ''} style={{ width: '100%', borderRadius: 12, border:'1px solid #1F2937' }} />
          ))}
        </div>
      )}
      {post.contentHtml && <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />}
    </article>
  );
}
