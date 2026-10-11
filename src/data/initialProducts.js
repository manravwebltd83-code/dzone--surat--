export const INITIAL_PRODUCTS = [];


export const CATEGORIES_CONFIG = {
  WATCHES: {
    title: "WATCHES",
    subtitle: "Premium, Standard, Diamond & Ladies Watches",
    subcategories: ["All", "Premium Watches", "Standard Watches", "Diamond Watches", "Ladies Watches"],
    priceRange: "₹1,000 – ₹50,000",
    description: "Explore our handpicked collection of automatic, quartz, diamond, and stainless steel timepieces."
  },
  BELTS: {
    title: "BELTS",
    subtitle: "Leather Belts",
    subcategories: ["All", "Kadi Belt", "Auto Lock Belt", "Press Lock Belt"],
    priceRange: "₹300 – ₹1,000",
    description: "Crafted from fine genuine leather with durable kadi, ratchet auto-lock, and press-lock mechanisms."
  },
  JEWELLERY: {
    title: "JEWELLERY",
    subtitle: "Rings, Chains, Bracelets & Kada",
    subcategories: ["All", "Rings", "Chains", "Bracelets", "Kada"],
    priceRange: "₹300 – ₹5,000",
    description: "Premium brass & high-grade stainless steel accessories designed for timeless everyday wear."
  },
  PERFUMES: {
    title: "PERFUMES",
    subtitle: "Perfumes, Body Sprays, Room Sprays & Car Sprays",
    subcategories: ["All", "Perfumes", "Body Sprays", "Room Sprays", "Car Sprays"],
    priceRange: "₹200 – ₹5,000",
    description: "Long-lasting fine fragrances, invigorating body sprays, and ambient sprays for home & car."
  }
};

export const INITIAL_HOMEPAGE_MEDIA = {
  heroImage1: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop",
  heroImage2: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop",
  heroImage3: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=600&auto=format&fit=crop",
  heroImage4: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
  categoryImage_WATCHES: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
  categoryImage_BELTS: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=600&auto=format&fit=crop",
  categoryImage_JEWELLERY: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
  categoryImage_PERFUMES: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop",
};

export const INITIAL_REVIEWS = [
  {
    id: "r-1",
    name: "Rajesh Patel",
    location: "Sarthana Jakatnaka, Surat",
    rating: 5,
    date: "2 days ago",
    comment: "Best collection of automatic watches and leather belts in Surat! Purchased a skeleton watch and the quality is outstanding.",
    verified: true
  },
  {
    id: "r-2",
    name: "Pooja Sharma",
    location: "Adajan, Surat",
    rating: 5,
    date: "1 week ago",
    comment: "Loved the ladies rose gold mesh watch and long-lasting perfumes. Excellent customer service at Royal Arcade store!",
    verified: true
  },
  {
    id: "r-3",
    name: "Vikram Desai",
    location: "Varachha, Surat",
    rating: 5,
    date: "2 weeks ago",
    comment: "Heavy stainless steel kada and auto-lock leather belt quality is top class. Very quick WhatsApp response too.",
    verified: true
  }
];

export const INITIAL_ORDERS = [
  {
    id: "ORD-9101",
    customerName: "Sanjay Shah",
    mobile: "98795 12345",
    email: "sanjayshah@gmail.com",
    address: "B-402, Royal Residency, Nr. Deepkamal Mall",
    city: "Surat",
    pincode: "395006",
    productName: "Royal Diamond Skeleton Edition",
    productCategory: "WATCHES",
    productPrice: 18500,
    quantity: 1,
    status: "New Lead",
    createdAt: "Today, 10:30 AM"
  },
  {
    id: "ORD-9102",
    customerName: "Ketan Mehta",
    mobile: "98251 67890",
    email: "ketan.mehta@gmail.com",
    address: "12, Shanti Nagar, Sarthana Jakatnaka",
    city: "Surat",
    pincode: "395006",
    productName: "Smart Auto Lock Sliding Belt",
    productCategory: "BELTS",
    productPrice: 899,
    quantity: 1,
    status: "Confirmed",
    createdAt: "Yesterday, 4:15 PM"
  }
];
