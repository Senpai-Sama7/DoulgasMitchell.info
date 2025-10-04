import { Html, Head, Main, NextScript } from 'next/document'

export default function Document(){
  return (
    <Html lang="en">
      <Head>
        {/* The <link> tag for Font Awesome should be removed from here and imported in _app.js */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
