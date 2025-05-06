import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { getGroceries, getLowStockGroceries, getKitchenOrders } from '../../services/api';
import { FaUtensils, FaBoxOpen, FaExclamationTriangle, FaClipboardList } from 'react-icons/fa';

const ChefDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeOrders: 0,
    totalItems: 0,
    lowStock: 0
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data for dashboard stats
        const [groceries, lowStock, orders] = await Promise.all([
          getGroceries(),
          getLowStockGroceries(),
          getKitchenOrders()
        ]);
        
        setStats({
          activeOrders: orders.length,
          totalItems: groceries.length,
          lowStock: lowStock.length
        });
        
        setLowStockItems(lowStock.slice(0, 5)); // Show only 5 low stock items
        setRecentOrders(orders.slice(0, 5)); // Show only 5 recent orders
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <h1 className="page-title">Chef Dashboard</h1>
      
      <div className="welcome-message card" style={{ marginBottom: '2rem' }}>
        <h2>Welcome back, {user?.name}!</h2>
        <p>Here's your kitchen overview for today.</p>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card orders">
          <FaClipboardList size={30} color="#ff9800" />
          <h3 className="stat-number">{stats.activeOrders}</h3>
          <p className="stat-label">Active Orders</p>
        </div>
        
        <div className="stat-card tables">
          <FaUtensils size={30} color="#4caf50" />
          <h3 className="stat-number">{stats.totalItems}</h3>
          <p className="stat-label">Inventory Items</p>
        </div>
        
        <div className="stat-card inventory">
          <FaExclamationTriangle size={30} color="#f44336" />
          <h3 className="stat-number">{stats.lowStock}</h3>
          <p className="stat-label">Low Stock Items</p>
        </div>
      </div>
      
      <div className="grid-cols-2" style={{ display: 'grid', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="card">
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <h2>Recent Orders</h2>
            <a href="/chef/orders" className="btn">View All Orders</a>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Table</th>
                    <th>Items</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>Table {order.table?.tableNumber || 'N/A'}</td>
                      <td>{order.items.length} items</td>
                      <td>
                        <span className="badge badge-warning">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No recent orders found.</p>
          )}
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <h2>Low Stock Items</h2>
            <a href="/chef/groceries" className="btn">View Inventory</a>
          </div>
          
          {lowStockItems.length > 0 ? (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>
                        <span className={`badge badge-${
                          item.quantity <= 0 ? 'error' : 'warning'
                        }`}>
                          {item.quantity <= 0 ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No low stock items found.</p>
          )}
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Quick Actions</h2>
        <div className="grid-cols-2" style={{ display: 'grid', gap: '1rem' }}>
          <a href="/chef/orders" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <FaClipboardList size={30} style={{ marginBottom: '0.5rem' }} />
            <div>Manage Orders</div>
          </a>
          <a href="/chef/groceries" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <FaBoxOpen size={30} style={{ marginBottom: '0.5rem' }} />
            <div>Update Inventory</div>
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default ChefDashboard;