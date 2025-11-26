'use client'

import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/sections/Hero'
import Features from '@/components/sections/Features'
import About from '@/components/sections/About'
import Contact from '@/components/sections/Contact'
import Footer from '@/components/layout/Footer'
import { useTheme } from '@/contexts/ThemeContext'

export default function Home() {
  const { theme } = useTheme()
  
  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: theme === 'dark' ? '#111827' : '#ffffff' }}
    >
      <Navbar />
      <Hero />
      <Features />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}
