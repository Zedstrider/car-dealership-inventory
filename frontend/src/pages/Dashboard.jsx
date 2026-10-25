import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data } = await axios.get('/vehicles');
      setVehicles(data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/auth');
      } else {
        setError('Failed to fetch inventory.');
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      // Axios automatically serializes the params object into a query string
      const { data } = await axios.get('/vehicles/search', { params: filters });
      setVehicles(data);
      setError('');
    } catch (err) {
      setError('Failed to apply filters.');
    }
  };

  const handleReset = () => {
    setFilters({ make: '', model: '', category: '', minPrice: '', maxPrice: '' });
    fetchVehicles();
  };

  const handlePurchase = async (id) => {
    try {
      await axios.post(`/vehicles/${id}/purchase`);
      // Re-run the current search/fetch to get updated quantities
      filters.make || filters.model || filters.category || filters.minPrice || filters.maxPrice 
        ? handleSearch(new Event('submit')) 
        : fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error purchasing vehicle');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dealership Inventory</h1>
          <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Search & Filter Section */}
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Make</label>
            <input 
              type="text" 
              value={filters.make} 
              onChange={(e) => setFilters({...filters, make: e.target.value})} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="e.g. Tata" 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Model</label>
            <input 
              type="text" 
              value={filters.model} 
              onChange={(e) => setFilters({...filters, model: e.target.value})} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="e.g. Nexon" 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Category</label>
            <input 
              type="text" 
              value={filters.category} 
              onChange={(e) => setFilters({...filters, category: e.target.value})} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="SUV, Sedan..." 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Min Price (₹)</label>
            <input 
              type="number" 
              value={filters.minPrice} 
              onChange={(e) => setFilters({...filters, minPrice: e.target.value})} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="0" 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Max Price (₹)</label>
            <input 
              type="number" 
              value={filters.maxPrice} 
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors">
              Filter
            </button>
            <button type="button" onClick={handleReset} className="flex-1 bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300 transition-colors">
              Reset
            </button>
          </div>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
              <h2 className="text-xl font-bold mb-2">{vehicle.make} {vehicle.model}</h2>
              <div className="text-gray-600 mb-4 space-y-1">
                <p><span className="font-semibold">Category:</span> {vehicle.category}</p>
                <p><span className="font-semibold">Price:</span> ₹{vehicle.price.toLocaleString()}</p>
                <p>
                  <span className="font-semibold">In Stock: </span> 
                  <span className={vehicle.quantity > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {vehicle.quantity}
                  </span>
                </p>
              </div>
              <button
                onClick={() => handlePurchase(vehicle._id)}
                disabled={vehicle.quantity === 0}
                className={`w-full py-2 rounded font-semibold transition-colors ${
                  vehicle.quantity > 0 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {vehicle.quantity > 0 ? 'Purchase' : 'Out of Stock'}
              </button>
            </div>
          ))}
          
          {vehicles.length === 0 && !error && (
            <p className="text-gray-500 col-span-full text-center py-8">No vehicles found matching your criteria.</p>
          )}
        </div>
      </div>
    </div>
  );
}