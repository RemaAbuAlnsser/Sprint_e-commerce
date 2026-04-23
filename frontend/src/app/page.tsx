import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import FeaturesBar from '@/components/home/FeaturesBar'
import CategoriesSection from '@/components/home/CategoriesSection'
import ProductsSection from '@/components/home/ProductsSection'
import BrandsSection from '@/components/home/BrandsSection'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Navbar />
      <main className="flex-1">
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Bar */}
      <FeaturesBar />
      
      {/* Categories Section */}
      <CategoriesSection />
      
      {/* Products from Database */}
      <ProductsSection />
      
      {/* Brands Section */}
      <BrandsSection />
      </main>
      
      <Footer />
    </div>
  )
}
