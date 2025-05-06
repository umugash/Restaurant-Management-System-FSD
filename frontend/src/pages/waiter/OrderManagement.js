import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import { getOrders, createOrder, updateOrder, deleteOrder, getTables, getTableById } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlus, FaMinus, FaTrash, FaEdit, FaSave, FaUtensils, FaFilter } from 'react-icons/fa';

const OrderManagement = () => {
  const { user } = useAuth();
  const { tableId } = useParams();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [currentTable, setCurrentTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    quantity: 1,
    notes: ''
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [existingOrder, setExistingOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('active');
  const [error, setError] = useState('');
  
  // Menu items (would typically come from a database)
  const menuItems = [
    { name: 'Margherita Pizza', price: 12.99 },
    { name: 'Pepperoni Pizza', price: 14.99 },
    { name: 'Chicken Alfredo', price: 16.99 },
    { name: 'Caesar Salad', price: 9.99 },
    { name: 'Spaghetti Bolognese', price: 15.99 },
    { name: 'Grilled Salmon', price: 19.99 },
    { name: 'Cheeseburger', price: 13.99 },
    { name: 'French Fries', price: 4.99 },
    { name: 'Chocolate Cake', price: 7.99 },
    { name: 'Tiramisu', price: 8.99 },
    { name: 'Soft Drink', price: 2.99 },
    { name: 'Iced Tea', price: 2.99 },
  ];
  
  // Fetch orders and tables
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, tablesData] = await Promise.all([
          getOrders(),
          getTables()
        ]);
        
        // Filter orders by status if needed
        const filteredOrders = statusFilter 
          ? ordersData.filter(order => order.status === statusFilter) 
          : ordersData;
        
        setOrders(filteredOrders);
        setTables(tablesData);
        
        // If tableId is provided, fetch that specific table
        if (tableId) {
          const tableData = await getTableById(tableId);
          setCurrentTable(tableData);
          
          // Check if this table has an active order
          if (tableData.currentOrder) {
            const order = ordersData.find(o => o._id === tableData.currentOrder);
            if (order) {
              setExistingOrder(order);
              setOrderItems(order.items);
              setTotalAmount(order.totalAmount);
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tableId, statusFilter]);
  
  // Update total when items change
  useEffect(() => {
    const newTotal = orderItems.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);
    
    setTotalAmount(newTotal);
  }, [orderItems]);
  
  // Handle menu item selection
  const handleMenuItemSelect = (menuItem) => {
    // Check if item already exists in the order
    const existingItemIndex = orderItems.findIndex(item => item.name === menuItem.name);
    
    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += 1;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      setOrderItems([
        ...orderItems,
        {
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          status: 'ordered',
          notes: ''
        }
      ]);
    }
  };
  
  // Handle custom item form input change
  const handleNewItemChange = (e) => {
    setNewItem({
      ...newItem,
      [e.target.name]: e.target.value
    });
  };
  
  // Add custom item to order
  const handleAddCustomItem = (e) => {
    e.preventDefault();
    
    if (!newItem.name || !newItem.price) {
      setError('Please enter item name and price');
      return;
    }
    
    setOrderItems([
      ...orderItems,
      {
        name: newItem.name,
        price: parseFloat(newItem.price),
        quantity: parseInt(newItem.quantity),
        status: 'ordered',
        notes: newItem.notes
      }
    ]);
    
    // Reset form
    setNewItem({
      name: '',
      price: '',
      quantity: 1,
      notes: ''
    });
    
    setError('');
  };
  
  // Handle item quantity change
  const handleQuantityChange = (index, change) => {
    const updatedItems = [...orderItems];
    const newQuantity = updatedItems[index].quantity + change;
    
    if (newQuantity <= 0) {
      // Remove item if quantity becomes 0
      updatedItems.splice(index, 1);
    } else {
      updatedItems[index].quantity = newQuantity;
    }
    
    setOrderItems(updatedItems);
  };
  
  // Remove item from order
  const handleRemoveItem = (index) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };
  
  // Handle item notes change
  const handleItemNotesChange = (index, notes) => {
    const updatedItems = [...orderItems];
    updatedItems[index].notes = notes;
    setOrderItems(updatedItems);
  };
  
  // Save order
  const handleSaveOrder = async () => {
    if (!currentTable) {
      setError('Please select a table first');
      return;
    }
    
    if (orderItems.length === 0) {
      setError('Please add at least one item to the order');
      return;
    }
    
    try {
      if (existingOrder) {
        // Update existing order
        const updatedOrder = await updateOrder(existingOrder._id, {
          items: orderItems,
          totalAmount
        });
        
        if (updatedOrder) {
          // Refresh orders
          const ordersData = await getOrders();
          setOrders(ordersData);
          
          navigate('/waiter/orders');
        }
      } else {
        // Create new order
        const newOrder = await createOrder({
          table: currentTable._id,
          items: orderItems,
          totalAmount
        });
        
        if (newOrder) {
          // Refresh orders
          const ordersData = await getOrders();
          setOrders(ordersData);
          
          navigate('/waiter/orders');
        }
      }
    } catch (error) {
      console.error('Error saving order:', error);
      setError('Failed to save order. Please try again.');
    }
  };
  
  // Handle table selection change
  const handleTableChange = async (e) => {
    const selectedTableId = e.target.value;
    
    if (selectedTableId) {
      try {
        const tableData = await getTableById(selectedTableId);
        setCurrentTable(tableData);
        
        // Check if this table has an active order
        if (tableData.currentOrder) {
          const order = orders.find(o => o._id === tableData.currentOrder);
          if (order) {
            setExistingOrder(order);
            setOrderItems(order.items);
            setTotalAmount(order.totalAmount);
          }
        } else {
          // Reset order if changing to a table without an order
          setExistingOrder(null);
          setOrderItems([]);
          setTotalAmount(0);
        }
      } catch (error) {
        console.error('Error fetching table:', error);
      }
    } else {
      setCurrentTable(null);
      setExistingOrder(null);
      setOrderItems([]);
      setTotalAmount(0);
    }
  };
  
  // Complete order
  const handleCompleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to mark this order as completed?')) {
      try {
        const updatedOrder = await updateOrder(orderId, {
          status: 'completed',
          paymentStatus: 'paid'
        });
        
        if (updatedOrder) {
          // Refresh orders
          const ordersData = await getOrders();
          
          // Filter orders by status if needed
          const filteredOrders = statusFilter 
            ? ordersData.filter(order => order.status === statusFilter) 
            : ordersData;
          
          setOrders(filteredOrders);
        }
      } catch (error) {
        console.error('Error completing order:', error);
      }
    }
  };
  
  // Cancel order
  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const success = await deleteOrder(orderId);
        
        if (success) {
          // Refresh orders
          const ordersData = await getOrders();
          
          // Filter orders by status if needed
          const filteredOrders = statusFilter 
            ? ordersData.filter(order => order.status === statusFilter) 
            : ordersData;
          
          setOrders(filteredOrders);
        }
      } catch (error) {
        console.error('Error canceling order:', error);
      }
    }
  };
  
  // View/edit order
  const handleViewOrder = (order) => {
    navigate(`/waiter/orders/${order.table._id}`);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
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
  
  // If we're in table order view
  if (tableId) {
    return (
      <Layout>
        <div className="flex justify-between items-center">
          <h1 className="page-title">
            {existingOrder ? 'Edit Order' : 'New Order'} - {currentTable ? `Table ${currentTable.tableNumber}` : ''}
          </h1>
          <button className="btn" onClick={() => navigate('/waiter/orders')}>
            Back to Orders
          </button>
        </div>
        
        <div className="grid-cols-2" style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Order Items */}
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Order Items</h2>
            
            {error && (
              <div style={{ 
                backgroundColor: 'rgba(244, 67, 54, 0.1)', 
                color: 'var(--error-color)',
                padding: '10px',
                borderRadius: 'var(--border-radius)',
                marginBottom: '1rem'
              }}>
                {error}
              </div>
            )}
            
            {orderItems.length > 0 ? (
              <div className="order-items">
                {orderItems.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      <div className="item-price">{formatCurrency(item.price)}</div>
                      {item.notes && <div style={{ fontSize: '0.8rem', color: '#616161' }}>Note: {item.notes}</div>}
                      }
                    </div>
                    <div className="item-quantity">
                      <button 
                        className="btn btn-secondary quantity-btn"
                        onClick={() => handleQuantityChange(index, -1)}
                      >
                        <FaMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        className="btn quantity-btn"
                        onClick={() => handleQuantityChange(index, 1)}
                      >
                        <FaPlus />
                      </button>
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
                    <div className="flex flex-col gap-2">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          const notes = prompt('Enter notes for this item:', item.notes);
                          if (notes !== null) {
                            handleItemNotesChange(index, notes);
                          }
                        }}
                        style={{ padding: '5px 10px' }}
                      >
                        <FaEdit size={14} />
                      </button>
                      <button 
                        className="btn btn-error"
                        onClick={() => handleRemoveItem(index)}
                        style={{ padding: '5px 10px' }}
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                    <div>{formatCurrency(item.price * item.quantity)}</div>
                  </div>
                ))}
                <div className="order-total">
                  <span>Total</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#616161' }}>
                No items added to the order yet. Select items from the menu or add a custom item.
              </div>
            )}
            
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn"
                onClick={handleSaveOrder}
                disabled={orderItems.length === 0}
              >
                <FaSave style={{ marginRight: '8px' }} />
                {existingOrder ? 'Update Order' : 'Place Order'}
              </button>
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Menu Items</h2>
            
            <div className="grid-cols-2" style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              {menuItems.map((item, index) => (
                <div 
                  key={index} 
                  className="card" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleMenuItemSelect(item)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{item.name}</div>
                      <div style={{ color: '#616161' }}>{formatCurrency(item.price)}</div>
                    </div>
                    <button className="btn" style={{ padding: '5px 10px' }}>
                      <FaPlus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <h3 style={{ marginBottom: '1rem' }}>Add Custom Item</h3>
            <form onSubmit={handleAddCustomItem}>
              <div className="grid-cols-2" style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Item Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newItem.name}
                    onChange={handleNewItemChange}
                    placeholder="Enter item name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="price" className="form-label">Price</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={newItem.price}
                    onChange={handleNewItemChange}
                    placeholder="Enter price"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid-cols-2" style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="quantity" className="form-label">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={newItem.quantity}
                    onChange={handleNewItemChange}
                    min="1"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes" className="form-label">Notes</label>
                  <input
                    type="text"
                    id="notes"
                    name="notes"
                    value={newItem.notes}
                    onChange={handleNewItemChange}
                    placeholder="E.g., No onions"
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn">
                  <FaPlus style={{ marginRight: '8px' }} />
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Orders list view
  return (
    <Layout>
      <div className="flex justify-between items-center">
        <h1 className="page-title">Order Management</h1>
        <button className="btn" onClick={() => navigate('/waiter/tables')}>
          <FaUtensils style={{ marginRight: '8px' }} />
          View Tables
        </button>
      </div>
      
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
            <div className="filter-label">Table:</div>
            <select
              value={currentTable ? currentTable._id : ''}
              onChange={handleTableChange}
              style={{ width: 'auto' }}
            >
              <option value="">Select a table</option>
              {tables.map((table) => (
                <option key={table._id} value={table._id}>
                  Table {table.tableNumber} ({table.status})
                </option>
              ))}
            </select>
          </div>
          
          {currentTable && (
            <button 
              className="btn"
              onClick={() => navigate(`/waiter/orders/${currentTable._id}`)}
            >
              {currentTable.currentOrder ? 'Edit Order' : 'Create Order'}
            </button>
          )}
        </div>
        
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Table</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders
                  .filter(order => order.waiter && order.waiter._id === user._id)
                  .map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id.substring(order._id.length - 6)}</td>
                      <td>Table {order.table ? order.table.tableNumber : 'N/A'}</td>
                      <td>{order.items.length} items</td>
                      <td>{formatCurrency(order.totalAmount)}</td>
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
                            <FaEdit />
                          </button>
                          {order.status === 'active' && (
                            <>
                              <button 
                                className="btn btn-success"
                                onClick={() => handleCompleteOrder(order._id)}
                                style={{ padding: '6px 10px' }}
                              >
                                <FaCheckCircle />
                              </button>
                              <button 
                                className="btn btn-error"
                                onClick={() => handleCancelOrder(order._id)}
                                style={{ padding: '6px 10px' }}
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default OrderManagement;