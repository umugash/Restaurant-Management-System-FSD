import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import { getGroceries, createGrocery, updateGrocery, deleteGrocery, getLowStockGroceries } from '../../services/api';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaExclamationTriangle } from 'react-icons/fa';

const GroceryManagement = () => {
  const [groceries, setGroceries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentGrocery, setCurrentGrocery] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: 'kg',
    minQuantity: 5,
  });
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  
  // Fetch groceries
  useEffect(() => {
    const fetchGroceries = async () => {
      try {
        const data = showLowStock ? await getLowStockGroceries() : await getGroceries();
        setGroceries(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching groceries:', error);
        setLoading(false);
      }
    };
    
    fetchGroceries();
  }, [showLowStock]);
  
  // Handle form input change
  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };
  
  // Open modal for new grocery
  const handleAddGrocery = () => {
    setCurrentGrocery(null);
    setFormData({
      name: '',
      category: '',
      quantity: 0,
      unit: 'kg',
      minQuantity: 5,
    });
    setError('');
    setModalOpen(true);
  };
  
  // Open modal for editing grocery
  const handleEditGrocery = (grocery) => {
    setCurrentGrocery(grocery);
    setFormData({
      name: grocery.name,
      category: grocery.category,
      quantity: grocery.quantity,
      unit: grocery.unit,
      minQuantity: grocery.minQuantity,
    });
    setError('');
    setModalOpen(true);
  };
  
  // Handle quick update of quantity
  const handleQuickUpdate = async (grocery, newQuantity) => {
    try {
      const updatedGrocery = await updateGrocery(grocery._id, {
        ...grocery,
        quantity: newQuantity
      });
      
      if (updatedGrocery) {
        // Update groceries list
        setGroceries(groceries.map(item => 
          item._id === grocery._id ? updatedGrocery : item
        ));
      }
    } catch (error) {
      console.error('Error updating grocery quantity:', error);
    }
  };
  
  // Handle grocery form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      if (currentGrocery) {
        // Update existing grocery
        const updatedGrocery = await updateGrocery(currentGrocery._id, formData);
        
        if (updatedGrocery) {
          // Update groceries list
          setGroceries(groceries.map(grocery => 
            grocery._id === currentGrocery._id ? updatedGrocery : grocery
          ));
          
          setModalOpen(false);
        }
      } else {
        // Create new grocery
        const newGrocery = await createGrocery(formData);
        
        if (newGrocery) {
          // Add new grocery to the list
          setGroceries([...groceries, newGrocery]);
          
          setModalOpen(false);
        }
      }
    } catch (error) {
      setError('Failed to save grocery. Please try again.');
    }
  };
  
  // Handle grocery deletion
  const handleDeleteGrocery = async (groceryId) => {
    if (window.confirm('Are you sure you want to delete this grocery item?')) {
      try {
        const success = await deleteGrocery(groceryId);
        
        if (success) {
          // Remove grocery from the list
          setGroceries(groceries.filter(grocery => grocery._id !== groceryId));
        }
      } catch (error) {
        console.error('Error deleting grocery:', error);
      }
    }
  };
  
  // Filter groceries based on search term
  const filteredGroceries = searchTerm
    ? groceries.filter(grocery => 
        grocery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grocery.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : groceries;
  
  // Group groceries by category
  const groupedGroceries = filteredGroceries.reduce((acc, grocery) => {
    if (!acc[grocery.category]) {
      acc[grocery.category] = [];
    }
    acc[grocery.category].push(grocery);
    return acc;
  }, {});
  
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
      <div className="flex justify-between items-center">
        <h1 className="page-title">Inventory Management</h1>
        <button className="btn" onClick={handleAddGrocery}>
          <FaPlus style={{ marginRight: '8px' }} />
          Add Item
        </button>
      </div>
      
      <div className="card">
        <div className="table-filter">
          <div className="filter-group" style={{ flex: 1 }}>
            <div className="search-input" style={{ 
              display: 'flex', 
              alignItems: 'center',
              width: '100%',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              padding: '0 10px'
            }}>
              <FaSearch style={{ color: '#616161' }} />
              <input 
                type="text" 
                placeholder="Search inventory..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  border: 'none', 
                  padding: '10px',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>
          </div>
          
          <div className="filter-group">
            <button 
              className={`btn ${showLowStock ? 'btn-warning' : 'btn-secondary'}`}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              <FaExclamationTriangle style={{ marginRight: '8px' }} />
              {showLowStock ? 'Show All' : 'Show Low Stock'}
            </button>
          </div>
        </div>
        
        {Object.keys(groupedGroceries).length > 0 ? (
          Object.entries(groupedGroceries).map(([category, items]) => (
            <div key={category} style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                borderBottom: '2px solid var(--primary-light)', 
                paddingBottom: '0.5rem',
                marginBottom: '1rem'
              }}>
                {category}
              </h2>
              
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Quantity</th>
                      <th>Min. Quantity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((grocery) => (
                      <tr key={grocery._id}>
                        <td>{grocery.name}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button 
                              className="btn btn-error"
                              onClick={() => handleQuickUpdate(grocery, Math.max(0, grocery.quantity - 1))}
                              style={{ padding: '4px 8px' }}
                            >
                              -
                            </button>
                            <span>{grocery.quantity} {grocery.unit}</span>
                            <button 
                              className="btn btn-success"
                              onClick={() => handleQuickUpdate(grocery, grocery.quantity + 1)}
                              style={{ padding: '4px 8px' }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>{grocery.minQuantity} {grocery.unit}</td>
                        <td>
                          <span className={`badge badge-${
                            grocery.quantity <= 0 ? 'error' : 
                            grocery.quantity <= grocery.minQuantity ? 'warning' : 'success'
                          }`}>
                            {grocery.quantity <= 0 ? 'Out of Stock' : 
                             grocery.quantity <= grocery.minQuantity ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button 
                              className="btn btn-secondary"
                              onClick={() => handleEditGrocery(grocery)}
                              style={{ padding: '6px 10px' }}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="btn btn-error"
                              onClick={() => handleDeleteGrocery(grocery._id)}
                              style={{ padding: '6px 10px' }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>No items found</p>
          </div>
        )}
      </div>
      
      {/* Grocery Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentGrocery ? 'Edit Inventory Item' : 'Add New Inventory Item'}
      >
        <form onSubmit={handleSubmit}>
          {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">Item Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter item name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category" className="form-label">Category*</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Enter category (e.g., Vegetables, Meat, Dairy)"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="form-group" style={{ flex: 2 }}>
              <label htmlFor="quantity" className="form-label">Quantity*</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="unit" className="form-label">Unit*</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">l</option>
                <option value="ml">ml</option>
                <option value="pcs">pcs</option>
                <option value="box">box</option>
                <option value="bottle">bottle</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="minQuantity" className="form-label">Minimum Quantity*</label>
            <input
              type="number"
              id="minQuantity"
              name="minQuantity"
              value={formData.minQuantity}
              onChange={handleChange}
              min="0"
              step="0.1"
            />
            <div style={{ fontSize: '0.8rem', color: '#616161', marginTop: '5px' }}>
              System will mark as "Low Stock" when quantity falls below this value
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn">
              {currentGrocery ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default GroceryManagement;