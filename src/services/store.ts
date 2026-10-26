import {
  Product,
  StudioFont,
  StudioArtwork,
  StudioPricing,
  StudioDesign,
  Order,
  PaymentTransaction,
  Rider,
  CustomerProfile,
  AdminAuditLog,
  OrderAuditLog,
  SupportTicket,
  NotificationItem,
  DeliveryZone,
  AppSettings,
  ProofOfDelivery,
  OrderStatus,
  PaymentStatus,
  TeamOrder,
  AuthUser,
  Role,
  ManualPaymentMethodConfig,
  CouponPromo,
  CmsBanner,
  AdminUserAccount,
  ProductCategory
} from '../types';

// Pre-seeded Initial Data
const INITIAL_FONTS: StudioFont[] = [
  {
    id: 'font-bebas',
    name: 'Bebas Pro',
    family: "'Bebas Neue', sans-serif",
    cssClass: 'font-bebas',
    isEnabled: true,
    isDefault: true,
    sortOrder: 1,
    previewText: 'KAMPALA 10'
  },
  {
    id: 'font-oswald',
    name: 'Oswald Athletic',
    family: "'Oswald', sans-serif",
    cssClass: 'font-oswald',
    isEnabled: true,
    isDefault: false,
    sortOrder: 2,
    previewText: 'MUGISHA 7'
  },
  {
    id: 'font-syne',
    name: 'Syne Modern',
    family: "'Syne', sans-serif",
    cssClass: 'font-syne',
    isEnabled: true,
    isDefault: false,
    sortOrder: 3,
    previewText: 'STARS 09'
  },
  {
    id: 'font-russo',
    name: 'Russo Heavy',
    family: "'Russo One', sans-serif",
    cssClass: 'font-russo',
    isEnabled: true,
    isDefault: false,
    sortOrder: 4,
    previewText: 'UGANDA 21'
  },
  {
    id: 'font-orbitron',
    name: 'Orbitron Cyber',
    family: "'Orbitron', sans-serif",
    cssClass: 'font-orbitron',
    isEnabled: true,
    isDefault: false,
    sortOrder: 5,
    previewText: 'NOVA 99'
  },
  {
    id: 'font-chakra',
    name: 'Chakra Petch',
    family: "'Chakra Petch', sans-serif",
    cssClass: 'font-chakra',
    isEnabled: true,
    isDefault: false,
    sortOrder: 6,
    previewText: 'KIGOZI 11'
  },
  {
    id: 'font-teko',
    name: 'Teko Narrow',
    family: "'Teko', sans-serif",
    cssClass: 'font-teko',
    isEnabled: true,
    isDefault: false,
    sortOrder: 7,
    previewText: 'CRANES 04'
  },
  {
    id: 'font-montserrat',
    name: 'Montserrat Tech',
    family: "'Montserrat', sans-serif",
    cssClass: 'font-montserrat',
    isEnabled: false,
    isDefault: false,
    sortOrder: 8,
    previewText: 'KITNOVA 26'
  }
];

const INITIAL_PRICING: StudioPricing = {
  namePrice: 5000,
  numberPrice: 5000,
  logoPrice: 10000,
  sponsorPrice: 15000,
  badgePrice: 5000,
  sleevePatchPrice: 4000,
  framePrice: 3000,
  graphicPrice: 5000,
  emojiPrice: 1000,
  backgroundPrice: 3000
};

const INITIAL_ZONES: DeliveryZone[] = [
  {
    id: 'zone-kla-central',
    name: 'Kampala Central & Kololo / Nakasero',
    fee: 7000,
    estimatedTime: '2 - 4 Hours',
    expressAvailable: true,
    expressFee: 15000
  },
  {
    id: 'zone-nakawa-ntinda',
    name: 'Nakawa, Ntinda, Naguru & Bugolobi',
    fee: 8000,
    estimatedTime: '3 - 5 Hours',
    expressAvailable: true,
    expressFee: 16000
  },
  {
    id: 'zone-makindye',
    name: 'Makindye, Kabalagala & Kansanga',
    fee: 8500,
    estimatedTime: '3 - 5 Hours',
    expressAvailable: true,
    expressFee: 17000
  },
  {
    id: 'zone-rubaga-meng',
    name: 'Rubaga, Mengo & Lubowa',
    fee: 9000,
    estimatedTime: '4 - 6 Hours',
    expressAvailable: true,
    expressFee: 18000
  },
  {
    id: 'zone-kawempe',
    name: 'Kawempe, Kisaasi & Komamboga',
    fee: 9500,
    estimatedTime: '4 - 6 Hours',
    expressAvailable: false,
    expressFee: 0
  },
  {
    id: 'zone-entebbe-wakiso',
    name: 'Entebbe Expressway & Wakiso Urban',
    fee: 14000,
    estimatedTime: 'Same-Day / Next-Day',
    expressAvailable: true,
    expressFee: 25000
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-ktn-pro-01',
    name: 'KITNOVA Pro Matchwear Home Kit',
    sku: 'KTN-PRO-HM-26',
    description: 'Engineered with aerodynamic lightweight micro-mesh fabric, tailored athletic fit, reinforced flatlock seams, and deep navy with brushed gold crest detailing.',
    category: 'club',
    team: 'Kitnova Elite Series',
    basePrice: 85000,
    oldPrice: 105000,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['#0F2A5F', '#D4A029', '#0A1A3C', '#FFFFFF'],
    stock: 18,
    lowStockThreshold: 5,
    isCustomizable: true,
    isFeatured: true,
    isPopular: true,
    status: 'active',
    images: [
      {
        id: 'img-1',
        url: '/assets/images/kitnova_custom_jersey_1791234670740.jpg',
        isPrimary: true,
        altText: 'KITNOVA Pro Matchwear Home Jersey Flatlay'
      },
      {
        id: 'img-1-hero',
        url: '/assets/images/kitnova_hero_jersey_1791234660638.jpg',
        isPrimary: false,
        altText: 'Athletes wearing KITNOVA Pro Kit in Tunnel'
      }
    ],
    createdAt: '2026-09-15T10:00:00Z'
  },
  {
    id: 'prod-kla-stars-02',
    name: 'Kampala Stars FC Official 26/27 Home Kit',
    sku: 'KLA-STR-26-HM',
    description: 'The official home jersey of Kampala Stars FC. Royal navy blue silhouette with light gold sleeve trims, moisture-wicking dry-tech fabric, and embroidered club crest.',
    category: 'club',
    team: 'Kampala Stars FC',
    basePrice: 95000,
    oldPrice: 115000,
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: ['#0F2A5F', '#F0C760', '#FFFFFF'],
    stock: 4, // Intentionally low to trigger threshold alert!
    lowStockThreshold: 8,
    isCustomizable: true,
    isFeatured: true,
    isPopular: true,
    status: 'active',
    images: [
      {
        id: 'img-2',
        url: '/assets/images/kitnova_kampala_stars_1791234679446.jpg',
        isPrimary: true,
        altText: 'Kampala Stars FC 26/27 Official Jersey'
      }
    ],
    createdAt: '2026-09-18T14:30:00Z'
  },
  {
    id: 'prod-ug-tribute-03',
    name: 'Uganda Cranes Tribute Commemorative Edition',
    sku: 'UG-TRB-2026',
    description: 'A tribute to Ugandan football heritage. Stealth matte black base with hand-designed Ugandan geometric crest accents in gold, yellow, and deep crimson.',
    category: 'national',
    team: 'Uganda Tribute Edition',
    basePrice: 110000,
    oldPrice: 130000,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['#111827', '#D4A029', '#DC2626', '#EAB308'],
    stock: 12,
    lowStockThreshold: 5,
    isCustomizable: true,
    isFeatured: true,
    isPopular: false,
    status: 'active',
    images: [
      {
        id: 'img-3',
        url: '/assets/images/kitnova_uganda_tribute_1791234691610.jpg',
        isPrimary: true,
        altText: 'Uganda Tribute Commemorative Edition'
      }
    ],
    createdAt: '2026-09-22T08:15:00Z'
  },
  {
    id: 'prod-blank-custom-04',
    name: 'KITNOVA Clean Blank Customizer Jersey',
    sku: 'KTN-BLK-04',
    description: 'The ultimate canvas for your corporate team, Sunday league club, or tournament squad. 100% customizable from front chest to full squad names and sleeve patches.',
    category: 'blank',
    team: 'Custom Studio Series',
    basePrice: 70000,
    oldPrice: 85000,
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: ['#0F2A5F', '#FFFFFF', '#0A1A3C', '#D4A029', '#EF4444', '#10B981'],
    stock: 35,
    lowStockThreshold: 10,
    isCustomizable: true,
    isFeatured: false,
    isPopular: true,
    status: 'active',
    images: [
      {
        id: 'img-4',
        url: '/assets/images/kitnova_custom_jersey_1791234670740.jpg',
        isPrimary: true,
        altText: 'KITNOVA Customizer Blank Canvas Kit'
      }
    ],
    createdAt: '2026-09-25T11:45:00Z'
  },
  {
    id: 'prod-training-vest-05',
    name: 'KITNOVA Elite Velocity Training Vest',
    sku: 'KTN-TRN-VST-05',
    description: 'High-breathability, non-customizable quick-dry training vest for intense football workouts, athletic conditioning, and gym sessions. Finished in stealth black with gold reflective accents.',
    category: 'training',
    team: 'Velocity Training Series',
    basePrice: 55000,
    oldPrice: 65000,
    discountPrice: 50000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#0A1A3C', '#D4A029', '#FFFFFF'],
    stock: 24,
    lowStockThreshold: 6,
    isCustomizable: false, // Explicitly non-customizable to test Shop & PDP "ADD TO CART ONLY" rule
    isFeatured: false,
    isPopular: false,
    status: 'active',
    images: [
      {
        id: 'img-5',
        url: '/assets/images/kitnova_hero_jersey_1791234660638.jpg',
        isPrimary: true,
        altText: 'KITNOVA Elite Velocity Training Vest'
      }
    ],
    createdAt: '2026-09-28T09:00:00Z'
  }
];

const INITIAL_RIDERS: Rider[] = [
  {
    id: 'rider-01',
    name: 'Ronald Mugisha',
    phone: '+256 701 445 289',
    email: 'ronald.m@kitnova.ug',
    avatarUrl: '/assets/images/kitnova_rider_delivery_1791234701225.jpg',
    vehiclePlate: 'UEM 482B (Bajaj Boxer 150)',
    vehicleType: 'motorcycle',
    status: 'busy',
    isLocationSharingActive: true,
    currentCoordinates: {
      lat: 0.3341,
      lng: 32.5855,
      landmark: 'En-route past Acacia Avenue, Kololo towards Lugogo Mall',
      lastUpdated: new Date().toISOString()
    },
    rating: 4.9,
    totalCompletedDeliveries: 342,
    activeOrderId: 'ord-ktn-2026-002'
  },
  {
    id: 'rider-02',
    name: 'Denis Kigozi',
    phone: '+256 772 890 311',
    email: 'denis.k@kitnova.ug',
    avatarUrl: '/assets/images/kitnova_rider_delivery_1791234701225.jpg',
    vehiclePlate: 'UDX 190F (TVS HLX 125)',
    vehicleType: 'motorcycle',
    status: 'available',
    isLocationSharingActive: true,
    currentCoordinates: {
      lat: 0.3476,
      lng: 32.6102,
      landmark: 'Staging Hub at Ntinda Shopping Centre',
      lastUpdated: new Date().toISOString()
    },
    rating: 4.8,
    totalCompletedDeliveries: 289
  },
  {
    id: 'rider-03',
    name: 'Brian Ssemwogerere',
    phone: '+256 754 112 904',
    email: 'brian.s@kitnova.ug',
    avatarUrl: '/assets/images/kitnova_rider_delivery_1791234701225.jpg',
    vehiclePlate: 'UFN 731K (Honda Ace 125)',
    vehicleType: 'motorcycle',
    status: 'available',
    isLocationSharingActive: false,
    currentCoordinates: {
      lat: 0.2988,
      lng: 32.5912,
      landmark: 'Kabalagala Junction Hub',
      lastUpdated: '2026-10-05T09:12:00Z'
    },
    rating: 4.7,
    totalCompletedDeliveries: 198
  }
];

const INITIAL_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'cust-sarah-01',
    name: 'Sarah Tumusiime',
    email: 'sarah.tumu@gmail.com',
    phone: '+256 788 123 456',
    status: 'active',
    ordersCount: 3,
    totalSpent: 310000,
    loyaltyPoints: 310,
    savedAddresses: [
      {
        fullName: 'Sarah Tumusiime',
        phone: '+256 788 123 456',
        zoneId: 'zone-kla-central',
        zoneName: 'Kampala Central & Kololo / Nakasero',
        streetAddress: 'Plot 14 Windsor Loop, Kololo',
        landmark: 'Near British High Commission',
        deliveryOption: 'standard'
      }
    ],
    createdAt: '2026-08-10T12:00:00Z'
  },
  {
    id: 'cust-ivan-02',
    name: 'Ivan Kakooza',
    email: 'kakooza.ivan@yahoo.com',
    phone: '+256 702 998 771',
    status: 'active',
    ordersCount: 1,
    totalSpent: 125000,
    loyaltyPoints: 125,
    savedAddresses: [
      {
        fullName: 'Ivan Kakooza',
        phone: '+256 702 998 771',
        zoneId: 'zone-nakawa-ntinda',
        zoneName: 'Nakawa, Ntinda, Naguru & Bugolobi',
        streetAddress: 'Spring Road, Bugolobi Heights Block B',
        landmark: 'Opposite Village Mall Bugolobi',
        deliveryOption: 'express'
      }
    ],
    createdAt: '2026-09-02T15:40:00Z'
  },
  {
    id: 'cust-david-03',
    name: 'David Mukasa',
    email: 'david.mukasa@vishcom.co.ug',
    phone: '+256 752 443 890',
    status: 'active',
    ordersCount: 2,
    totalSpent: 420000,
    loyaltyPoints: 420,
    savedAddresses: [
      {
        fullName: 'David Mukasa',
        phone: '+256 752 443 890',
        zoneId: 'zone-kla-central',
        zoneName: 'Kampala Central & Kololo / Nakasero',
        streetAddress: 'Acacia Mall, Level 3 Corporate Suite',
        landmark: 'Kisementi Kololo',
        deliveryOption: 'express'
      }
    ],
    createdAt: '2026-09-20T09:10:00Z'
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-ktn-2026-001',
    orderNumber: 'KTN-2026-9102',
    customerId: 'cust-sarah-01',
    customerName: 'Sarah Tumusiime',
    customerPhone: '+256 788 123 456',
    customerEmail: 'sarah.tumu@gmail.com',
    items: [
      {
        id: 'item-1',
        configHash: 'hash-prod-ktn-pro-01-M-TUMUSIIME-10',
        productId: 'prod-ktn-pro-01',
        productName: 'KITNOVA Pro Matchwear Home Kit',
        productImage: '/assets/images/kitnova_custom_jersey_1791234670740.jpg',
        basePrice: 85000,
        customizationPrice: 15000,
        totalUnitPrice: 100000,
        size: 'M',
        color: '#0F2A5F',
        quantity: 1,
        customSummary: {
          playerName: 'TUMUSIIME',
          playerNumber: '10',
          sponsorText: 'KAMPALA STARS',
          hasBadges: true
        }
      }
    ],
    subtotal: 100000,
    discount: 0,
    deliveryFee: 7000,
    totalAmount: 107000,
    paymentMethod: 'mtn_momo',
    paymentStatus: 'pending_verification',
    paymentReference: 'MTN-UG-99827103',
    status: 'customization_review',
    deliveryAddress: {
      fullName: 'Sarah Tumusiime',
      phone: '+256 788 123 456',
      zoneId: 'zone-kla-central',
      zoneName: 'Kampala Central & Kololo / Nakasero',
      streetAddress: 'Plot 14 Windsor Loop, Kololo',
      landmark: 'Near British High Commission',
      deliveryOption: 'standard'
    },
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2026-10-04T10:15:00Z',
        actor: 'Sarah Tumusiime',
        note: 'Order submitted via Customer Checkout'
      },
      {
        status: 'customization_review',
        timestamp: '2026-10-04T10:16:00Z',
        actor: 'System',
        note: 'Payment reference submitted via MTN MoMo, awaiting admin verification'
      }
    ],
    createdAt: '2026-10-04T10:15:00Z',
    updatedAt: '2026-10-04T10:16:00Z'
  },
  {
    id: 'ord-ktn-2026-002',
    orderNumber: 'KTN-2026-8944',
    customerId: 'cust-david-03',
    customerName: 'David Mukasa',
    customerPhone: '+256 752 443 890',
    customerEmail: 'david.mukasa@vishcom.co.ug',
    items: [
      {
        id: 'item-2',
        configHash: 'hash-prod-ug-tribute-03-L-MUKASA-09',
        productId: 'prod-ug-tribute-03',
        productName: 'Uganda Cranes Tribute Commemorative Edition',
        productImage: '/assets/images/kitnova_uganda_tribute_1791234691610.jpg',
        basePrice: 110000,
        customizationPrice: 20000,
        totalUnitPrice: 130000,
        size: 'L',
        color: '#111827',
        quantity: 1,
        customSummary: {
          playerName: 'MUKASA',
          playerNumber: '09',
          sponsorText: 'VISHCOM UG',
          hasBadges: true
        }
      }
    ],
    subtotal: 130000,
    discount: 0,
    deliveryFee: 15000,
    totalAmount: 145000,
    paymentMethod: 'airtel_money',
    paymentStatus: 'paid',
    paymentReference: 'AIRTEL-UG-332901',
    status: 'out_for_delivery',
    deliveryAddress: {
      fullName: 'David Mukasa',
      phone: '+256 752 443 890',
      zoneId: 'zone-kla-central',
      zoneName: 'Kampala Central & Kololo / Nakasero',
      streetAddress: 'Acacia Mall, Level 3 Corporate Suite',
      landmark: 'Kisementi Kololo',
      deliveryOption: 'express'
    },
    assignedRiderId: 'rider-01',
    assignedRiderName: 'Ronald Mugisha',
    assignedRiderPhone: '+256 701 445 289',
    riderLocation: {
      lat: 0.3341,
      lng: 32.5855,
      lastUpdate: new Date().toISOString(),
      isStale: false
    },
    statusHistory: [
      { status: 'pending', timestamp: '2026-10-05T08:00:00Z', actor: 'David Mukasa' },
      { status: 'paid', timestamp: '2026-10-05T08:05:00Z', actor: 'Admin (Ronald S)' },
      { status: 'ready', timestamp: '2026-10-05T09:30:00Z', actor: 'Product Studio' },
      { status: 'rider_assigned', timestamp: '2026-10-05T10:00:00Z', actor: 'Dispatch Admin', note: 'Assigned to Ronald Mugisha (UEM 482B)' },
      { status: 'picked_up', timestamp: '2026-10-05T10:15:00Z', actor: 'Ronald Mugisha', note: 'Picked up kit from Kitnova Central Store' },
      { status: 'out_for_delivery', timestamp: '2026-10-05T10:20:00Z', actor: 'Ronald Mugisha', note: 'Rider en-route via Kololo' }
    ],
    createdAt: '2026-10-05T08:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ord-ktn-2026-003',
    orderNumber: 'KTN-2026-8801',
    customerId: 'cust-ivan-02',
    customerName: 'Ivan Kakooza',
    customerPhone: '+256 702 998 771',
    customerEmail: 'kakooza.ivan@yahoo.com',
    items: [
      {
        id: 'item-3',
        configHash: 'hash-prod-kla-stars-02-XL-KAKOOZA-14',
        productId: 'prod-kla-stars-02',
        productName: 'Kampala Stars FC Official 26/27 Home Kit',
        productImage: '/assets/images/kitnova_kampala_stars_1791234679446.jpg',
        basePrice: 95000,
        customizationPrice: 10000,
        totalUnitPrice: 105000,
        size: 'XL',
        color: '#0F2A5F',
        quantity: 1,
        customSummary: {
          playerName: 'KAKOOZA',
          playerNumber: '14'
        }
      }
    ],
    subtotal: 105000,
    discount: 5000,
    deliveryFee: 8000,
    totalAmount: 108000,
    paymentMethod: 'mtn_momo',
    paymentStatus: 'paid',
    paymentReference: 'MTN-UG-77441190',
    status: 'delivered',
    deliveryAddress: {
      fullName: 'Ivan Kakooza',
      phone: '+256 702 998 771',
      zoneId: 'zone-nakawa-ntinda',
      zoneName: 'Nakawa, Ntinda, Naguru & Bugolobi',
      streetAddress: 'Spring Road, Bugolobi Heights Block B',
      landmark: 'Opposite Village Mall Bugolobi',
      deliveryOption: 'standard'
    },
    assignedRiderId: 'rider-02',
    assignedRiderName: 'Denis Kigozi',
    assignedRiderPhone: '+256 772 890 311',
    proofOfDelivery: {
      recipientName: 'Ivan Kakooza',
      receivedAt: '2026-10-04T16:45:00Z',
      deliveryNotes: 'Delivered directly to customer at reception lobby. Customer verified jersey customization.'
    },
    statusHistory: [
      { status: 'pending', timestamp: '2026-10-04T12:00:00Z', actor: 'Ivan Kakooza' },
      { status: 'paid', timestamp: '2026-10-04T12:08:00Z', actor: 'Admin' },
      { status: 'out_for_delivery', timestamp: '2026-10-04T15:30:00Z', actor: 'Denis Kigozi' },
      { status: 'delivered', timestamp: '2026-10-04T16:45:00Z', actor: 'Denis Kigozi', note: 'Proof of delivery signed by Ivan Kakooza' }
    ],
    createdAt: '2026-10-04T12:00:00Z',
    updatedAt: '2026-10-04T16:45:00Z'
  }
];

const INITIAL_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'pay-001',
    orderId: 'ord-ktn-2026-001',
    orderNumber: 'KTN-2026-9102',
    customerName: 'Sarah Tumusiime',
    customerPhone: '+256 788 123 456',
    amount: 107000,
    paymentMethod: 'mtn_momo',
    referenceNumber: 'MTN-UG-99827103',
    status: 'pending_verification',
    createdAt: '2026-10-04T10:16:00Z',
    notes: 'Submitted via MTN MoMo Pay Merchant code 829910. Needs verification in MTN Merchant Portal.'
  },
  {
    id: 'pay-002',
    orderId: 'ord-ktn-2026-002',
    orderNumber: 'KTN-2026-8944',
    customerName: 'David Mukasa',
    customerPhone: '+256 752 443 890',
    amount: 145000,
    paymentMethod: 'airtel_money',
    referenceNumber: 'AIRTEL-UG-332901',
    status: 'paid',
    createdAt: '2026-10-05T08:02:00Z',
    verifiedAt: '2026-10-05T08:05:00Z',
    verifiedBy: 'Super Admin',
    notes: 'Airtel Money transaction confirmed via webhook proxy.'
  },
  {
    id: 'pay-003',
    orderId: 'ord-ktn-2026-003',
    orderNumber: 'KTN-2026-8801',
    customerName: 'Ivan Kakooza',
    customerPhone: '+256 702 998 771',
    amount: 108000,
    paymentMethod: 'mtn_momo',
    referenceNumber: 'MTN-UG-77441190',
    status: 'paid',
    createdAt: '2026-10-04T12:05:00Z',
    verifiedAt: '2026-10-04T12:08:00Z',
    verifiedBy: 'Finance Lead',
    notes: 'Verified via MTN MoMo API'
  }
];

const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-10-05T08:05:00Z',
    actorName: 'Super Admin',
    actorRole: 'super_admin',
    module: 'payments',
    action: 'VERIFY_PAYMENT',
    description: 'Approved Airtel Money payment of UGX 145,000 for Order KTN-2026-8944',
    beforeValue: 'pending_verification',
    afterValue: 'paid'
  },
  {
    id: 'log-002',
    timestamp: '2026-10-04T14:20:00Z',
    actorName: 'Product Admin',
    actorRole: 'product_admin',
    module: 'studio_pricing',
    action: 'BULK_PRICE_ADJUST',
    description: 'Applied +10% bulk price adjustment to customization categories (Name, Number, Logo, Sponsor) rounded to nearest 500 UGX',
    beforeValue: 'Name: 4,500; Number: 4,500; Logo: 9,000; Sponsor: 13,500',
    afterValue: 'Name: 5,000; Number: 5,000; Logo: 10,000; Sponsor: 15,000'
  },
  {
    id: 'log-003',
    timestamp: '2026-10-04T15:00:00Z',
    actorName: 'Operations Admin',
    actorRole: 'operations_admin',
    module: 'orders',
    action: 'ASSIGN_RIDER',
    description: 'Assigned Denis Kigozi (UDX 190F) to Order KTN-2026-8801',
    beforeValue: 'unassigned',
    afterValue: 'rider-02 (Denis Kigozi)'
  }
];

const INITIAL_ORDER_AUDIT_LOGS: OrderAuditLog[] = [
  {
    id: 'ord-audit-001',
    orderId: 'ord-ktn-2026-001',
    orderNumber: 'KTN-2026-8910',
    adminId: 'usr-admin-ops',
    adminEmail: 'ops@kitnova.ug',
    adminRole: 'operations_admin',
    originalStatus: 'payment_pending',
    newStatus: 'confirmed',
    originalPaymentStatus: 'pending_verification',
    newPaymentStatus: 'paid',
    changedFields: {
      original_status: 'payment_pending',
      new_status: 'confirmed',
      original_payment_status: 'pending_verification',
      new_payment_status: 'paid'
    },
    createdAt: '2026-10-04T12:08:00Z'
  },
  {
    id: 'ord-audit-002',
    orderId: 'ord-ktn-2026-001',
    orderNumber: 'KTN-2026-8910',
    adminId: 'usr-admin-ops',
    adminEmail: 'ops@kitnova.ug',
    adminRole: 'operations_admin',
    originalStatus: 'confirmed',
    newStatus: 'preparing',
    createdAt: '2026-10-04T13:30:00Z'
  },
  {
    id: 'ord-audit-003',
    orderId: 'ord-ktn-2026-001',
    orderNumber: 'KTN-2026-8910',
    adminId: 'usr-admin-ops',
    adminEmail: 'ops@kitnova.ug',
    adminRole: 'operations_admin',
    originalStatus: 'preparing',
    newStatus: 'rider_assigned',
    changedFields: {
      original_rider: null,
      assigned_rider: 'Ronald Mugisha (UEX 419P)'
    },
    createdAt: '2026-10-04T14:45:00Z'
  },
  {
    id: 'ord-audit-004',
    orderId: 'ord-ktn-2026-001',
    orderNumber: 'KTN-2026-8910',
    adminId: 'usr-rider-01',
    adminEmail: 'rider@kitnova.ug',
    adminRole: 'rider',
    originalStatus: 'rider_assigned',
    newStatus: 'picked_up',
    createdAt: '2026-10-04T15:10:00Z'
  },
  {
    id: 'ord-audit-005',
    orderId: 'ord-ktn-2026-001',
    orderNumber: 'KTN-2026-8910',
    adminId: 'usr-rider-01',
    adminEmail: 'rider@kitnova.ug',
    adminRole: 'rider',
    originalStatus: 'picked_up',
    newStatus: 'delivered',
    changedFields: {
      proofOfDelivery: 'Signed by Sarah Tumusiime'
    },
    createdAt: '2026-10-04T16:20:00Z'
  }
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tick-001',
    ticketNumber: 'TKT-1082',
    customerId: 'cust-sarah-01',
    customerName: 'Sarah Tumusiime',
    customerPhone: '+256 788 123 456',
    orderId: 'ord-ktn-2026-001',
    subject: 'Confirming gold embroidery font on back of Pro kit',
    category: 'customization',
    priority: 'medium',
    status: 'open',
    createdAt: '2026-10-04T11:00:00Z',
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        senderName: 'Sarah Tumusiime',
        text: 'Hello Kitnova, could you confirm if the player name TUMUSIIME will be printed using the Bebas font with gold outline as seen in my Studio preview?',
        timestamp: '2026-10-04T11:00:00Z'
      },
      {
        id: 'msg-2',
        sender: 'agent',
        senderName: 'Kitnova Studio Support',
        text: 'Hello Sarah! Yes, our studio production queue captures your exact vector snapshot. We render Bebas Pro with brushed gold heat-press flex vinyl.',
        timestamp: '2026-10-04T11:15:00Z'
      }
    ]
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-001',
    title: 'Payment Awaiting Verification',
    message: 'Order #KTN-2026-9102 (Sarah Tumusiime) submitted MTN MoMo payment of UGX 107,000',
    type: 'payment',
    targetRole: 'admin',
    isRead: false,
    createdAt: '2026-10-04T10:16:00Z'
  },
  {
    id: 'notif-002',
    title: 'Low Stock Alert: Kampala Stars FC 26/27 Home Kit',
    message: 'Current stock is 4 units (Threshold: 8). Restock advised.',
    type: 'inventory',
    targetRole: 'admin',
    isRead: false,
    createdAt: '2026-10-04T16:00:00Z'
  },
  {
    id: 'notif-003',
    title: 'Your Kitnova Jersey is Out for Delivery!',
    message: 'Rider Ronald Mugisha is on the way to Acacia Mall with your order.',
    type: 'delivery',
    targetRole: 'customer',
    recipientId: 'cust-david-03',
    isRead: false,
    createdAt: '2026-10-05T10:20:00Z'
  },
  {
    id: 'notif-004',
    title: 'New Delivery Assigned',
    message: 'You have been assigned order KTN-2026-8944 to Kololo. Tap to review destination.',
    type: 'delivery',
    targetRole: 'rider',
    recipientId: 'rider-01',
    isRead: false,
    createdAt: '2026-10-05T10:00:00Z'
  }
];

const INITIAL_SETTINGS: AppSettings = {
  appName: 'KITNOVA JERSEY',
  companyName: 'Vishcom Tech Company UG',
  currency: 'UGX',
  country: 'Uganda',
  maintenanceMode: false,
  currentAppVersion: '2.4.0',
  minAppVersion: '2.0.0',
  freeDeliveryThreshold: 250000,
  standardDeliveryFee: 7000,
  expressDeliveryFee: 15000,
  serviceConfig: {
    supabaseUrl: 'https://qodecquwaxrwtwepkdxg.supabase.co',
    supabaseAnonKey: 'sb_publishable_-9MolMEb0UGNUVAh6S9abQ_V7yLFaUC',
    firebaseProjectId: 'kitnova-jersey-mobile-ca094',
    firebaseAppId: '1:11532603738:web:e6dd9dc644c7ec6c836363',
    cloudinaryCloudName: 'podwfdgc',
    cloudinaryPreset: 'Kitnova jersey uploads'
  }
};

const INITIAL_MANUAL_PAYMENTS: ManualPaymentMethodConfig[] = [
  {
    id: 'pay-mtn-momo',
    provider: 'mtn_momo',
    title: 'MTN MoMo Merchant Pay',
    merchantName: 'KITNOVA SPORTSWEAR UG',
    merchantNumber: '829910',
    ussdTemplate: '*165*3*829910*{AMOUNT}#',
    instructions: 'Dial *165*3#, enter Merchant Code 829910, enter exact order amount and reference your Order Number. Enter your transaction ID below and upload payment screenshot.',
    isActive: true,
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=MTN-MOMO-829910'
  },
  {
    id: 'pay-airtel-money',
    provider: 'airtel_money',
    title: 'Airtel Money Paybill',
    merchantName: 'KITNOVA SPORTSWEAR',
    merchantNumber: '441092',
    ussdTemplate: '*185*9*441092*{AMOUNT}#',
    instructions: 'Dial *185*9#, enter Paybill Business Number 441092, enter order amount and your full name. Enter Airtel confirmation reference below.',
    isActive: true,
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=AIRTEL-MONEY-441092'
  },
  {
    id: 'pay-bank-centenary',
    provider: 'manual_bank',
    title: 'Bank Wire / Branch Deposit',
    merchantName: 'KITNOVA SPORTSWEAR LTD',
    merchantNumber: 'Centenary Bank: 3100088921',
    instructions: 'Bank: Centenary Bank Uganda · Account: 3100088921 (Acacia Mall Corporate Branch). Deposit order amount and attach stamped bank slip or mobile banking receipt screenshot.',
    isActive: true
  },
  {
    id: 'pay-cod',
    provider: 'cash_on_delivery',
    title: 'Cash On Delivery (Verified Zones Only)',
    merchantName: 'KITNOVA Courier Cash Handover',
    merchantNumber: 'POD-COD',
    instructions: 'Pay cash directly to the dispatch rider upon receiving and inspecting your jersey package. Exact cash change is appreciated.',
    isActive: true
  }
];

const INITIAL_COUPONS: CouponPromo[] = [
  {
    id: 'coupon-1',
    code: 'KITNOVA10',
    discountType: 'percentage',
    discountValue: 10,
    minSpend: 50000,
    usageLimit: 500,
    usedCount: 142,
    expiryDate: '2026-12-31',
    isActive: true
  },
  {
    id: 'coupon-2',
    code: 'CRANES26',
    discountType: 'fixed',
    discountValue: 15000,
    minSpend: 100000,
    usageLimit: 200,
    usedCount: 78,
    expiryDate: '2026-11-30',
    isActive: true
  },
  {
    id: 'coupon-3',
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 7000,
    minSpend: 80000,
    usageLimit: 1000,
    usedCount: 389,
    expiryDate: '2027-01-01',
    isActive: true
  }
];

const INITIAL_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat-club',
    name: 'Club Matchwear',
    slug: 'club',
    description: 'Authentic local & international club jerseys with aerodynamic mesh.',
    itemCount: 2,
    isActive: true
  },
  {
    id: 'cat-national',
    name: 'National & Tribute Editions',
    slug: 'national',
    description: 'Heritage jerseys and special African national tournament kits.',
    itemCount: 1,
    isActive: true
  },
  {
    id: 'cat-training',
    name: 'Training & Warmup Gear',
    slug: 'training',
    description: 'High-breathability performance apparel for elite physical conditioning.',
    itemCount: 1,
    isActive: true
  },
  {
    id: 'cat-blank',
    name: 'Blank Customizer Canvases',
    slug: 'blank',
    description: 'Clean base jerseys designed for complete team squad custom printing.',
    itemCount: 1,
    isActive: true
  }
];

const INITIAL_BANNERS: CmsBanner[] = [
  {
    id: 'banner-hero',
    title: 'CUSTOMIZE YOUR LEGACY',
    subtitle: 'Official Matchwear & Team Kits Engineered in Kampala',
    tag: 'NEW 2026/27 DROP',
    badgeText: 'HEAT-PRESS STUDIO READY',
    imageUrl: '/assets/images/kitnova_hero_jersey_1791234660638.jpg',
    ctaText: 'Open Jersey Studio',
    targetView: 'studio',
    isActive: true,
    order: 1
  },
  {
    id: 'banner-stars',
    title: 'KAMPALA STARS FC HOME KIT',
    subtitle: 'Royal Navy & Brushed Gold · Dry-Tech 4-Way Stretch',
    tag: 'CLUB SERIES',
    badgeText: 'SELLING FAST',
    imageUrl: '/assets/images/kitnova_kampala_stars_1791234679446.jpg',
    ctaText: 'Shop Kampala Stars',
    targetView: 'shop',
    isActive: true,
    order: 2
  }
];

const INITIAL_ADMIN_ACCOUNTS: AdminUserAccount[] = [
  {
    id: 'usr-admin-super',
    name: 'Ronald Ssebaggala',
    email: 'admin@kitnova.ug',
    role: 'super_admin',
    status: 'active',
    lastLoginAt: '2026-10-23T12:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    phone: '+256 772 000 111'
  },
  {
    id: 'usr-admin-ops',
    name: 'Grace Namubiru',
    email: 'ops@kitnova.ug',
    role: 'operations_admin',
    status: 'active',
    lastLoginAt: '2026-10-23T11:30:00Z',
    createdAt: '2026-02-15T00:00:00Z',
    phone: '+256 782 555 444'
  },
  {
    id: 'usr-admin-prod',
    name: 'Brian Kasoma',
    email: 'product@kitnova.ug',
    role: 'product_admin',
    status: 'active',
    lastLoginAt: '2026-10-22T16:45:00Z',
    createdAt: '2026-03-01T00:00:00Z',
    phone: '+256 703 111 222'
  },
  {
    id: 'usr-admin-supp',
    name: 'Fiona Nalwanga',
    email: 'support@kitnova.ug',
    role: 'support_admin',
    status: 'active',
    lastLoginAt: '2026-10-23T10:15:00Z',
    createdAt: '2026-04-10T00:00:00Z',
    phone: '+256 754 999 888'
  }
];

const STORAGE_KEYS = {
  AUTH_SESSION: 'kitnova_auth_session',
  FONTS: 'kitnova_fonts',
  STUDIO_ARTWORKS: 'kitnova_studio_artworks',
  PRICING: 'kitnova_pricing',
  PRODUCTS: 'kitnova_products',
  ORDERS: 'kitnova_orders',
  PAYMENTS: 'kitnova_payments',
  RIDERS: 'kitnova_riders',
  CUSTOMERS: 'kitnova_customers',
  AUDIT_LOGS: 'kitnova_audit_logs',
  ORDER_AUDIT_LOGS: 'kitnova_order_audit_logs',
  TICKETS: 'kitnova_tickets',
  NOTIFICATIONS: 'kitnova_notifications',
  SETTINGS: 'kitnova_settings',
  SAVED_DESIGNS: 'kitnova_saved_designs',
  TEAM_ORDERS: 'kitnova_team_orders',
  MANUAL_PAYMENTS: 'kitnova_manual_payments',
  COUPONS: 'kitnova_coupons',
  CATEGORIES: 'kitnova_categories',
  BANNERS: 'kitnova_banners',
  ADMIN_ACCOUNTS: 'kitnova_admin_accounts'
};

export const INITIAL_AUTH_USERS: AuthUser[] = [
  {
    id: 'usr-cust-01',
    name: 'David Mukasa',
    email: 'customer@kitnova.ug',
    phone: '+256 701 445 289',
    role: 'customer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-rider-01',
    name: 'Ronald Mugisha',
    email: 'rider@kitnova.ug',
    phone: '+256 701 445 289',
    role: 'rider',
    riderId: 'rider-01',
    avatarUrl: '/assets/images/kitnova_rider_delivery_1791234701225.jpg'
  },
  {
    id: 'usr-admin-super',
    name: 'Ronald Ssebaggala',
    email: 'admin@kitnova.ug',
    phone: '+256 772 000 111',
    role: 'super_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-admin-ops',
    name: 'Grace Namubiru',
    email: 'ops@kitnova.ug',
    phone: '+256 782 555 444',
    role: 'operations_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-admin-prod',
    name: 'Brian Kasoma',
    email: 'product@kitnova.ug',
    phone: '+256 703 111 222',
    role: 'product_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-admin-supp',
    name: 'Fiona Nalwanga',
    email: 'support@kitnova.ug',
    phone: '+256 754 999 888',
    role: 'support_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  }
];

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

export class KitnovaStore {
  private static instance: KitnovaStore;

  fonts: StudioFont[];
  studioArtworks: StudioArtwork[];
  pricing: StudioPricing;
  products: Product[];
  orders: Order[];
  payments: PaymentTransaction[];
  riders: Rider[];
  customers: CustomerProfile[];
  auditLogs: AdminAuditLog[];
  orderAuditLogs: OrderAuditLog[];
  tickets: SupportTicket[];
  notifications: NotificationItem[];
  settings: AppSettings;
  zones: DeliveryZone[] = INITIAL_ZONES;
  savedDesigns: StudioDesign[];
  teamOrders: TeamOrder[];
  manualPaymentMethods: ManualPaymentMethodConfig[];
  coupons: CouponPromo[];
  categories: ProductCategory[];
  banners: CmsBanner[];
  adminAccounts: AdminUserAccount[];
  currentUser: AuthUser | null;
  listeners: Array<() => void> = [];

  private constructor() {
    this.fonts = loadFromStorage(STORAGE_KEYS.FONTS, INITIAL_FONTS);
    this.studioArtworks = loadFromStorage<StudioArtwork[]>(STORAGE_KEYS.STUDIO_ARTWORKS, []);
    this.pricing = loadFromStorage(STORAGE_KEYS.PRICING, INITIAL_PRICING);
    this.products = loadFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    this.orders = loadFromStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    this.payments = loadFromStorage(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    this.riders = loadFromStorage(STORAGE_KEYS.RIDERS, INITIAL_RIDERS);
    this.customers = loadFromStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    this.auditLogs = loadFromStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    this.orderAuditLogs = loadFromStorage(STORAGE_KEYS.ORDER_AUDIT_LOGS, INITIAL_ORDER_AUDIT_LOGS);
    this.tickets = loadFromStorage(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
    this.notifications = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.settings = loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    this.savedDesigns = loadFromStorage(STORAGE_KEYS.SAVED_DESIGNS, []);
    this.teamOrders = loadFromStorage(STORAGE_KEYS.TEAM_ORDERS, []);
    this.manualPaymentMethods = loadFromStorage(STORAGE_KEYS.MANUAL_PAYMENTS, INITIAL_MANUAL_PAYMENTS);
    this.coupons = loadFromStorage(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    this.categories = loadFromStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    this.banners = loadFromStorage(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
    this.adminAccounts = loadFromStorage(STORAGE_KEYS.ADMIN_ACCOUNTS, INITIAL_ADMIN_ACCOUNTS);
    this.currentUser = loadFromStorage<AuthUser | null>(STORAGE_KEYS.AUTH_SESSION, null);
  }

  private persistFonts(): void {
    saveToStorage(STORAGE_KEYS.FONTS, this.fonts);
    this.notify();
  }

  updateFont(fontId: string, updates: Partial<StudioFont>): void {
    this.fonts = this.fonts.map(font => font.id === fontId ? { ...font, ...updates } : font);
    this.persistFonts();
  }

  addFont(font: StudioFont): void {
    if (this.fonts.some(item => item.id === font.id)) throw new Error('A font with this ID already exists.');
    this.fonts = [...this.fonts, { ...font, sortOrder: this.fonts.length + 1 }];
    this.persistFonts();
  }

  toggleFont(fontId: string): void {
    this.fonts = this.fonts.map(font => font.id === fontId ? { ...font, isEnabled: !font.isEnabled } : font);
    this.persistFonts();
  }

  setDefaultFont(fontId: string): void {
    this.fonts = this.fonts.map(font => ({ ...font, isDefault: font.id === fontId }));
    this.persistFonts();
  }

  addStudioArtwork(artwork: StudioArtwork): void {
    this.studioArtworks = [...this.studioArtworks, artwork];
    saveToStorage(STORAGE_KEYS.STUDIO_ARTWORKS, this.studioArtworks);
    this.notify();
  }

  updateStudioArtwork(id: string, updates: Partial<StudioArtwork>): void {
    this.studioArtworks = this.studioArtworks.map(item => item.id === id ? { ...item, ...updates } : item);
    saveToStorage(STORAGE_KEYS.STUDIO_ARTWORKS, this.studioArtworks);
    this.notify();
  }

  removeStudioArtwork(id: string): void {
    this.studioArtworks = this.studioArtworks.filter(item => item.id !== id);
    saveToStorage(STORAGE_KEYS.STUDIO_ARTWORKS, this.studioArtworks);
    this.notify();
  }

  static getInstance(): KitnovaStore {
    if (!KitnovaStore.instance) {
      KitnovaStore.instance = new KitnovaStore();
    }
    return KitnovaStore.instance;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // --- AUTHENTICATION & ACCESS CONTROL (Spec Section 5, 8, 9, 10, 11) ---
  login(_email: string, _password?: string, _forceRole?: Role): { success: boolean; user?: AuthUser; error?: string } {
    // Production security: this store is not an identity provider. All login must use Supabase Auth.
    return { success: false, error: 'Local/demo login is disabled. Sign in through the secure authentication screen.' };
  }

  logout(): void {
    // Clear local UI immediately and revoke the persistent Supabase session asynchronously.
    import('./supabaseClient').then(({ supabase }) => supabase.auth.signOut()).catch(() => {});
    const prev = this.currentUser;
    this.currentUser = null;
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    } catch (e) {
      console.warn(e);
    }
    if (prev) {
      this.logAction('users', 'LOGOUT', `User ${prev.email} logged out from ${prev.role} portal`, prev.name);
    }
    this.notify();
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  switchAccountByRole(_role: Role): void {
    // Role switching is deliberately disabled. A role must come from a verified server-side profile.
    console.warn('Role switching is disabled for security. Sign in with an authorized account.');
  }

  // Dedicated Admin Login for Application B (Super Admin) - Strictly forbids non-admin accounts
  adminLogin(_email: string, _password?: string): { success: boolean; user?: AuthUser; error?: string } {
    return { success: false, error: 'Local administrative login is disabled. Use verified Supabase credentials and an authorized profile.' };
  }
}

export const store = KitnovaStore.getInstance();
