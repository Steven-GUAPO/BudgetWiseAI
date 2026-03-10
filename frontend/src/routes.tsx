import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Activity from './pages/Activity';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import Rewards from './pages/Rewards';
import Settings from './pages/Settings';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import AIAssistant from './pages/AIAssistant';
import SpendingOutlook from './pages/SpendingOutlook';

const PROTECTED_ROUTES = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/activity',  element: <Activity />  },
  { path: '/budgets',   element: <Budgets />   },
  { path: '/goals',     element: <Goals />     },
  { path: '/rewards',   element: <Rewards />   },
  { path: '/settings',  element: <Settings />  },
  { path: '/ai-assistant',    element: <AIAssistant />    },
  { path: '/spending-outlook', element: <SpendingOutlook /> },
];

const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login"  element={<Login />}  />
      <Route path="/signup" element={<Signup />} />
      {PROTECTED_ROUTES.map(({ path, element }) => (
        <Route key={path} path={path} element={
          <ProtectedRoute><Layout>{element}</Layout></ProtectedRoute>
        } />
      ))}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
