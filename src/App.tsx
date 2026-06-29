/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Works from './pages/Works';
import Employees from './pages/Employees';
import Inspections from './pages/Inspections';
import Gate from './pages/Gate';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { Loader2 } from 'lucide-react';

const AppRoutes = () => {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-brand" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/construtoras" element={<Companies />} />
        <Route path="/obras" element={<Works />} />
        <Route path="/funcionarios" element={<Employees />} />
        <Route path="/vistorias" element={<Inspections />} />
        <Route path="/portaria" element={<Gate />} />
        <Route path="/configuracoes" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}



