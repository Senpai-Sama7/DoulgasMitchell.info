export function Header(){
  return (
    <header>
      <div className="container inner">
        <div className="brand">
          <div className="logo" />
          <strong>Douglas Mitchell</strong>
        </div>
        <nav>
          <a href="/">Home</a>
          &nbsp;·&nbsp;
          <a href="/posts/designing-with-bento-grids">Bento Grids</a>
        </nav>
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
