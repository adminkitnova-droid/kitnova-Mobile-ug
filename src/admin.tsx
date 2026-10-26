import React from 'react';
import ReactDOM from 'react-dom/client';
import { SuperAdminApp } from './apps/super-admin/SuperAdminApp';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SuperAdminApp onSwitchToCustomerApp={() => { window.location.href = '/'; }} />
  </React.StrictMode>
);
