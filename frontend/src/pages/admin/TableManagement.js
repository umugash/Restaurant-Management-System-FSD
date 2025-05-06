import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import { getTables, createTable, updateTable, deleteTable } from '../../services/api';
import { FaEdit, FaTrash, FaPlusCircle, FaChair } from 'react-icons/fa';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 4,
  });
  const [error, setError] = useState('');
  
  // Fetch tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await getTables();
        setTables(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tables:', error);
        setLoading(false);
      }
    };
    
    fetchTables();
  }, []);
  
  // Handle form input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  // Open modal for new table
  const handleAddTable = () => {
    setCurrentTable(null);
    setFormData({
      tableNumber: '',
      capacity: 4,
    });
    setError('');
    setModalOpen(true);
  };
  
  // Open modal for editing table
  const handleEditTable = (table) => {
    setCurrentTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
    });
    setError('');
    setModalOpen(true);
  };
  
  // Handle table form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.tableNumber || !formData.capacity) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      if (currentTable) {
        // Update existing table
        const updatedTable = await updateTable(currentTable._id, formData);
        
        if (updatedTable) {
          // Update tables list
          setTables(tables.map(table => 
            table._id === currentTable._id ? updatedTable : table
          ));
          
          setModalOpen(false);
        }
      } else {
        // Create new table
        const newTable = await createTable(formData);
        
        if (newTable) {
          // Add new table to the list
          setTables([...tables, newTable]);
          
          setModalOpen(false);
        }
      }
    } catch (error) {
      setError('Failed to save table. Please try again.');
    }
  };
  
  // Handle table deletion
  const handleDeleteTable = async (tableId) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        const success = await deleteTable(tableId);
        
        if (success) {
          // Remove table from the list
          setTables(tables.filter(table => table._id !== tableId));
        }
      } catch (error) {
        console.error('Error deleting table:', error);
      }
    }
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
      <div className="flex justify-between items-center">
        <h1 className="page-title">Table Management</h1>
        <button className="btn" onClick={handleAddTable}>
          <FaPlusCircle style={{ marginRight: '8px' }} />
          Add Table
        </button>
      </div>
      
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>Restaurant Layout</h2>
        
        <div className="table-layout">
          {tables.map((table) => (
            <div 
              key={table._id} 
              className={`restaurant-table ${table.status}`}
              onClick={() => handleEditTable(table)}
            >
              <div className="table-number">Table {table.tableNumber}</div>
              <div className="table-capacity">
                <FaChair />
                <span>Capacity: {table.capacity}</span>
              </div>
              <div className="table-status">
                <span className={`badge badge-${
                  table.status === 'available' ? 'success' : 
                  table.status === 'reserved' ? 'warning' : 'error'
                }`}>
                  {table.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <h2 style={{ margin: '2rem 0 1rem' }}>Table List</h2>
        
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Table Number</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tables.length > 0 ? (
                tables.map((table) => (
                  <tr key={table._id}>
                    <td>Table {table.tableNumber}</td>
                    <td>{table.capacity}</td>
                    <td>
                      <span className={`badge badge-${
                        table.status === 'available' ? 'success' : 
                        table.status === 'reserved' ? 'warning' : 'error'
                      }`}>
                        {table.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleEditTable(table)}
                          style={{ padding: '6px 10px' }}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn btn-error"
                          onClick={() => handleDeleteTable(table._id)}
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
                  <td colSpan="4" style={{ textAlign: 'center' }}>No tables found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Table Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentTable ? 'Edit Table' : 'Add New Table'}
      >
        <form onSubmit={handleSubmit}>
          {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}
          }
          
          <div className="form-group">
            <label htmlFor="tableNumber" className="form-label">Table Number</label>
            <input
              type="number"
              id="tableNumber"
              name="tableNumber"
              value={formData.tableNumber}
              onChange={handleChange}
              placeholder="Enter table number"
              min="1"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="capacity" className="form-label">Capacity</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Enter capacity"
              min="1"
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn">
              {currentTable ? 'Update Table' : 'Add Table'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default TableManagement;