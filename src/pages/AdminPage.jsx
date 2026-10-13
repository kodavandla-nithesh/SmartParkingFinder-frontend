import { useEffect, useState } from 'react';
import api from '../services/api';

const initialForm = {
  name: '',
  address: '',
  city: 'Hyderabad',
  area: '',
  latitude: '',
  longitude: '',
  totalSlots: '',
  pricePerHour: '',
  parkingType: 'Open',
  vehicleType: 'Car',
  description: '',
};

export default function AdminPage() {
  const [dashboard, setDashboard] = useState({ summary: {}, bookings: [], parking: [] });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const response = await api.get('/admin/dashboard');
      setDashboard(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      totalSlots: Number(formData.totalSlots),
      pricePerHour: Number(formData.pricePerHour),
    };

    if (editingId) {
      await api.put(`/admin/parking/${editingId}`, payload);
    } else {
      await api.post('/admin/parking', payload);
    }

    setFormData(initialForm);
    setEditingId(null);
    loadDashboard();
  };

  const handleEdit = (parking) => {
    setEditingId(parking._id);
    setFormData({
      name: parking.name,
      address: parking.address,
      city: parking.city,
      area: parking.area,
      latitude: String(parking.latitude),
      longitude: String(parking.longitude),
      totalSlots: String(parking.totalSlots),
      pricePerHour: String(parking.pricePerHour),
      parkingType: parking.parkingType,
      vehicleType: parking.vehicleType || 'Car',
      description: parking.description || '',
    });
  };

  const handleDelete = async (id) => {
    await api.delete(`/admin/parking/${id}`);
    loadDashboard();
  };

  return (
    <div className="admin-page">
      <div className="container admin-layout">
        <section className="admin-overview">
          <h1>Admin Dashboard</h1>

          {loading ? (
            <div className="loading-box">Loading dashboard...</div>
          ) : (
            <div className="stats-grid admin-stats">
              <div className="stats-card">
                <strong>{dashboard.summary.parkingLocations || 0}</strong>
                <span>Locations</span>
              </div>
              <div className="stats-card">
                <strong>{dashboard.summary.totalSlots || 0}</strong>
                <span>Total slots</span>
              </div>
              <div className="stats-card">
                <strong>{dashboard.summary.bookings || 0}</strong>
                <span>Bookings</span>
              </div>
              <div className="stats-card">
                <strong>{dashboard.summary.users || 0}</strong>
                <span>Users</span>
              </div>
            </div>
          )}
        </section>

        <section className="admin-form-card">
          <h2>{editingId ? 'Edit parking lot' : 'Add parking lot'}</h2>

          <form onSubmit={handleSubmit} className="admin-form">
            <input value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Parking name" required />
            <input value={formData.address} onChange={(event) => setFormData({ ...formData, address: event.target.value })} placeholder="Address" required />
            <div className="inline-fields">
              <input value={formData.city} onChange={(event) => setFormData({ ...formData, city: event.target.value })} placeholder="City" required />
              <input value={formData.area} onChange={(event) => setFormData({ ...formData, area: event.target.value })} placeholder="Area" required />
            </div>
            <div className="inline-fields">
              <input type="number" step="0.0001" value={formData.latitude} onChange={(event) => setFormData({ ...formData, latitude: event.target.value })} placeholder="Latitude" required />
              <input type="number" step="0.0001" value={formData.longitude} onChange={(event) => setFormData({ ...formData, longitude: event.target.value })} placeholder="Longitude" required />
            </div>
            <div className="inline-fields">
              <input type="number" value={formData.totalSlots} onChange={(event) => setFormData({ ...formData, totalSlots: event.target.value })} placeholder="Total slots" required />
              <input type="number" value={formData.pricePerHour} onChange={(event) => setFormData({ ...formData, pricePerHour: event.target.value })} placeholder="Price / hour" required />
            </div>
            <select value={formData.parkingType} onChange={(event) => setFormData({ ...formData, parkingType: event.target.value })}>
              <option value="Open">Open</option>
              <option value="Covered">Covered</option>
              <option value="EV">EV</option>
              <option value="Valet">Valet</option>
            </select>
            <select value={formData.vehicleType} onChange={(event) => setFormData({ ...formData, vehicleType: event.target.value })}>
              <option value="Car">Car</option>
              <option value="Bike">Bike</option>
              <option value="Truck">Truck</option>
              <option value="EV">EV</option>
            </select>
            <textarea value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} placeholder="Description" rows="3" />

            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update lot' : 'Add lot'}
            </button>
          </form>
        </section>

        <section className="admin-list-card">
          <h2>Parking locations</h2>
          <div className="admin-list">
            {dashboard.parking.map((parking) => (
              <div key={parking._id} className="admin-row">
                <div>
                  <strong>{parking.name}</strong>
                  <p>{parking.area} · {parking.parkingType} · {parking.vehicleType || 'Car'}</p>
                </div>
                <div className="row-actions">
                  <button className="btn btn-secondary btn-small" onClick={() => handleEdit(parking)}>
                    Edit
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(parking._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
