import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar';
import { CustomerHome } from '../../components/customer/CustomerHome';
import { CustomerShop } from '../../components/customer/CustomerShop';
import { CustomerProductDetail } from '../../components/customer/CustomerProductDetail';
import { StudioEditor } from '../../components/studio/StudioEditor';
import { CustomerCart } from '../../components/customer/CustomerCart';
import { CustomerCheckout } from '../../components/customer/CustomerCheckout';
import { CustomerTracking } from '../../components/customer/CustomerTracking';
import { CustomerProfile } from '../../components/customer/CustomerProfile';
import { CustomerTeamOrders } from '../../components/customer/CustomerTeamOrders';
import { CustomerAiAssistant } from '../../components/customer/CustomerAiAssistant';
import { RiderApp } from '../../components/rider/RiderApp';
import { CustomerAuthScreen } from './CustomerAuthScreen';
import {
  CartItem,
  Product,
  StudioDesign,
  Order,
  DeliveryZone,
  AuthUser
} from '../../types';
import {
  ShoppingBag,
  Home,
  Compass,
  Sparkles,
  User,
  Truck,
  Bell,
  X,
  LogOut,
  ShieldAlert
} from 'lucide-react';

interface CustomerRiderAppProps {
  onSwitchToSuperAdmin?: () => void;
}

export const CustomerRiderApp: React.FC<CustomerRiderAppProps> = ({
  onSwitchToSuperAdmin
}) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const currentUser = store.getCurrentUser();

  // Customer Navigation State
  const [customerView, setCustomerView] = useState<
    'home' | 'shop' | 'product_detail' | 'studio' | 'cart' | 'checkout' | 'tracking' | 'profile' | 'team'
  >('home');

  // Contextual Customer state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [studioContext, setStudioContext] = useState<{
    product: Product;
    size: string;
    color: string;
    initialDesign?: StudioDesign;
    editingCartItemId?: string;
  } | null>(null);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutDiscount, setCheckoutDiscount] = useState<number>(0);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone>(store.zones[0]);

  // Overlays
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);

  // Cart operations
  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(
        i =>
          i.productId === item.productId &&
          i.size === item.size &&
          i.color === item.color &&
          JSON.stringify(i.customSummary) === JSON.stringify(item.customSummary)
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantity += item.quantity;
        return copy;
      }
      return [item, ...prev];
    });
    setCustomerView('cart');
  };

  const handleStudioAddToCart = (
    design: StudioDesign,
    product: Product,
    size: string,
    color: string,
    editingCartItemId?: string
  ) => {
    const nameL = design.layers.find(l => l.type === 'name');
    const numL = design.layers.find(l => l.type === 'number');
    const sponsorL = design.layers.find(l => l.type === 'sponsor');
    const hasBadge = design.layers.some(l => l.type === 'badge' || l.type === 'logo');

    const cartItem: CartItem = {
      id: editingCartItemId || `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      configHash: `hash-${product.id}-${size}-${color}-${Date.now()}`,
      productId: product.id,
      productName: `${product.name} (Custom Edition)`,
      productImage: product.images[0]?.url || '/assets/images/kitnova_custom_jersey_1791234670740.jpg',
      basePrice: product.basePrice,
      customizationPrice: design.totalCustomizationPrice,
      totalUnitPrice: product.basePrice + design.totalCustomizationPrice,
      size: size || 'L',
      color: color || design.baseJerseyColor,
      quantity: 1,
      design,
      customSummary: {
        playerName: nameL?.text,
        playerNumber: numL?.text,
        sponsorText: sponsorL?.text,
        hasBadges: hasBadge
      }
    };

    if (editingCartItemId) {
      setCartItems(prev => prev.map(i => (i.id === editingCartItemId ? cartItem : i)));
      setCustomerView('cart');
    } else {
      handleAddToCart(cartItem);
    }
  };

  const handleAddPlainToCart = (product: Product, size: string, color: string, quantity: number = 1) => {
    const cartItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      configHash: `hash-${product.id}-${size}-${color}`,
      productId: product.id,
      productName: product.name,
      productImage: product.images[0]?.url || '/assets/images/kitnova_custom_jersey_1791234670740.jpg',
      basePrice: product.basePrice,
      customizationPrice: 0,
      totalUnitPrice: product.basePrice,
      size,
      color,
      quantity
    };
    handleAddToCart(cartItem);
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    setCartItems(prev => prev.map(i => (i.id === itemId ? { ...i, quantity: newQty } : i)));
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleProceedToCheckout = (discount: number, zone: DeliveryZone) => {
    setCheckoutDiscount(discount);
    setSelectedZone(zone);
    setCustomerView('checkout');
  };

  const handleOrderPlaced = (order: Order) => {
    setCartItems([]);
    setActiveTrackingOrderId(order.id);
    setCustomerView('tracking');
  };

  const customerUnreadNotifs = store.notifications.filter(
    n => !n.isRead && (n.targetRole === 'customer' || n.targetRole === 'all')
  );

  // 1. IF NO AUTHENTICATED USER: OPEN AUTHENTICATION SCREEN FOR APPLICATION A
  if (!currentUser) {
    return (
      <CustomerAuthScreen
        onLoginSuccess={() => {}}
        onSwitchToAdmin={onSwitchToSuperAdmin}
      />
    );
  }

  // 2. CHECK ROLE
  const isCustomer = currentUser.role === 'customer';
  const isRider = currentUser.role === 'rider';
  const isAdmin =
    currentUser.role === 'super_admin' ||
    currentUser.role === 'operations_admin' ||
    currentUser.role === 'product_admin' ||
    currentUser.role === 'support_admin';

  // 3. IF AN ADMIN IS SIGNED IN, RESTRICT ACCESS IN APPLICATION A
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#071329] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0A1A3C] border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-[#D4A029]">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-white">Administrative Account Detected</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              You are signed in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.role}). This client is <strong className="text-[#D4A029]">Application A (Customer & Rider Mobile App)</strong>.
            </p>
          </div>

          <div className="space-y-3">
            {onSwitchToSuperAdmin && (
              <button
                onClick={onSwitchToSuperAdmin}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-black text-xs hover:brightness-110 transition-all cursor-pointer shadow-lg"
              >
                Launch KITNOVA Super Admin Console
              </button>
            )}

            <button
              onClick={() => store.logout()}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Log Out to Customer Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1A3C] text-slate-100 flex flex-col font-sans relative">
      {/* ========================================================================= */}
      {/* 1. CUSTOMER APPLICATION INTERFACE */}
      {/* ========================================================================= */}
      {isCustomer && (
        <div className="flex-1 flex flex-col pb-16 md:pb-0">
          <CustomerNavbar
            currentView={customerView}
            onNavigate={view => {
              if (view === 'shop') setSelectedProduct(null);
              setCustomerView(view as any);
            }}
            cartCount={cartItems.reduce((s, i) => s + i.quantity, 0)}
            unreadNotifsCount={customerUnreadNotifs.length}
            onOpenNotifications={() => setIsNotifsOpen(true)}
            onOpenAiAssistant={() => setIsAiOpen(true)}
            onLogout={() => store.logout()}
          />

          <main className="flex-1">
            {customerView === 'home' && (
              <CustomerHome
                onNavigate={view => setCustomerView(view as any)}
                onSelectProduct={p => {
                  setSelectedProduct(p);
                  setCustomerView('product_detail');
                }}
                onCustomizeProduct={p => {
                  setSelectedProduct(p);
                  setCustomerView('studio');
                }}
              />
            )}

            {customerView === 'shop' && (
              <CustomerShop
                onSelectProduct={p => {
                  setSelectedProduct(p);
                  setCustomerView('product_detail');
                }}
                onCustomizeProduct={(p, size, color) => {
                  setSelectedProduct(p);
                  setStudioContext({
                    product: p,
                    size: size || p.sizes[0] || 'L',
                    color: color || p.colors[0] || '#0F2A5F'
                  });
                  setCustomerView('studio');
                }}
                onAddToCartPlain={handleAddPlainToCart}
              />
            )}

            {customerView === 'product_detail' && selectedProduct && (
              <CustomerProductDetail
                product={selectedProduct}
                onBack={() => setCustomerView('shop')}
                onCustomize={(p, size, color) => {
                  setSelectedProduct(p);
                  setStudioContext({
                    product: p,
                    size: size || p.sizes[0] || 'L',
                    color: color || p.colors[0] || '#0F2A5F'
                  });
                  setCustomerView('studio');
                }}
                onAddPlainToCart={handleAddPlainToCart}
              />
            )}

            {customerView === 'studio' && (
              <StudioEditor
                initialProduct={studioContext?.product || selectedProduct || store.products[0]}
                initialSize={studioContext?.size}
                initialColor={studioContext?.color}
                initialDesign={studioContext?.initialDesign}
                editingCartItemId={studioContext?.editingCartItemId}
                cartCount={cartItems.reduce((s, i) => s + i.quantity, 0)}
                onAddToCart={handleStudioAddToCart}
                onBack={() => setCustomerView('shop')}
                onNavigateToCart={() => setCustomerView('cart')}
              />
            )}

            {customerView === 'cart' && (
              <CustomerCart
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onEditItem={item => {
                  const prod = store.products.find(p => p.id === item.productId) || store.products[0];
                  setSelectedProduct(prod);
                  setStudioContext({
                    product: prod,
                    size: item.size,
                    color: item.color,
                    initialDesign: item.design,
                    editingCartItemId: item.id
                  });
                  setCustomerView('studio');
                }}
                onProceedToCheckout={handleProceedToCheckout}
                onNavigate={view => setCustomerView(view as any)}
              />
            )}

            {customerView === 'checkout' && (
              <CustomerCheckout
                items={cartItems}
                discount={checkoutDiscount}
                selectedZone={selectedZone}
                onBackToCart={() => setCustomerView('cart')}
                onOrderPlaced={handleOrderPlaced}
              />
            )}

            {customerView === 'tracking' && (
              <CustomerTracking
                orderId={activeTrackingOrderId || undefined}
                onBack={() => setCustomerView('home')}
              />
            )}

            {customerView === 'profile' && (
              <CustomerProfile
                onTrackOrder={orderId => {
                  setActiveTrackingOrderId(orderId);
                  setCustomerView('tracking');
                }}
                onOpenStudio={design => {
                  if (design) {
                    const prod = store.products.find(p => p.id === design.productId) || store.products[0];
                    setSelectedProduct(prod);
                    setStudioContext({
                      product: prod,
                      size: 'L',
                      color: design.baseJerseyColor,
                      initialDesign: design
                    });
                  }
                  setCustomerView('studio');
                }}
                onLogout={() => store.logout()}
                onLogin={() => store.logout()}
              />
            )}

            {customerView === 'team' && (
              <CustomerTeamOrders
                onOrderSubmitted={() => setCustomerView('profile')}
              />
            )}
          </main>

          {/* Clean Mobile Bottom Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A1A3C]/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-2.5 text-[10px] font-semibold text-slate-400">
            <button
              onClick={() => setCustomerView('home')}
              className={`flex flex-col items-center gap-1 ${
                customerView === 'home' ? 'text-[#D4A029]' : 'hover:text-slate-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => setCustomerView('shop')}
              className={`flex flex-col items-center gap-1 ${
                customerView === 'shop' ? 'text-[#D4A029]' : 'hover:text-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Shop</span>
            </button>
            <button
              onClick={() => setCustomerView('studio')}
              className={`flex flex-col items-center gap-1 relative ${
                customerView === 'studio' ? 'text-[#D4A029]' : 'hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Studio</span>
            </button>
            <button
              onClick={() => setCustomerView('cart')}
              className={`flex flex-col items-center gap-1 relative ${
                customerView === 'cart' ? 'text-[#D4A029]' : 'hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {cartItems.length > 0 && (
                <span className="absolute -top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#D4A029] text-[#0A1A3C] text-[9px] font-bold flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setCustomerView('profile')}
              className={`flex flex-col items-center gap-1 ${
                customerView === 'profile' ? 'text-[#D4A029]' : 'hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => store.logout()}
              className="flex flex-col items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RIDER DELIVERY APP INTERFACE */}
      {/* ========================================================================= */}
      {isRider && (
        <RiderApp
          currentRiderId={currentUser.riderId || 'rider-01'}
          onLogout={() => store.logout()}
        />
      )}

      {/* Overlays */}
      <CustomerAiAssistant
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />

      {isNotifsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="bg-[#0A1A3C] border-l border-slate-800 w-full max-w-sm h-full p-6 space-y-4 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#D4A029]" />
                Kitnova Alerts
              </h2>
              <button
                onClick={() => setIsNotifsOpen(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {customerUnreadNotifs.length === 0 ? (
                <p className="text-slate-400 text-center py-10">No unread notifications.</p>
              ) : (
                customerUnreadNotifs.map(n => (
                  <div key={n.id} className="p-3 rounded-xl bg-[#0F2A5F]/30 border border-slate-800 space-y-1">
                    <p className="font-bold text-white">{n.title}</p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-500 font-mono block pt-1">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
