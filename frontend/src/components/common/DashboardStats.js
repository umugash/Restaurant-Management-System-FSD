import React from 'react';
import { FaCalendarAlt, FaUsers, FaClipboardList, FaBoxOpen } from 'react-icons/fa';

const DashboardStats = ({ stats }) => {
  return (
    <div className="dashboard-stats">
      <div className="stat-card reservations">
        <FaCalendarAlt size={30} color="#8b0000" />
        <h3 className="stat-number">{stats.reservations || 0}</h3>
        <p className="stat-label">Reservations</p>
      </div>
      
      <div className="stat-card tables">
        <FaUsers size={30} color="#4caf50" />
        <h3 className="stat-number">{stats.tables || 0}</h3>
        <p className="stat-label">Tables</p>
      </div>
      
      <div className="stat-card orders">
        <FaClipboardList size={30} color="#ff9800" />
        <h3 className="stat-number">{stats.orders || 0}</h3>
        <p className="stat-label">Active Orders</p>
      </div>
      
      <div className="stat-card inventory">
        <FaBoxOpen size={30} color="#f44336" />
        <h3 className="stat-number">{stats.lowStock || 0}</h3>
        <p className="stat-label">Low Stock Items</p>
      </div>
    </div>
  );
};

export default DashboardStats;