import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function BookingForm({ parking, onClose, onBooked }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    bookingDate: '',
    startTime: '09:00',
    endTime: '11:00',
    durationHours: 2,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const estimatedPrice = useMemo(() => {
    if (!parking || !formData.durationHours) return 0;
    return Number((parking.pricePerHour * Number(formData.durationHours)).toFixed(2));
  }, [parking, formData.durationHours]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('Please log in to reserve parking.');
      return;
    }

    if (!parking) {
      setError('Please select a parking location first.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/bookings', {
        parkingId: parking._id,
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        durationHours: Number(formData.durationHours),
      });

      setSuccess(`Booking confirmed: ${response.data.data.bookingId}`);
      onBooked?.(response.data.data);
      if (onClose) {
        setTimeout(onClose, 1200);
      }
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!parking) return null;

  return (
    <div className="booking-card">
      <div className="booking-header">
        <h3>{parking.name}</h3>
        <button className="close-btn" onClick={onClose} type="button">
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="field-grid">
          <label>
            Booking date
            <input
              type="date"
              value={formData.bookingDate}
              onChange={(event) => setFormData({ ...formData, bookingDate: event.target.value })}
              required
            />
          </label>

          <label>
            Start time
            <input
              type="time"
              value={formData.startTime}
              onChange={(event) => setFormData({ ...formData, startTime: event.target.value })}
              required
            />
          </label>

          <label>
            End time
            <input
              type="time"
              value={formData.endTime}
              onChange={(event) => setFormData({ ...formData, endTime: event.target.value })}
              required
            />
          </label>

          <label>
            Duration (hours)
            <input
              type="number"
              min="1"
              max="12"
              step="0.5"
              value={formData.durationHours}
              onChange={(event) => setFormData({ ...formData, durationHours: event.target.value })}
              required
            />
          </label>
        </div>

        <div className="booking-summary">
          <span>Rate: ₹{parking.pricePerHour}/hr</span>
          <strong>Estimated total: ₹{estimatedPrice}</strong>
        </div>

        {error && <p className="form-message error">{error}</p>}
        {success && <p className="form-message success">{success}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Confirming...' : 'Book parking'}
        </button>
      </form>
    </div>
  );
}
