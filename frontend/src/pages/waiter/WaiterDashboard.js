import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { getTables } from '../../services/api';
import { getOrders } from '../../services/api';
import { FaUtensils, FaClipboardList, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const WaiterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    tables: 0,
    activeOrders: 0,
    completedOrders: 0,
  });
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data for dashboard stats
        const tables = await getTables();
        const orders = await getOrders();
        
        // Filter orders for this waiter
        const waiterOrders = orders.filter(order => 
          order.waiter && order.waiter._id === user._id
        );
        
        // Count active and completed orders
        const activeOrders = waiterOrders.filter(order => order.status === 'active').length;
        const completedOrders = waiterOrders.filter(order => order.status === 'completed').length;
        
        setStats({
          tables: tables.length,
          activeOrders,
          completedOrders,
        });
        
        // Get recent orders
        setMyOrders(
          waiterOrders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
        );
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user._id]);
  
  // Calculate order completion rate
  const calculateCompletionRate = () => {
    const total = stats.activeOrders + stats.completedOrders;
    return total > 0 ? Math.round((stats.completedOrders / total) * 100) : 0;
  };
  
  const completionRate = calculateCompletionRate();
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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
      <h1 className="page-title">Waiter Dashboard</h1>
      
      <div className="welcome-message card" style={{ marginBottom: '2rem' }}>
        <h2>Welcome back, {user?.name}!</h2>
        <p>Here's your overview for today.</p>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card tables">
          <FaUtensils size={30} color="#4caf50" />
          <h3 className="stat-number">{stats.tables}</h3>
          <p className="stat-label">Total Tables</p>
        </div>
        
        <div className="stat-card orders">
          <FaClipboardList size={30} color="#ff9800" />
          <h3 className="stat-number">{stats.activeOrders}</h3>
          <p className="stat-label">Active Orders</p>
        </div>
        
        <div className="stat-card reservations">
          <FaCheckCircle size={30} color="#8b0000" />
          <h3 className="stat-number">{completionRate}%</h3>
          <p className="stat-label">Completion Rate</p>
        </div>
      </div>
      
      <div className="grid-cols-2" style={{ display: 'grid', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>My Recent Orders</h2>
          
          {myOrders.length > 0 ? (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Table</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myOrders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id.substring(order._id.length - 6)}</td>
                      <td>Table {order.table?.tableNumber || 'N/A'}</td>
                      <td>{order.items.length} items</td>
                      <td>${order.totalAmount.toFixed(2)}</td>
                      <td>
                        <span className={`badge badge-${
                          order.status === 'active' ? 'warning' : 
                          order.status === 'completed' ? 'success' : 'error'
                        }`}>
                          {order.status}
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
          
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <Link to="/waiter/orders" className="btn">View All Orders</Link>
          </div>
        </div>
        
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Quick Actions</h2>
          <div className="grid-cols-2" style={{ display: 'grid', gap: '1rem' }}>
            <Link to="/waiter/tables" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <FaUtensils size={30} style={{ marginBottom: '0.5rem' }} />
              <div>View Tables</div>
            </Link>
            <Link to="/waiter/orders" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <FaClipboardList size={30} style={{ marginBottom: '0.5rem' }} />
              <div>Manage Orders</div>
            </Link>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Today's Statistics</h3>
            <div style={{ 
              backgroundColor: 'rgba(139, 0, 0, 0.05)',
              borderRadius: 'var(--border-radius)',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Active Orders:</span>
                <span>{stats.activeOrders}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Completed Orders:</span>
                <span>{stats.completedOrders}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total:</span>
                <span>{stats.activeOrders + stats.completedOrders}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WaiterDashboard;