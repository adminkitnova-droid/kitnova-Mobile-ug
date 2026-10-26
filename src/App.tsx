import React, { useState, useEffect } from 'react';
import { CustomerRiderApp } from './apps/customer-rider/CustomerRiderApp';
import { SuperAdminApp } from './apps/super-admin/SuperAdminApp';
import { restoreAuthenticatedUser } from './services/supabaseClient';
import { store } from './services/store';

export default function App() {
  const isSuperAdminRoute = (): boolean => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.startsWith('/admin') || path === '/admin.html' || hash === '#admin';
  };

  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(isSuperAdminRoute());
  const [startupProgress, setStartupProgress] = useState(0);
  const [startupComplete, setStartupComplete] = useState(false);

  useEffect(() => {
    const handleNavigation = () => {
      setIsAdminRoute(isSuperAdminRoute());
    };
    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('hashchange', handleNavigation);
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('hashchange', handleNavigation);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      if (!alive) return;
      setStartupProgress(Math.min(100, Math.round(((Date.now() - startedAt) / 20000) * 100)));
    }, 100);
    // Keep the branded splash visible for at least 20 seconds and until session restoration completes.
    const minimumDelay = new Promise<void>(resolve => window.setTimeout(resolve, 20000));
    const authRestore = restoreAuthenticatedUser().then(user => {
      if (!alive) return;
      if (user) {
        store.currentUser = user;
        try { localStorage.setItem('kitnova_auth_session', JSON.stringify(user)); } catch {}
      } else {
        store.currentUser = null;
        try { localStorage.removeItem('kitnova_auth_session'); } catch {}
      }
    }).catch(() => {
      if (alive) { store.currentUser = null; try { localStorage.removeItem('kitnova_auth_session'); } catch {} }
    });
    Promise.all([minimumDelay, authRestore]).then(() => {
      if (!alive) return;
      setStartupProgress(100);
      setStartupComplete(true);
    });
    return () => { alive = false; window.clearInterval(timer); };
  }, []);

  const navigateToAdmin = () => {
    window.location.hash = '#admin';
    setIsAdminRoute(true);
  };

  const navigateToCustomer = () => {
    window.location.hash = '';
    setIsAdminRoute(false);
  };

  // Requested branded 20-second startup/loading experience.
  if (!startupComplete) {
    return <div className="kitnova-splash" role="status" aria-live="polite">
      <img src="/icon-512.png" alt="KITNOVA" className="kitnova-splash-logo" />
      <div className="kitnova-splash-brand">KITNOVA <span>JERSEY</span></div>
      <p>Precision sportswear. Built for champions.</p>
      <div className="kitnova-progress-track"><div className="kitnova-progress-fill" style={{ width: `${startupProgress}%` }} /></div>
      <div className="kitnova-progress-label">Loading your store… {startupProgress}%</div>
      <small>VISHCOM TECH COMPANY UG</small>
    </div>;
  }

  // Dedicated separate application entry points (Zero permanent top switcher tabs)
  if (isAdminRoute) {
    return <SuperAdminApp onSwitchToCustomerApp={navigateToCustomer} />;
  }

  return <CustomerRiderApp onSwitchToSuperAdmin={navigateToAdmin} />;
}
