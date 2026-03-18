import './index.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import GrowtopiaSection from './components/GrowtopiaSection'
import SunflowerGarden from './components/SunflowerGarden'
import WhyILoveYou from './components/WhyILoveYou'
import LoveLetter from './components/LoveLetter'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <GrowtopiaSection />
        <SunflowerGarden />
        <WhyILoveYou />
        <LoveLetter />
      </main>
      <Footer />
    </>
  )
}

export default App
