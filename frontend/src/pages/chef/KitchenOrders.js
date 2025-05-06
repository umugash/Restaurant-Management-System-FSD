import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { getKitchenOrders, updateOrder } from '../../services/api';
import moment from 'moment';
import { FaCheck, FaUtensilSpoon, FaHourglass, FaSort } from 'react-icons/fa';

const KitchenOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [sortBy, setSortBy] = useState('time');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getKitchenOrders();
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };
    
    fetchOrders();
    
    // Poll for new orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Toggle expanded order
  const toggleExpandOrder = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };
  
  // Update item status
  const handleUpdateItemStatus = async (orderId, itemId, newStatus) => {
    try {
      const order = orders.find(o => o._id === orderId);
      if (!order) return;
      
      // Prepare item updates
      const itemUpdates = [{
        itemId,
        status: newStatus
      }];
      
      const updatedOrder = await updateOrder(orderId, { itemUpdates });
      
      if (updatedOrder) {
        // Update orders list with new item status
        setOrders(orders.map(order => {
          if (order._id === orderId) {
            // Find and update the specific item
            const updatedItems = order.items.map(item => {
              if (item._id === itemId) {
                return { ...item, status: newStatus };
              }
              return item;
            });
            
            return { ...order, items: updatedItems };
          }
          return order;
        }));
      }
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };
  
  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  // Check if all items in an order are ready
  const areAllItemsReady = (order) => {
    return order.items.every(item => item.status === 'ready' || item.status === 'served');
  };
  
  // Mark all items as ready
  const handleMarkAllReady = async (orderId) => {
    try {
      const order = orders.find(o => o._id === orderId);
      if (!order) return;
      
      // Prepare item updates for all items that aren't ready or served
      const itemUpdates = order.items
        .filter(item => item.status !== 'ready' && item.status !== 'served')
        .map(item => ({
          itemId: item._id,
          status: 'ready'
        }));
      
      if (itemUpdates.length === 0) return; // No items to update
      
      const updatedOrder = await updateOrder(orderId, { itemUpdates });
      
      if (updatedOrder) {
        // Refresh orders
        const data = await getKitchenOrders();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error marking all items ready:', error);
    }
  };
  
  // Sort orders
  const sortedOrders = [...orders].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'time':
        valueA = new Date(a.createdAt);
        valueB = new Date(b.createdAt);
        break;
      case 'table':
        valueA = a.table ? a.table.tableNumber : 0;
        valueB = b.table ? b.table.tableNumber : 0;
        break;
      case 'items':
        valueA = a.items.length;
        valueB = b.items.length;
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
  
  // Format time
  const formatTime = (dateString) => {
    return moment(dateString).format('HH:mm');
  };
  
  // Calculate time passed since order was placed
  const getTimePassed = (dateString) => {
    const orderTime = moment(dateString);
    const now = moment();
    const minutes = now.diff(orderTime, 'minutes');
    
    return minutes;
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
      <h1 className="page-title">Kitchen Orders</h1>
      
      <div className="card">
        <div className="table-filter">
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
              <option value="time">Time</option>
              <option value="table">Table</option>
              <option value="items">Number of Items</option>
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
        
        {sortedOrders.length > 0 ? (
          <div className="grid-cols-1" style={{ display: 'grid', gap: '1.5rem' }}>
            {sortedOrders.map((order) => {
              const timePassed = getTimePassed(order.createdAt);
              const isExpanded = expandedOrder === order._id;
              
              return (
                <div 
                  key={order._id} 
                  className="card"
                  style={{ 
                    marginBottom: 0,
                    borderLeft: `4px solid ${
                      timePassed > 30 ? 'var(--error-color)' : 
                      timePassed > 15 ? 'var(--warning-color)' : 'var(--success-color)'
                    }`
                  }}
                >
                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleExpandOrder(order._id)}
                  >
                    <div>
                      <h3>
                        Order #{order._id.substring(order._id.length - 6)} - 
                        Table {order.table?.tableNumber || 'N/A'}
                      </h3>
                      <div style={{ display: 'flex', gap: '1rem', color: '#616161' }}>
                        <div>Waiter: {order.waiter?.name || 'Unknown'}</div>
                        <div>Time: {formatTime(order.createdAt)} ({timePassed} min ago)</div>
                        <div>Items: {order.items.length}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div className={`badge badge-${
                        timePassed > 30 ? 'error' : 
                        timePassed > 15 ? 'warning' : 'success'
                      }`}>
                        {timePassed > 30 ? 'Urgent' : 
                         timePassed > 15 ? 'Attention' : 'New'}
                      </div>
                      <button 
                        className="btn btn-success"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAllReady(order._id);
                        }}
                        disabled={areAllItemsReady(order)}
                      >
                        <FaCheck style={{ marginRight: '8px' }} />
                        Mark All Ready
                      </button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <h4>Order Items</h4>
                      <div className="order-items">
                        {order.items.map((item) => (
                          <div key={item._id} className="order-item">
                            <div className="item-details">
                              <div className="item-name">{item.name}</div>
                              <div className="item-quantity">Quantity: {item.quantity}</div>
                              {item.notes && <div style={{ fontSize: '0.8rem', color: '#616161' }}>Note: {item.notes}</div>}
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
                            <div className="table-actions">
                              {item.status === 'ordered' && (
                                <button 
                                  className="btn btn-warning"
                                  onClick={() => handleUpdateItemStatus(order._id, item._id, 'preparing')}
                                >
                                  <FaHourglass style={{ marginRight: '5px' }} />
                                  Preparing
                                </button>
                              )}
                              
                              {item.status === 'preparing' && (
                                <button 
                                  className="btn btn-success"
                                  onClick={() => handleUpdateItemStatus(order._id, item._id, 'ready')}
                                >
                                  <FaCheck style={{ marginRight: '5px' }} />
                                  Ready
                                </button>
                              )}
                              
                              {item.status === 'ready' && (
                                <button 
                                  className="btn btn-secondary"
                                  disabled
                                >
                                  <FaUtensilSpoon style={{ marginRight: '5px' }} />
                                  Waiting to Serve
                                </button>
                              )}
                              
                              {item.status === 'served' && (
                                <button 
                                  className="btn btn-secondary"
                                  disabled
                                >
                                  Served
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>No active orders at the moment. Enjoy the quiet!</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default KitchenOrders;