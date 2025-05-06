import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import WaiterDashboard from './pages/waiter/WaiterDashboard';
import ChefDashboard from './pages/chef/ChefDashboard';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import TableManagement from './pages/admin/TableManagement';
import AdminReservations from './pages/admin/AdminReservations';
import AdminOrders from './pages/admin/AdminOrders';
import AdminGroceries from './pages/admin/AdminGroceries';

// Receptionist Pages
import ReservationManagement from './pages/receptionist/ReservationManagement';
import ReservationCalendar from './pages/receptionist/ReservationCalendar';

// Waiter Pages
import TableView from './pages/waiter/TableView';
import OrderManagement from './pages/waiter/OrderManagement';

// Chef Pages
import GroceryManagement from './pages/chef/GroceryManagement';
import KitchenOrders from './pages/chef/KitchenOrders';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      
      {/* Protected routes with role-based access */}
      <Route path="/" element={
        user ? (
          user.role === 'admin' ? <Navigate to="/admin" /> :
          user.role === 'receptionist' ? <Navigate to="/receptionist" /> :
          user.role === 'waiter' ? <Navigate to="/waiter" /> :
          user.role === 'chef' ? <Navigate to="/chef" /> :
          <Navigate to="/login" />
        ) : <Navigate to="/login" />
      } />
      
      {/* Admin routes */}
      <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
      <Route path="/admin/users" element={user && user.role === 'admin' ? <UserManagement /> : <Navigate to="/login" />} />
      <Route path="/admin/tables" element={user && user.role === 'admin' ? <TableManagement /> : <Navigate to="/login" />} />
      <Route path="/admin/reservations" element={user && user.role === 'admin' ? <AdminReservations /> : <Navigate to="/login" />} />
      <Route path="/admin/orders" element={user && user.role === 'admin' ? <AdminOrders /> : <Navigate to="/login" />} />
      <Route path="/admin/groceries" element={user && user.role === 'admin' ? <AdminGroceries /> : <Navigate to="/login" />} />
      
      {/* Receptionist routes */}
      <Route path="/receptionist" element={user && (user.role === 'receptionist' || user.role === 'admin') ? <ReceptionistDashboard /> : <Navigate to="/login" />} />
      <Route path="/receptionist/reservations" element={user && (user.role === 'receptionist' || user.role === 'admin') ? <ReservationManagement /> : <Navigate to="/login" />} />
      <Route path="/receptionist/calendar" element={user && (user.role === 'receptionist' || user.role === 'admin') ? <ReservationCalendar /> : <Navigate to="/login" />} />
      
      {/* Waiter routes */}
      <Route path="/waiter" element={user && (user.role === 'waiter' || user.role === 'admin') ? <WaiterDashboard /> : <Navigate to="/login" />} />
      <Route path="/waiter/tables" element={user && (user.role === 'waiter' || user.role === 'admin') ? <TableView /> : <Navigate to="/login" />} />
      <Route path="/waiter/orders" element={user && (user.role === 'waiter' || user.role === 'admin') ? <OrderManagement /> : <Navigate to="/login" />} />
      <Route path="/waiter/orders/:tableId" element={user && (user.role === 'waiter' || user.role === 'admin') ? <OrderManagement /> : <Navigate to="/login" />} />
      
      {/* Chef routes */}
      <Route path="/chef" element={user && (user.role === 'chef' || user.role === 'admin') ? <ChefDashboard /> : <Navigate to="/login" />} />
      <Route path="/chef/groceries" element={user && (user.role === 'chef' || user.role === 'admin') ? <GroceryManagement /> : <Navigate to="/login" />} />
      <Route path="/chef/orders" element={user && (user.role === 'chef' || user.role === 'admin') ? <KitchenOrders /> : <Navigate to="/login" />} />
      
      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;