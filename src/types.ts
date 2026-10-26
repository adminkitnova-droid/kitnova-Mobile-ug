export type Role = 'customer' | 'rider' | 'super_admin' | 'operations_admin' | 'product_admin' | 'support_admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  riderId?: string;
  token?: string;
}

export type PaymentMethod = 'mtn_momo' | 'airtel_money' | 'relworx_momo' | 'stripe_card' | 'manual_bank';

export type PaymentStatus = 'unpaid' | 'payment_initiated' | 'pending_verification' | 'approved' | 'rejected' | 'paid';

export type OrderStatus =
  | 'pending'
  | 'payment_pending'
  | 'paid'
  | 'confirmed'
  | 'preparing'
  | 'customization_review'
  | 'ready'
  | 'rider_assigned'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'failed_delivery';

export interface ManualPaymentMethodConfig {
  id: string;
  provider: 'mtn_momo' | 'airtel_money' | 'manual_bank' | 'cash_on_delivery';
  title: string;
  merchantName: string;
  merchantNumber: string;
  ussdTemplate?: string;
  instructions: string;
  isActive: boolean;
  qrCodeUrl?: string;
}

export interface CouponPromo {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 10 for 10% or 15000 for UGX 15,000
  minSpend: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
}

export interface CmsBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  badgeText: string;
  imageUrl: string;
  ctaText: string;
  targetView: string;
  isActive: boolean;
  order: number;
}

export interface AdminUserAccount {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'operations_admin' | 'product_admin' | 'support_admin';
  status: 'active' | 'suspended';
  lastLoginAt?: string;
  createdAt: string;
  phone?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  itemCount: number;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  altText: string;
  focalPoint?: { x: number; y: number };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: 'club' | 'national' | 'training' | 'blank';
  team: string;
  basePrice: number; // UGX
  oldPrice?: number; // UGX
  discountPrice?: number; // UGX
  sizes: string[]; // XS, S, M, L, XL, 2XL, 3XL
  colors: string[]; // hex codes
  stock: number;
  lowStockThreshold: number; // independent threshold per product
  isCustomizable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  status: 'active' | 'archived' | 'draft';
  images: ProductImage[];
  createdAt: string;
}

export interface StudioArtwork {
  id: string;
  name: string;
  imageUrl: string;
  category: 'crest' | 'sponsor' | 'badge' | 'pattern' | 'other';
  isEnabled: boolean;
  createdAt: string;
}

export interface StudioFont {
  id: string;
  name: string;
  family: string;
  cssClass: string;
  isEnabled: boolean;
  isDefault: boolean;
  sortOrder: number;
  previewText: string;
  supportedProducts?: string[]; // if empty, applies to all
  fontDataUrl?: string; // optional uploaded font file embedded for local/offline use
}

export interface StudioPricing {
  namePrice: number; // UGX
  numberPrice: number; // UGX
  logoPrice: number; // UGX
  sponsorPrice: number; // UGX
  badgePrice: number; // UGX
  sleevePatchPrice: number; // UGX
  framePrice: number; // UGX
  graphicPrice: number; // UGX
  emojiPrice: number; // UGX
  backgroundPrice: number; // UGX
}

export interface CanvasLayer {
  id: string;
  type: 'name' | 'number' | 'logo' | 'sponsor' | 'badge' | 'text' | 'graphic' | 'emoji' | 'upload';
  category?: 'plain_text' | 'graphic_artwork';
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  letterSpacing?: number;
  alignment?: 'left' | 'center' | 'right';
  backgroundType?: 'none' | 'rectangle' | 'rounded' | 'badge';
  backgroundColor?: string;
  frameType?: 'none' | 'solid' | 'gold_border' | 'double';
  frameColor?: string;
  imageUrl?: string;
  graphicName?: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  scale?: number;
  rotation?: number;
  opacity?: number;
  side: 'front' | 'back';
  isLocked?: boolean;
  isVisible: boolean;
  zIndex: number;
  zone?: 'front_chest' | 'front_center' | 'front_number' | 'back_name' | 'back_number' | 'back_sponsor' | 'free';
}

export interface StudioDesign {
  id: string;
  userId?: string;
  title: string;
  productId: string;
  productName: string;
  baseJerseyColor: string;
  collarColor: string;
  trimColor: string;
  layers: CanvasLayer[];
  totalCustomizationPrice: number;
  previewFrontUrl?: string;
  previewBackUrl?: string;
  status: 'draft' | 'under_review' | 'approved' | 'changes_requested';
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  configHash?: string;
  productId: string;
  productName: string;
  productImage: string;
  basePrice: number;
  customizationPrice: number;
  totalUnitPrice: number;
  size: string;
  color: string;
  quantity: number;
  design?: StudioDesign;
  customSummary?: {
    playerName?: string;
    playerNumber?: string;
    sponsorText?: string;
    hasBadges?: boolean;
    fontName?: string;
  };
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number; // UGX
  estimatedTime: string;
  expressAvailable: boolean;
  expressFee: number;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  alternativePhone?: string;
  zoneId: string;
  zoneName: string;
  streetAddress: string;
  landmark?: string;
  deliveryOption: 'standard' | 'express' | 'scheduled';
  scheduledTime?: string;
  deliveryInstructions?: string;
}

export interface ProofOfDelivery {
  recipientName: string;
  receivedAt: string;
  signatureDataUrl?: string;
  photoUrl?: string;
  deliveryNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "KTN-2026-8910"
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paymentProofUrl?: string;
  status: OrderStatus;
  deliveryAddress: DeliveryAddress;
  assignedRiderId?: string;
  assignedRiderName?: string;
  assignedRiderPhone?: string;
  riderLocation?: {
    lat: number;
    lng: number;
    lastUpdate: string;
    isStale: boolean;
  };
  proofOfDelivery?: ProofOfDelivery;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: string;
    actor: string;
    note?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  status: PaymentStatus;
  evidenceUrl?: string;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  vehiclePlate: string;
  vehicleType: 'motorcycle' | 'van';
  status: 'available' | 'busy' | 'offline';
  isLocationSharingActive: boolean;
  currentCoordinates: {
    lat: number;
    lng: number;
    landmark: string;
    lastUpdated: string;
  };
  rating: number;
  totalCompletedDeliveries: number;
  activeOrderId?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended';
  avatarUrl?: string;
  ordersCount: number;
  totalSpent: number;
  loyaltyPoints: number;
  savedAddresses: DeliveryAddress[];
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  module: 'studio_pricing' | 'products' | 'orders' | 'riders' | 'payments' | 'system' | 'users' | 'order_status_change';
  action: string;
  description: string;
  beforeValue?: string;
  afterValue?: string;
}

export interface OrderAuditLog {
  id: string;
  orderId: string;
  orderNumber: string;
  adminId: string;
  adminEmail: string;
  adminRole: string;
  originalStatus: OrderStatus;
  newStatus: OrderStatus;
  originalPaymentStatus?: PaymentStatus;
  newPaymentStatus?: PaymentStatus;
  changedFields?: Record<string, any>;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  orderId?: string;
  subject: string;
  category: 'order' | 'customization' | 'delivery' | 'payment' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed';
  createdAt: string;
  messages: Array<{
    id: string;
    sender: 'customer' | 'agent';
    senderName: string;
    text: string;
    timestamp: string;
    attachmentUrl?: string;
  }>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'delivery' | 'inventory' | 'support' | 'promotion';
  targetRole: 'customer' | 'rider' | 'admin' | 'all';
  recipientId?: string; // customerId or riderId
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface TeamRosterMember {
  id: string;
  playerName: string;
  number: string;
  size: string;
  position?: string;
}

export interface TeamOrder {
  id: string;
  teamName: string;
  clubCrestUrl?: string;
  baseProductId: string;
  productName: string;
  customDesignId?: string;
  members: TeamRosterMember[];
  unitBasePrice: number;
  unitCustomizationPrice: number;
  totalPrice: number;
  createdAt: string;
}

export interface AppSettings {
  appName: string;
  companyName: string;
  currency: string;
  country: string;
  maintenanceMode: boolean;
  currentAppVersion: string;
  minAppVersion: string;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  expressDeliveryFee: number;
  serviceConfig: {
    supabaseUrl: string;
    supabaseAnonKey: string;
    firebaseProjectId: string;
    firebaseAppId: string;
    cloudinaryCloudName: string;
    cloudinaryPreset: string;
  };
}
