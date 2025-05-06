import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import { getUsers, updateUser, deleteUser } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FaEdit, FaTrash, FaUserPlus, FaSearch } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'waiter',
  });
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { registerUser } = useAuth();
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Handle form input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  // Open modal for new user
  const handleAddUser = () => {
    setCurrentUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'waiter',
    });
    setError('');
    setModalOpen(true);
  };
  
  // Open modal for editing user
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't populate password for editing
      role: user.role,
    });
    setError('');
    setModalOpen(true);
  };
  
  // Handle user form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || (!currentUser && !formData.password) || !formData.role) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      if (currentUser) {
        // Update existing user
        const userData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        
        // Only include password if provided
        if (formData.password) {
          userData.password = formData.password;
        }
        
        const updatedUser = await updateUser(currentUser._id, userData);
        
        if (updatedUser) {
          // Update users list
          setUsers(users.map(user => 
            user._id === currentUser._id ? { ...user, ...updatedUser } : user
          ));
          
          setModalOpen(false);
        }
      } else {
        // Register new user
        const success = await registerUser(formData);
        
        if (success) {
          // Refresh users list
          const data = await getUsers();
          setUsers(data);
          
          setModalOpen(false);
        }
      }
    } catch (error) {
      setError('Failed to save user. Please try again.');
    }
  };
  
  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const success = await deleteUser(userId);
        
        if (success) {
          // Remove user from the list
          setUsers(users.filter(user => user._id !== userId));
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };
  
  // Filter users based on search term
  const filteredUsers = searchTerm
    ? users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;
  
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
        <h1 className="page-title">User Management</h1>
        <button className="btn" onClick={handleAddUser}>
          <FaUserPlus style={{ marginRight: '8px' }} />
          Add User
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
                placeholder="Search users..." 
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
        </div>
        
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge badge-${
                        user.role === 'admin' ? 'error' : 
                        user.role === 'receptionist' ? 'info' :
                        user.role === 'chef' ? 'warning' : 'success'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleEditUser(user)}
                          style={{ padding: '6px 10px' }}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn btn-error"
                          onClick={() => handleDeleteUser(user._id)}
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
                  <td colSpan="4" style={{ textAlign: 'center' }}>No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit}>
          {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password {currentUser && <span style={{ fontSize: '0.8rem', color: '#616161' }}>(Leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={currentUser ? "Enter new password (optional)" : "Enter password"}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role" className="form-label">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="admin">Admin</option>
              <option value="receptionist">Receptionist</option>
              <option value="waiter">Waiter</option>
              <option value="chef">Chef</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn">
              {currentUser ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default UserManagement;