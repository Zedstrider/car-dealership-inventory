import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

// Helper to decode JWT and check for admin status safely
const checkIsAdmin = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const payload = JSON.parse(window.atob(token.split('.')[1]));
    return payload.isAdmin === true;
  } catch (e) {
    return false;
  }
};

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Search Filters
  const [filters, setFilters] = useState({ make: '', model: '', category: '', minPrice: '', maxPrice: '' });

  // Admin Form State
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ make: '', model: '', category: '', price: '', quantity: '' });

  useEffect(() => {
    setIsAdmin(checkIsAdmin());
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data } = await axios.get('/vehicles');
      setVehicles(data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/auth');
      else setError('Failed to fetch inventory.');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get('/vehicles/search', { params: filters });
      setVehicles(data);
      setError('');
    } catch (err) {
      setError('Failed to apply filters.');
    }
  };

  const handleResetFilters = () => {
    setFilters({ make: '', model: '', category: '', minPrice: '', maxPrice: '' });
    fetchVehicles();
  };

  const handlePurchase = async (id) => {
    try {
      await axios.post(`/vehicles/${id}/purchase`);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error purchasing vehicle');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  // --- Admin Functions ---
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/vehicles/${editingId}`, formData);
        alert('Vehicle updated successfully!');
      } else {
        await axios.post('/vehicles', formData);
        alert('Vehicle added successfully!');
      }
      setFormData({ make: '', model: '', category: '', price: '', quantity: '' });
      setEditingId(null);
      setShowAdminForm(false);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving vehicle');
    }
  };

  const handleEditClick = (vehicle) => {
    setFormData({ make: vehicle.make, model: vehicle.model, category: vehicle.category, price: vehicle.price, quantity: vehicle.quantity });
    setEditingId(vehicle._id);
    setShowAdminForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await axios.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting vehicle');
    }
  };

  const handleRestock = async (id) => {
    const qty = window.prompt('Enter quantity to add:');
    if (!qty || isNaN(qty) || Number(qty) <= 0) return;
    try {
      await axios.post(`/vehicles/${id}/restock`, { quantity: Number(qty) });
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error restocking vehicle');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dealership Inventory</h1>
          <div className="space-x-4">
            {isAdmin && (
              <button onClick={() => {
                setShowAdminForm(!showAdminForm);
                setEditingId(null);
                setFormData({ make: '', model: '', category: '', price: '', quantity: '' });
              }} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                {showAdminForm ? 'Close Admin Panel' : 'Manage Inventory (Admin)'}
              </button>
            )}
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Logout
            </button>
          </div>
        </div>

        {/* Admin Add/Edit Form */}
        {isAdmin && showAdminForm && (
          <form onSubmit={handleAdminSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-green-500">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Update Vehicle' : 'Add New Vehicle'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <input type="text" placeholder="Make" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} className="p-2 border rounded" required />
              <input type="text" placeholder="Model" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="p-2 border rounded" required />
              <input type="text" placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="p-2 border rounded" required />
              <input type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="p-2 border rounded" required />
              <input type="number" placeholder="Quantity" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="p-2 border rounded" required />
            </div>
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
              {editingId ? 'Save Changes' : 'Add Vehicle'}
            </button>
          </form>
        )}

        {/* Search & Filter Section */}
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div><label className="block text-sm text-gray-600 mb-1">Make</label><input type="text" value={filters.make} onChange={e => setFilters({...filters, make: e.target.value})} className="w-full p-2 border rounded" placeholder="e.g. Tata" /></div>
          <div><label className="block text-sm text-gray-600 mb-1">Model</label><input type="text" value={filters.model} onChange={e => setFilters({...filters, model: e.target.value})} className="w-full p-2 border rounded" placeholder="e.g. Nexon" /></div>
          <div><label className="block text-sm text-gray-600 mb-1">Category</label><input type="text" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} className="w-full p-2 border rounded" placeholder="SUV, Sedan..." /></div>
          <div><label className="block text-sm text-gray-600 mb-1">Min Price</label><input type="number" value={filters.minPrice} onChange={e => setFilters({...filters, minPrice: e.target.value})} className="w-full p-2 border rounded" /></div>
          <div><label className="block text-sm text-gray-600 mb-1">Max Price</label><input type="number" value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: e.target.value})} className="w-full p-2 border rounded" /></div>
          <div className="flex space-x-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Filter</button>
            <button type="button" onClick={handleResetFilters} className="flex-1 bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300">Reset</button>
          </div>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">{vehicle.make} {vehicle.model}</h2>
                <div className="text-gray-600 mb-4 space-y-1">
                  <p><span className="font-semibold">Category:</span> {vehicle.category}</p>
                  <p><span className="font-semibold">Price:</span> ₹{vehicle.price.toLocaleString()}</p>
                  <p><span className="font-semibold">In Stock: </span> 
                    <span className={vehicle.quantity > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{vehicle.quantity}</span>
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handlePurchase(vehicle._id)}
                  disabled={vehicle.quantity === 0}
                  className={`w-full py-2 rounded font-semibold transition-colors ${
                    vehicle.quantity > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {vehicle.quantity > 0 ? 'Purchase' : 'Out of Stock'}
                </button>
                
                {/* Admin Action Buttons */}
                {isAdmin && (
                  <div className="flex space-x-2 pt-2 border-t mt-2">
                    <button onClick={() => handleEditClick(vehicle)} className="flex-1 bg-yellow-500 text-white py-1 rounded text-sm hover:bg-yellow-600">Edit</button>
                    <button onClick={() => handleRestock(vehicle._id)} className="flex-1 bg-green-500 text-white py-1 rounded text-sm hover:bg-green-600">Restock</button>
                    <button onClick={() => handleDelete(vehicle._id)} className="flex-1 bg-red-500 text-white py-1 rounded text-sm hover:bg-red-600">Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {vehicles.length === 0 && !error && <p className="text-gray-500 col-span-full text-center py-8">No vehicles found.</p>}
        </div>
      </div>
    </div>
  );
}