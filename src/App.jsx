import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MainCategories from './components/MainCategories';
import ProductCatalog from './components/ProductCatalog';
import ProductModal from './components/ProductModal';
import ProductDetailPage from './components/ProductDetailPage';
import BuyNowModal from './components/BuyNowModal';
import AboutSection from './components/AboutSection';
import ReviewsSection from './components/ReviewsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import AdminPage from './components/AdminPage';
import AdminLogin from './components/AdminLogin';
import WhatsappPopupModal from './components/WhatsappPopupModal';
import FloatingWhatsapp from './components/FloatingWhatsapp';
import SplashLoader from './components/SplashLoader';
import { INITIAL_PRODUCTS, INITIAL_HOMEPAGE_MEDIA, INITIAL_REVIEWS, INITIAL_ORDERS } from './data/initialProducts';
import { isAdministratorUploadedImage } from './utils/assetHelper';
import {
  fetchFullCloudData,
  syncProductsToCloud,
  syncMediaToCloud,
  syncReviewsToCloud,
  syncOrdersToCloud,
  saveProductToCloud,
  deleteProductFromCloud,
  subscribeToCloudProducts,
  subscribeToCloudMedia,
  subscribeToCloudReviews,
  subscribeToCloudOrders,
  markProductIdAsDeleted,
  clearDeletedProductIds,
  safeSetLocalStorage
} from './services/cloudSyncService';

const STORAGE_PRODUCTS = 'dzone_products_v2';
const STORAGE_MEDIA = 'dzone_homepage_media_v1';
const STORAGE_REVIEWS = 'dzone_reviews_v1';
const STORAGE_AUTH = 'dzone_admin_auth_v1';
const STORAGE_ORDERS = 'dzone_orders_v1';
const STORAGE_ADMIN_SESSION = 'dzone_admin_logged_in_v1';
const STORAGE_THEME = 'dzone_theme_mode';

const sanitizeProductArray = (list) => {
  if (!Array.isArray(list)) return [];
  return list
    .filter((p) => p && p.id)
    .map((p) => {
      const fixImg = (imgStr) => {
        if (!isAdministratorUploadedImage(imgStr)) return null;
        return imgStr.trim();
      };

      let validImages = Array.isArray(p.images) ? p.images.map(fixImg).filter(Boolean) : [];
      let validMainImg = fixImg(p.image);

      if (validImages.length === 0 && validMainImg) {
        validImages = [validMainImg];
      } else if (!validMainImg && validImages.length > 0) {
        validMainImg = validImages[0];
      } else if (validImages.length === 0 && !validMainImg) {
        validImages = [];
        validMainImg = '';
      }

      return {
        ...p,
        image: validMainImg,
        images: validImages
      };
    });
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // 0. Dark / Light Mode Theme State
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (err) { }
    return 'light';
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(STORAGE_THEME, theme);
    } catch (e) { }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // 1. Products State: Initialized from local cache (if any) or empty until Cloud syncs
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRODUCTS);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeProductArray(parsed);
        }
      }
    } catch (err) { }
    return [];
  });

  // 2. Homepage Media Banners State
  const [homepageMedia, setHomepageMedia] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MEDIA);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return { ...INITIAL_HOMEPAGE_MEDIA, ...parsed };
      }
    } catch (err) { }
    return INITIAL_HOMEPAGE_MEDIA;
  });

  // 3. Customer Reviews State
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REVIEWS);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) { }
    return INITIAL_REVIEWS;
  });

  // 4. Admin Auth State (Default: dzone / dzone123)
  const [adminAuth, setAdminAuth] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUTH);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username && parsed.password) return parsed;
      }
    } catch (err) { }
    return { username: 'dzone', password: 'dzone123' };
  });

  // 5. Orders & Customer Leads State
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) { }
    return INITIAL_ORDERS;
  });

  const [activeTab, setActiveTab] = useState('HOME');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [selectedBuyNowProduct, setSelectedBuyNowProduct] = useState(null);

  // Popups & Admin Route States
  const [showWhatsappPopup, setShowWhatsappPopup] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  // Persistent Admin Session (Stays logged in per device)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_ADMIN_SESSION) === 'true';
    } catch (err) {
      return false;
    }
  });

  // 6. Automatic Real-Time Cross-Device Cloud Sync with Active Revalidation
  useEffect(() => {
    let isMounted = true;

    // Real-time Firestore live listener across all devices
    const unsubProducts = subscribeToCloudProducts((cloudProducts) => {
      if (!isMounted || !Array.isArray(cloudProducts)) return;
      const sanitized = sanitizeProductArray(cloudProducts);
      setProducts(sanitized);
      safeSetLocalStorage(STORAGE_PRODUCTS, JSON.stringify(sanitized));
    });

    const unsubMedia = subscribeToCloudMedia((cloudMedia) => {
      if (!isMounted || !cloudMedia) return;
      setHomepageMedia((prev) => ({ ...prev, ...cloudMedia }));
      safeSetLocalStorage(STORAGE_MEDIA, JSON.stringify(cloudMedia));
    });

    const unsubReviews = subscribeToCloudReviews((cloudReviews) => {
      if (!isMounted || !Array.isArray(cloudReviews)) return;
      if (cloudReviews.length > 0) {
        setReviews(cloudReviews);
        safeSetLocalStorage(STORAGE_REVIEWS, JSON.stringify(cloudReviews));
      }
    });

    const unsubOrders = subscribeToCloudOrders((cloudOrders) => {
      if (!isMounted || !Array.isArray(cloudOrders)) return;
      setOrders(cloudOrders);
      safeSetLocalStorage(STORAGE_ORDERS, JSON.stringify(cloudOrders));
    });

    // Initial direct fetch on mount to immediately hydrate freshest Cloud state
    const fetchInitial = async () => {
      try {
        const cloudData = await fetchFullCloudData();
        if (!isMounted || !cloudData) return;
        if (Array.isArray(cloudData.products)) {
          const sanitized = sanitizeProductArray(cloudData.products);
          setProducts(sanitized);
          safeSetLocalStorage(STORAGE_PRODUCTS, JSON.stringify(sanitized));
        }
        if (cloudData.media && typeof cloudData.media === 'object') {
          setHomepageMedia((prev) => ({ ...prev, ...cloudData.media }));
          safeSetLocalStorage(STORAGE_MEDIA, JSON.stringify(cloudData.media));
        }
        if (Array.isArray(cloudData.reviews) && cloudData.reviews.length > 0) {
          setReviews(cloudData.reviews);
          safeSetLocalStorage(STORAGE_REVIEWS, JSON.stringify(cloudData.reviews));
        }
        if (Array.isArray(cloudData.orders)) {
          setOrders(cloudData.orders);
          safeSetLocalStorage(STORAGE_ORDERS, JSON.stringify(cloudData.orders));
        }
      } catch (err) {
        console.warn('Initial cloud fetch error:', err);
      }
    };

    fetchInitial();

    // Revalidate when visitor or admin switches back to the browser tab
    const handleRevalidate = () => {
      if (document.visibilityState === 'visible') {
        fetchInitial();
      }
    };
    document.addEventListener('visibilitychange', handleRevalidate);
    window.addEventListener('focus', handleRevalidate);

    return () => {
      isMounted = false;
      unsubProducts();
      unsubMedia();
      unsubReviews();
      unsubOrders();
      document.removeEventListener('visibilitychange', handleRevalidate);
      window.removeEventListener('focus', handleRevalidate);
    };
  }, []);

  // Sync states to LocalStorage
  useEffect(() => {
    safeSetLocalStorage(STORAGE_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_MEDIA, JSON.stringify(homepageMedia));
  }, [homepageMedia]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_AUTH, JSON.stringify(adminAuth));
  }, [adminAuth]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_ADMIN_SESSION, isAdminLoggedIn ? 'true' : 'false');
  }, [isAdminLoggedIn]);

  // Real-time Storage Listener across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_ORDERS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setOrders(parsed);
        } catch (err) { }
      }
      if (e.key === STORAGE_PRODUCTS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setProducts(parsed);
        } catch (err) { }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check URL Hash for #admin link
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setIsAdminRoute(true);
      } else {
        setIsAdminRoute(false);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigation handlers
  const handleSelectCategory = (categoryKey) => {
    setSelectedProductDetail(null);
    setSelectedCategory(categoryKey);
    setActiveTab(categoryKey);
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreClick = () => {
    setSelectedProductDetail(null);
    setSelectedCategory('ALL');
    setActiveTab('WATCHES');
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Product & Data Mutations with Instant Cross-Device Cloud Sync
  const handleAddProduct = async (newProduct) => {
    const productWithId = { ...newProduct, id: newProduct.id || `p-${Date.now()}` };
    const sanitized = sanitizeProductArray([productWithId])[0] || productWithId;
    let updatedProducts = [];
    setProducts((prev) => {
      updatedProducts = sanitizeProductArray([sanitized, ...prev.filter(p => p.id !== sanitized.id)]);
      safeSetLocalStorage(STORAGE_PRODUCTS, JSON.stringify(updatedProducts));
      return updatedProducts;
    });
    if (newProduct.category) {
      setSelectedCategory(newProduct.category);
    }
    await saveProductToCloud(sanitized);
    await syncProductsToCloud(updatedProducts);
  };

  const handleUpdateProduct = async (id, updatedFields) => {
    let updatedItem = null;
    let updatedProducts = [];
    setProducts((prev) => {
      updatedProducts = sanitizeProductArray(
        prev.map((item) => {
          if (item.id === id) {
            updatedItem = { ...item, ...updatedFields };
            return updatedItem;
          }
          return item;
        })
      );
      safeSetLocalStorage(STORAGE_PRODUCTS, JSON.stringify(updatedProducts));
      return updatedProducts;
    });
    if (updatedItem) {
      await saveProductToCloud(updatedItem);
    }
    await syncProductsToCloud(updatedProducts);
  };

  const handleDeleteProduct = async (id) => {
    markProductIdAsDeleted(id);
    let updated = [];
    setProducts((prev) => {
      updated = prev.filter((item) => String(item.id) !== String(id));
      safeSetLocalStorage(STORAGE_PRODUCTS, JSON.stringify(updated));
      return updated;
    });
    await deleteProductFromCloud(id);
    await syncProductsToCloud(updated);
  };

  const handleToggleStock = async (id) => {
    let toggledItem = null;
    let updated = [];
    setProducts((prev) => {
      updated = prev.map((item) => {
        if (item.id === id) {
          toggledItem = { ...item, inStock: !item.inStock };
          return toggledItem;
        }
        return item;
      });
      safeSetLocalStorage(STORAGE_PRODUCTS, JSON.stringify(updated));
      return updated;
    });
    if (toggledItem) {
      await saveProductToCloud(toggledItem);
    }
    await syncProductsToCloud(updated);
  };

  const handleUpdateHomepageMedia = (updatedMedia) => {
    setHomepageMedia((prev) => {
      const updated = { ...prev, ...updatedMedia };
      syncMediaToCloud(updated);
      return updated;
    });
  };

  const handleAddReview = (newReview) => {
    setReviews((prev) => {
      const updated = [newReview, ...prev];
      syncReviewsToCloud(updated);
      return updated;
    });
  };

  const handleDeleteReview = (id) => {
    setReviews((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      syncReviewsToCloud(updated);
      return updated;
    });
  };

  const handleUpdateAdminAuth = (newAuth) => {
    setAdminAuth(newAuth);
  };

  const handlePlaceOrder = (newOrder) => {
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem(STORAGE_ORDERS, JSON.stringify(updated));
      } catch (e) { }
      syncOrdersToCloud(updated);
      return updated;
    });
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) => {
      const updated = prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord));
      try {
        localStorage.setItem(STORAGE_ORDERS, JSON.stringify(updated));
      } catch (e) { }
      syncOrdersToCloud(updated);
      return updated;
    });
  };

  const handleDeleteOrder = (orderId) => {
    setOrders((prev) => {
      const updated = prev.filter((ord) => ord.id !== orderId);
      try {
        localStorage.setItem(STORAGE_ORDERS, JSON.stringify(updated));
      } catch (e) { }
      syncOrdersToCloud(updated);
      return updated;
    });
  };

  const handleResetDefaults = () => {
    clearDeletedProductIds();
    setProducts(INITIAL_PRODUCTS);
    setHomepageMedia(INITIAL_HOMEPAGE_MEDIA);
    setReviews(INITIAL_REVIEWS);
    setOrders(INITIAL_ORDERS);
    syncProductsToCloud(INITIAL_PRODUCTS);
    syncMediaToCloud(INITIAL_HOMEPAGE_MEDIA);
    syncReviewsToCloud(INITIAL_REVIEWS);
    syncOrdersToCloud(INITIAL_ORDERS);
  };

  const handleImportProducts = (importedList) => {
    const sanitized = sanitizeProductArray(importedList);
    setProducts(sanitized);
    syncProductsToCloud(sanitized);
  };

  // IF ADMIN ROUTE (#admin)
  if (isAdminRoute) {
    if (!isAdminLoggedIn) {
      return (
        <AdminLogin
          adminAuth={adminAuth}
          onLoginSuccess={() => {
            setIsAdminLoggedIn(true);
            try {
              localStorage.setItem(STORAGE_ADMIN_SESSION, 'true');
            } catch (e) { }
          }}
          onClose={() => {
            setIsAdminRoute(false);
            window.location.hash = '';
          }}
        />
      );
    }

    return (
      <AdminPage
        products={products}
        homepageMedia={homepageMedia}
        reviews={reviews}
        orders={orders}
        adminAuth={adminAuth}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onToggleStock={handleToggleStock}
        onUpdateHomepageMedia={handleUpdateHomepageMedia}
        onDeleteReview={handleDeleteReview}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onDeleteOrder={handleDeleteOrder}
        onUpdateAdminAuth={handleUpdateAdminAuth}
        onResetDefaults={handleResetDefaults}
        onImportProducts={handleImportProducts}
        onLogout={() => {
          setIsAdminLoggedIn(false);
          try {
            localStorage.setItem(STORAGE_ADMIN_SESSION, 'false');
          } catch (e) { }
          setIsAdminRoute(false);
          window.location.hash = '';
        }}
      />
    );
  }

  // PUBLIC CUSTOMER WEBSITE VIEW
  return (
    <div className="app-root bg-cream">
      {/* Website Opening Splash Animation */}
      {showSplash && (
        <SplashLoader onComplete={() => setShowSplash(false)} />
      )}

      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedProductDetail(null);
          setActiveTab(tab);
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Full-Page Dedicated Product Details View OR Main Homepage */}
      {selectedProductDetail ? (
        <ProductDetailPage
          product={selectedProductDetail}
          onBack={() => setSelectedProductDetail(null)}
          onBuyNow={(product) => setSelectedBuyNowProduct(product)}
          onSelectProduct={(product) => setSelectedProductDetail(product)}
          allProducts={products}
        />
      ) : (
        /* Main Content */
        <main>
          {/* Hero Section */}
          <Hero
            onExploreClick={handleExploreClick}
            onOpenWhatsappPopup={() => setShowWhatsappPopup(true)}
            homepageMedia={homepageMedia}
          />

          {/* 4 Main Categories Showcase */}
          <MainCategories
            onSelectCategory={handleSelectCategory}
            homepageMedia={homepageMedia}
          />

          {/* Product Catalogue & Filtering */}
          <ProductCatalog
            products={products}
            selectedCategory={selectedCategory}
            setSelectedCategory={(cat) => {
              setSelectedCategory(cat);
              if (cat !== 'ALL') setActiveTab(cat);
            }}
            onProductClick={(product) => setSelectedProductDetail(product)}
            onBuyNow={(product) => setSelectedBuyNowProduct(product)}
          />

          {/* Customer Reviews & Feedback Section */}
          <ReviewsSection
            reviews={reviews}
            onAddReview={handleAddReview}
          />

          {/* About Brand */}
          <AboutSection />

          {/* Store Contact & Map Directions */}
          <ContactSection />
        </main>
      )}

      {/* Footer */}
      <Footer onSelectCategory={handleSelectCategory} />

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsapp />

      {/* WhatsApp Enquiry Popup Modal */}
      {showWhatsappPopup && (
        <WhatsappPopupModal
          onClose={() => setShowWhatsappPopup(false)}
        />
      )}

      {/* Product Details Modal Fallback */}
      {selectedProductModal && (
        <ProductModal
          product={selectedProductModal}
          onClose={() => setSelectedProductModal(null)}
          onBuyNow={(product) => setSelectedBuyNowProduct(product)}
        />
      )}

      {/* Buy Now Direct Checkout Modal */}
      {selectedBuyNowProduct && (
        <BuyNowModal
          product={selectedBuyNowProduct}
          onClose={() => setSelectedBuyNowProduct(null)}
          onSubmitOrder={handlePlaceOrder}
        />
      )}
    </div>
  );
}
