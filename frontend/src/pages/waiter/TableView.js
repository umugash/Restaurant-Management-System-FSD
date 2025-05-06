import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { getTables } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaUsers, FaClipboardList } from 'react-icons/fa';

const TableView = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
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
  
  // Navigate to create order page for a specific table
  const handleTableClick = (table) => {
    navigate(`/waiter/orders/${table._id}`);
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
      <h1 className="page-title">Table View</h1>
      
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>Restaurant Floor Plan</h2>
        
        <div className="table-layout">
          {tables.map((table) => (
            <div 
              key={table._id} 
              className={`restaurant-table ${table.status}`}
              onClick={() => handleTableClick(table)}
              style={{ cursor: 'pointer' }}
            >
              <div className="table-number">Table {table.tableNumber}</div>
              <div className="table-capacity">
                <FaUsers style={{ marginRight: '5px' }} />
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
              {table.currentOrder && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.8rem'
                }}>
                  <FaClipboardList />
                  <span>Has active order</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Table Status Legend</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--border-radius)',
          }}>
            <span className="badge badge-success">available</span>
            <span>Table is ready for customers</span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--border-radius)',
          }}>
            <span className="badge badge-warning">reserved</span>
            <span>Table is reserved for later</span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--border-radius)',
          }}>
            <span className="badge badge-error">occupied</span>
            <span>Table has customers and may have an active order</span>
          </div>
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
          <h2>Table List</h2>
        </div>
        
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
              {tables.map((table) => (
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
                    <button 
                      className="btn"
                      onClick={() => handleTableClick(table)}
                    >
                      <FaClipboardList style={{ marginRight: '8px' }} />
                      {table.currentOrder ? 'View Order' : 'Create Order'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default TableView;