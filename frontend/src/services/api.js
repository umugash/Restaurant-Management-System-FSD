import axios from 'axios';
import { toast } from 'react-toastify';

// Table API
export const getTables = async () => {
  try {
    const { data } = await axios.get('/api/tables');
    return data;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

export const getTableById = async (id) => {
  try {
    const { data } = await axios.get(`/api/tables/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const createTable = async (tableData) => {
  try {
    const { data } = await axios.post('/api/tables', tableData);
    toast.success('Table created successfully');
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const updateTable = async (id, tableData) => {
  try {
    const { data } = await axios.put(`/api/tables/${id}`, tableData);
    toast.success('Table updated successfully');
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const deleteTable = async (id) => {
  try {
    await axios.delete(`/api/tables/${id}`);
    toast.success('Table deleted successfully');
    return true;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

// User API
export const getUsers = async () => {
  try {
    const { data } = await axios.get('/api/users');
    return data;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

export const getUserById = async (id) => {
  try {
    const { data } = await axios.get(`/api/users/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const { data } = await axios.put(`/api/users/${id}`, userData);
    toast.success('User updated successfully');
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const deleteUser = async (id) => {
  try {
    await axios.delete(`/api/users/${id}`);
    toast.success('User deleted successfully');
    return true;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

// Reservation API
export const getReservations = async (date, status) => {
  try {
    let url = '/api/reservations';
    const params = new URLSearchParams();
    
    if (date) {
      params.append('date', date);
    }
    
    if (status) {
      params.append('status', status);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

export const getReservationById = async (id) => {
  try {
    const { data } = await axios.get(`/api/reservations/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const createReservation = async (reservationData) => {
  try {
    const { data } = await axios.post('/api/reservations', reservationData);
    toast.success('Reservation created successfully');
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const updateReservation = async (id, reservationData) => {
  try {
    const { data } = await axios.put(`/api/reservations/${id}`, reservationData);
    toast.success('Reservation updated successfully');
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const deleteReservation = async (id) => {
  try {
    await axios.delete(`/api/reservations/${id}`);
    toast.success('Reservation deleted successfully');
    return true;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

export const getAvailableTables = async (date, time, partySize) => {
  try {
    const params = new URLSearchParams({
      date,
      time,
      ...(partySize && { partySize }),
    });
    
    const { data } = await axios.get(`/api/reservations/available-tables?${params.toString()}`);
    return data;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

// Order API
export const getOrders = async () => {
  try {
    const { data } = await axios.get('/api/orders');
    return data;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

export const getKitchenOrders = async () => {
  try {
    const { data } = await axios.get('/api/orders/kitchen');
    return data;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

export const getOrderById = async (id) => {
  try {
    const { data } = await axios.get(`/api/orders/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const createOrder = async (orderData) => {
  try {
    const { data } = await axios.post('/api/orders', orderData);
    toast.success('Order created successfully');
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const updateOrder = async (id, orderData) => {
  try {
    const { data } = await axios.put(`/api/orders/${id}`, orderData);
    toast.success('Order updated successfully');
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const deleteOrder = async (id) => {
  try {
    await axios.delete(`/api/orders/${id}`);
    toast.success('Order deleted successfully');
    return true;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

// Grocery API
export const getGroceries = async () => {
  try {
    const { data } = await axios.get('/api/groceries');
    return data;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

export const getLowStockGroceries = async () => {
  try {
    const { data } = await axios.get('/api/groceries/low-stock');
    return data;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

export const getGroceryById = async (id) => {
  try {
    const { data } = await axios.get(`/api/groceries/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const createGrocery = async (groceryData) => {
  try {
    const { data } = await axios.post('/api/groceries', groceryData);
    toast.success('Grocery item created successfully');
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const updateGrocery = async (id, groceryData) => {
  try {
    const { data } = await axios.put(`/api/groceries/${id}`, groceryData);
    toast.success('Grocery item updated successfully');
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const deleteGrocery = async (id) => {
  try {
    await axios.delete(`/api/groceries/${id}`);
    toast.success('Grocery item deleted successfully');
    return true;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

// Error handling
const handleApiError = (error) => {
  const message = error.response && error.response.data.message 
    ? error.response.data.message 
    : 'Something went wrong. Please try again.';
  
  toast.error(message);
  console.error('API Error:', error);
};