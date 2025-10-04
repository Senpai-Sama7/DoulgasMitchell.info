import Link from 'next/link';

export function Header(){
  return (
    <header>
      <div className="container inner">
        <div className="brand">
          <div className="logo" aria-hidden="true" />
          <strong>Douglas Mitchell</strong>
        </div>
        <nav aria-label="Primary">
          <Link href="/">Home</Link>
          <span aria-hidden="true">·</span>
          <Link href="/posts/designing-with-bento-grids">Bento Grids</Link>
        </nav>
        <button
          id="theme-btn"
          type="button"
          className="theme-toggle"
          aria-label="Toggle color theme"
          aria-live="polite"
        >
          <span className="theme-toggle__icon" aria-hidden="true">☾</span>
        </button>
      </div>
    </header>
  );
}

export function Footer(){
  return (
    <footer>
      <div className="container inner">
        © {new Date().getFullYear()} Douglas Mitchell · Built with Payload + Next.js
      </div>
    </footer>
  );
}
