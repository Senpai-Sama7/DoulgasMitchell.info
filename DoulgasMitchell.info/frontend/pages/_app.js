import '@/styles/globals.css'
import HeaderFooter from '@/components/HeaderFooter'
import { AnimatePresence } from 'framer-motion'

export default function App({ Component, pageProps, router }){
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
