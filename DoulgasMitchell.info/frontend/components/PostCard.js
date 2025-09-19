import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PostCard({ post }){
  const date = post.date ? new Date(post.date).toLocaleDateString() : '';
  return (
    <motion.article className="post-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="media" />
      <div className="body">
        <div className="meta">{post.kind} · {date}</div>
        <h3>{post.title}</h3>
        {post.excerpt && <p>{post.excerpt}</p>}
        <p><Link href={`/posts/${post.slug}`}>Read more →</Link></p>
      </div>
    </motion.article>
  );
}
