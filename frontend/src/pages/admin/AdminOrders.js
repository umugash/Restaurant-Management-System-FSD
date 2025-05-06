import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { getOrders, updateOrder, deleteOrder } from '../../services/api';
import Modal from '../../components/common/Modal';
import moment from 'moment';
import { FaEye, FaTrash, FaSort, FaFilter } from 'react-icons/fa';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  // Sort orders
  const sortedOrders = [...orders].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'date':
        valueA = new Date(a.createdAt);
        valueB = new Date(b.createdAt);
        break;
      case 'table':
        valueA = a.table ? a.table.tableNumber : 0;
        valueB = b.table ? b.table.tableNumber : 0;
        break;
      case 'amount':
        valueA = a.totalAmount;
        valueB = b.totalAmount;
        break;
      default:
        valueA = new Date(a.createdAt);
        valueB = new Date(b.createdAt);
    }
    
    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
  
  // Filter orders by status
  const filteredOrders = statusFilter 
    ? sortedOrders.filter(order => order.status === statusFilter)
    : sortedOrders;
  
  // Open order details modal
  const handleViewOrder = (order) => {
    setCurrentOrder(order);
    setModalOpen(true);
  };
  
  // Handle order deletion
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const success = await deleteOrder(orderId);
        
        if (success) {
          // Remove order from the list
          setOrders(orders.filter(order => order._id !== orderId));
        }
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };
  
  // Update order status
  const handleUpdateStatus = async (status) => {
    try {
      const updatedOrder = await updateOrder(currentOrder._id, { status });
      
      if (updatedOrder) {
        // Update orders list
        setOrders(orders.map(order => 
          order._id === currentOrder._id ? { ...order, status: updatedOrder.status } : order
        ));
        
        setModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };
  
  // Calculate order total
  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
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
      <h1 className="page-title">Order Management</h1>
      
      <div className="card">
        <div className="table-filter">
          <div className="filter-group">
            <div className="filter-label">
              <FaFilter style={{ marginRight: '5px' }} />
              Status:
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="filter-group">
            <div className="filter-label">
              <FaSort style={{ marginRight: '5px' }} />
              Sort By:
            </div>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="date">Date</option>
              <option value="table">Table</option>
              <option value="amount">Amount</option>
            </select>
          </div>
          
          <div className="filter-group">
            <button 
              className="btn btn-secondary"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </div>
        
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Table</th>
                <th>Waiter</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id.substring(order._id.length - 6)}</td>
                    <td>{moment(order.createdAt).format('YYYY-MM-DD HH:mm')}</td>
                    <td>Table {order.table?.tableNumber || 'N/A'}</td>
                    <td>{order.waiter?.name || 'N/A'}</td>
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
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleViewOrder(order)}
                          style={{ padding: '6px 10px' }}
                        >
                          <FaEye />
                        </button>
                        <button 
                          className="btn btn-error"
                          onClick={() => handleDeleteOrder(order._id)}
                          style={{ padding: '6px 10px' }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center' }}>No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Order Details Modal */}
      {currentOrder && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Order Details #${currentOrder._id.substring(currentOrder._id.length - 6)}`}
        >
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p><strong>Date:</strong> {moment(currentOrder.createdAt).format('YYYY-MM-DD HH:mm')}</p>
              <p><strong>Table:</strong> {currentOrder.table?.tableNumber || 'N/A'}</p>
              <p><strong>Waiter:</strong> {currentOrder.waiter?.name || 'N/A'}</p>
              <p>
                <strong>Status:</strong> 
                <span className={`badge badge-${
                  currentOrder.status === 'active' ? 'warning' : 
                  currentOrder.status === 'completed' ? 'success' : 'error'
                }`} style={{ marginLeft: '8px' }}>
                  {currentOrder.status}
                </span>
              </p>
              <p><strong>Payment Status:</strong> {currentOrder.paymentStatus}</p>
              {currentOrder.paymentMethod && (
                <p><strong>Payment Method:</strong> {currentOrder.paymentMethod}</p>
              )}
            </div>
            
            <h3>Order Items</h3>
            <div className="order-items">
              {currentOrder.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">${item.price.toFixed(2)} x {item.quantity}</div>
                    {item.notes && <div className="item-notes">Note: {item.notes}</div>}
                    }
                  </div>
                  <div>
                    <span className={`badge badge-${
                      item.status === 'ordered' ? 'info' : 
                      item.status === 'preparing' ? 'warning' :
                      item.status === 'ready' ? 'success' :
                      item.status === 'served' ? 'success' : 'error'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
              <div className="order-total">
                <span>Total</span>
                <span>${calculateTotal(currentOrder.items).toFixed(2)}</span>
              </div>
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <h3>Update Order Status</h3>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  className="btn"
                  onClick={() => handleUpdateStatus('active')}
                  disabled={currentOrder.status === 'active'}
                >
                  Mark as Active
                </button>
                <button 
                  className="btn btn-success"
                  onClick={() => handleUpdateStatus('completed')}
                  disabled={currentOrder.status === 'completed'}
                >
                  Mark as Completed
                </button>
                <button 
                  className="btn btn-error"
                  onClick={() => handleUpdateStatus('cancelled')}
                  disabled={currentOrder.status === 'cancelled'}
                >
                  Mark as Cancelled
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  );
};

export default AdminOrders;