'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, Search, User, ShoppingBag } from 'lucide-react';

import { useCartStore } from '@/store/useCartStore';       // Adjust path if needed
import { useNavSateStore } from '@/store/navStore';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  // Zustand states
  const { openNavModal ,openWomen,openMen,isWomenOpen,isMenOpen,clearGender} = useNavSateStore();
  const { setIsCartOpen, items } = useCartStore();

  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Handle background transition on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
    className={` top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-transparent py-5':'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-3.5'
          
      }`}
    >
        
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left Section: Menu Toggle & Navigation Links */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => openNavModal()}
            className="text-gray-900 hover:opacity-75 transition-opacity cursor-pointer p-1"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 stroke-[1.75]" />
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-900">
            {/* Home Link */}
            <Link
              href="/"
              onClick={()=>clearGender()}
              className={`relative py-1 transition-colors hover:text-black ${
                !(isMenOpen ||isWomenOpen )&& pathname === '/' ? 'text-black font-semibold' : 'text-gray-700'
              }`}
            >
              Home
              {!(isMenOpen ||isWomenOpen )&&  pathname === '/' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black rounded-full" />
              )}
            </Link>
 {/* Men Link */}
 <div
              onClick={()=>openMen()}
              className={`relative py-1 transition-colors hover:text-black ${
                isMenOpen ? 'text-black font-semibold' : 'text-gray-700'
              }`}
            >
              Men
              {isMenOpen && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black rounded-full" />
              )}
            </div>
            {/* Women Link */}
            <div
              onClick={()=>openWomen()}
              className={`relative py-1 transition-colors hover:text-black ${
                isWomenOpen ? 'text-black font-semibold' : 'text-gray-700'
              }`}
            >
              Women
              {isWomenOpen && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black rounded-full" />
              )}
            </div>

           
          </nav>
        </div>

        {/* Center Section: Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" className="block">
            <div className="relative h-8 w-36 sm:h-10 sm:w-44">
              <Image
                src="/logo.png"
                alt="Urban Collection Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Right Section: Icons (Search, Profile, Cart) */}
        <div className="flex items-center gap-5 text-gray-900">
          <button
            type="button"
            className="hover:opacity-75 transition-opacity cursor-pointer p-1"
            aria-label="Search"
          >
            <Search className="w-5 h-5 stroke-[1.75]" />
          </button>

          <Link
            href="/account"
            className="hover:opacity-75 transition-opacity cursor-pointer p-1"
            aria-label="Account"
          >
            <User className="w-5 h-5 stroke-[1.75]" />
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            type="button"
            className="relative hover:opacity-75 transition-opacity cursor-pointer p-1"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};