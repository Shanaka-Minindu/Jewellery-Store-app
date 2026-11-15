'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, User } from 'lucide-react';
import { useNavSateStore } from '@/store/navStore';
import { categoryService } from '@/services/categoryService';
import { CategoryResDto } from '@/types/category';

export const NavDrawer: React.FC = () => {
  const {
    isUpdateOpen: isNavOpen,
    closeNavModal,
    isMenOpen,
    isWomenOpen,
    openMen,
    openWomen,
    clearGender,
  } = useNavSateStore();

  const [categories, setCategories] = useState<CategoryResDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories when drawer opens
  useEffect(() => {
    if (isNavOpen) {
      const loadCategories = async () => {
        setIsLoading(true);
        try {
          const data = await categoryService.fetchCategories();
          setCategories(data);
        } catch (error) {
          console.error('Failed to load categories', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadCategories();
    }
  }, [isNavOpen]);

  // Filter subcategories by gender matching your backend data structure
  const menCategories = categories.filter(
    (cat) => cat.gender === 'MALE' || cat.gender === 'UNISEX'
  );
  const womenCategories = categories.filter(
    (cat) => cat.gender === 'FEMALE' || cat.gender === 'UNISEX'
  );

  const handleToggleMen = () => {
    if (isMenOpen) {
      clearGender();
    } else {
      openMen();
    }
  };

  const handleToggleWomen = () => {
    if (isWomenOpen) {
      clearGender();
    } else {
      openWomen();
    }
  };

  return (
    <AnimatePresence>
      {isNavOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={closeNavModal}
            className="fixed inset-0 bg-black cursor-pointer"
          />

          {/* Left Sliding Drawer Container */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto"
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <span className="text-lg font-normal tracking-widest text-gray-900">
                  MENU
                </span>
                <button
                  onClick={closeNavModal}
                  className="text-gray-900 hover:opacity-75 transition-opacity cursor-pointer p-1"
                  aria-label="Close Menu"
                >
                  <X className="w-6 h-6 stroke-[1.5]" />
                </button>
              </div>

              {/* Navigation Links List */}
              <div className="px-6 py-4 space-y-1 tracking-wide">
                {/* Home */}
                <div className="border-b border-gray-200 py-4">
                  <Link
                    href="/"
                    onClick={() => {
                      clearGender();
                      closeNavModal();
                    }}
                    className="block text-sm text-gray-900 hover:opacity-60 transition-opacity"
                  >
                    HOME
                  </Link>
                </div>

                {/* Mens Collapsible Section */}
                <div className="border-b border-gray-200 py-4">
                  <button
                    onClick={handleToggleMen}
                    className="w-full flex items-center justify-between hover:opacity-60 transition-opacity text-left"
                  >
                    <span
                      className={`transition-all duration-200 ${
                        isMenOpen
                          ? 'text-xs text-gray-400 font-normal uppercase tracking-wider'
                          : 'text-sm text-gray-900 font-normal'
                      }`}
                    >
                      MENS
                    </span>
                    {isMenOpen ? (
                      <Minus className="w-4 h-4 stroke-[1.5] text-gray-400" />
                    ) : (
                      <Plus className="w-4 h-4 stroke-[1.5]" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isMenOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden flex flex-col space-y-3 pt-3 pl-2"
                      >
                        {isLoading ? (
                          <p className="text-xs text-gray-400 py-1">Loading categories...</p>
                        ) : (
                          menCategories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/store/men?category=${cat.id}`}
                              onClick={closeNavModal}
                              className="text-gray-900 font-medium text-base hover:opacity-60 py-1 transition-colors"
                            >
                              {cat.title}
                            </Link>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Womens Collapsible Section */}
                <div className="border-b border-gray-200 py-4">
                  <button
                    onClick={handleToggleWomen}
                    className="w-full flex items-center justify-between hover:opacity-60 transition-opacity text-left"
                  >
                    <span
                      className={`transition-all duration-200 ${
                        isWomenOpen
                          ? 'text-xs text-gray-400 font-normal uppercase tracking-wider'
                          : 'text-sm text-gray-900 font-normal'
                      }`}
                    >
                      WOMENS
                    </span>
                    {isWomenOpen ? (
                      <Minus className="w-4 h-4 stroke-[1.5] text-gray-400" />
                    ) : (
                      <Plus className="w-4 h-4 stroke-[1.5]" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isWomenOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden flex flex-col space-y-3 pt-3 pl-2"
                      >
                        {isLoading ? (
                          <p className="text-xs text-gray-400 py-1">Loading categories...</p>
                        ) : (
                          womenCategories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/store/women?category=${cat.id}`}
                              onClick={closeNavModal}
                              className="text-gray-900 font-medium text-base hover:opacity-60 py-1 transition-colors"
                            >
                              {cat.title}
                            </Link>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Latest Drop */}
                <div className="border-b border-gray-200 py-4">
                  <Link
                    href="/store/latest"
                    onClick={closeNavModal}
                    className="block text-sm text-gray-900 hover:opacity-60 transition-opacity"
                  >
                    LATEST DROP
                  </Link>
                </div>

                {/* Flash Sale */}
                <div className="py-4">
                  <Link
                    href="/store/sale"
                    onClick={closeNavModal}
                    className="block text-sm text-gray-900 hover:opacity-60 transition-opacity"
                  >
                    FLASH SALE
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Footer Action (Log in) */}
            <div className="px-6 py-6 border-t border-gray-200">
              <Link
                href="/account/login"
                onClick={closeNavModal}
                className="flex items-center gap-3 text-sm tracking-wide text-gray-900 hover:opacity-60 transition-opacity"
              >
                <User className="w-5 h-5 stroke-[1.5]" />
                <span>Log in</span>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};