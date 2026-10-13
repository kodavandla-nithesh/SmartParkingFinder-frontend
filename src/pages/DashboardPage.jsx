import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);

    try {
      const response = await api.get('/bookings/my');
      setBookings(response.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const upcomingBookings = useMemo(
    () => bookings.filter((booking) => booking.status !== 'cancelled' && new Date(booking.bookingDate) >= new Date()),
    [bookings]
  );

  const previousBookings = useMemo(
    () => bookings.filter((booking) => booking.status !== 'cancelled' && new Date(booking.bookingDate) < new Date()),
    [bookings]
  );

  const userStats = useMemo(() => {
    const totalSpend = bookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
    const activeBookings = bookings.filter((booking) => booking.status !== 'cancelled').length;
    const favouriteArea = bookings.reduce((acc, booking) => {
      const area = booking.parking?.area || 'Unknown';
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {});
    const topArea = Object.entries(favouriteArea).sort((a, b) => b[1] - a[1])[0];

    return {
      totalSpend,
      activeBookings,
      topArea: topArea ? topArea[0] : 'N/A',
    };
  }, [bookings]);

  const handleCancel = async (bookingId) => {
    await api.patch(`/bookings/${bookingId}/cancel`);
    await loadBookings();
  };

  return (
    <div className="dashboard-page">
      <div className="container dashboard-grid">
        <aside className="profile-card">
          <h2>Profile</h2>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>

          <div className="profile-stats">
            <h3>User statistics</h3>
            <div className="stats-grid compact-stats">
              <div className="stats-card small-card">
                <strong>{bookings.length}</strong>
                <span>Total bookings</span>
              </div>
              <div className="stats-card small-card">
                <strong>{upcomingBookings.length}</strong>
                <span>Upcoming</span>
              </div>
              <div className="stats-card small-card">
                <strong>₹{userStats.totalSpend}</strong>
                <span>Spent</span>
              </div>
              <div className="stats-card small-card">
                <strong>{userStats.topArea}</strong>
                <span>Top area</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="bookings-panel">
          <h2>Your bookings</h2>

          {loading ? (
            <div className="loading-box">Loading bookings...</div>
          ) : (
            <>
              <div className="booking-group">
                <h3>Upcoming</h3>
                {upcomingBookings.length === 0 ? (
                  <div className="empty-state small">No upcoming bookings.</div>
                ) : (
                  upcomingBookings.map((booking) => (
                    <div key={booking._id} className="booking-summary-card">
                      <div>
                        <strong>{booking.parking?.name}</strong>
                        <p>{booking.bookingDate?.slice(0, 10)} · {booking.startTime} to {booking.endTime}</p>
                        <small>{booking.status}</small>
                      </div>
                      <div>
                        <p>₹{booking.totalPrice}</p>
                        {booking.status !== 'cancelled' && (
                          <button className="btn btn-secondary btn-small" onClick={() => handleCancel(booking._id)}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="booking-group">
                <h3>Previous</h3>
                {previousBookings.length === 0 ? (
                  <div className="empty-state small">No previous bookings.</div>
                ) : (
                  previousBookings.map((booking) => (
                    <div key={booking._id} className="booking-summary-card">
                      <div>
                        <strong>{booking.parking?.name}</strong>
                        <p>{booking.bookingDate?.slice(0, 10)} · {booking.startTime} to {booking.endTime}</p>
                      </div>
                      <div>
                        <p>₹{booking.totalPrice}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
