import '@/styles/globals.css'
import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'

import { Header, Footer } from '@/components/HeaderFooter'
import { bootUX } from '@/lib/ux'

export default function App({ Component, pageProps, router }){
  useEffect(() => {
    bootUX();
  }, [router?.asPath]);

  return (
    <div className="site">
      <Header />
      <main className="container">
        <AnimatePresence mode="wait">
          <Component key={router.route} {...pageProps} />
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
