import { useEffect, useRef, useState } from 'react';
import BookingForm from '../components/BookingForm';
import ParkingMap from '../components/ParkingMap';
import api from '../services/api';

const defaultFilters = {
  search: '',
  type: 'all',
  vehicleType: 'all',
  minPrice: 0,
  maxPrice: 250,
  sort: 'recommended',
};

export default function HomePage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedParking, setSelectedParking] = useState(null);
  const mapRef = useRef(null);

  const loadParkings = async (customFilters = filters) => {
    setLoading(true);

    try {
      const response = await api.get('/parking', {
        params: {
          search: customFilters.search,
          type: customFilters.type,
          vehicleType: customFilters.vehicleType,
          minPrice: customFilters.minPrice,
          maxPrice: customFilters.maxPrice,
          sort: customFilters.sort,
        },
      });

      setParkings(response.data.data || []);
    } catch (error) {
      setParkings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParkings();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const nextFilters = { ...filters, search: filters.search };
    loadParkings(nextFilters);
  };

  const handleApplyFilters = () => {
    const nextFilters = { ...draftFilters };
    setFilters(nextFilters);
    loadParkings(nextFilters);
  };

  const handleResetFilters = () => {
    setDraftFilters(defaultFilters);
    setFilters(defaultFilters);
    loadParkings(defaultFilters);
  };

  const handleViewMap = () => {
    mapRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="page-content">
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Find a reliable parking spot</p>
            <h1>Smart Parking Finder</h1>
            <p className="hero-copy">
              Search nearby parking locations, compare rates, and reserve a demo parking slot in minutes.
            </p>

            <form className="search-panel" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search by city, area, or location"
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
              />
              <button type="submit" className="btn btn-primary">
                Find Parking
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleViewMap}>
                View Map
              </button>
            </form>
          </div>

          <div className="hero-stats">
            <div className="stats-card">
              <strong>{parkings.length}</strong>
              <span>Parking lots</span>
            </div>
            <div className="stats-card">
              <strong>{parkings.reduce((sum, item) => sum + Number(item.availableSlots || 0), 0)}</strong>
              <span>Open slots</span>
            </div>
            <div className="stats-card">
              <strong>Hyderabad</strong>
              <span>City coverage</span>
            </div>
          </div>
        </div>
      </section>

      <section className="filters-section">
        <div className="container filter-bar">
          <label className="filter-field">
            <span>Vehicle</span>
            <select
              value={draftFilters.vehicleType}
              onChange={(event) => setDraftFilters({ ...draftFilters, vehicleType: event.target.value })}
            >
              <option value="all">All vehicle types</option>
              <option value="Car">Cars</option>
              <option value="Bike">Bikes</option>
              <option value="Truck">Trucks</option>
              <option value="EV">EV</option>
            </select>
          </label>

          <label className="filter-field">
            <span>Type</span>
            <select
              value={draftFilters.type}
              onChange={(event) => setDraftFilters({ ...draftFilters, type: event.target.value })}
            >
              <option value="all">All styles</option>
              <option value="Open">Open</option>
              <option value="Covered">Covered</option>
              <option value="EV">EV</option>
              <option value="Valet">Valet</option>
            </select>
          </label>

          <label className="filter-field">
            <span>Min ₹/hr</span>
            <input
              type="number"
              min="0"
              value={draftFilters.minPrice}
              onChange={(event) => setDraftFilters({ ...draftFilters, minPrice: event.target.value })}
              placeholder="Min price"
            />
          </label>

          <label className="filter-field">
            <span>Max ₹/hr</span>
            <input
              type="number"
              min="0"
              value={draftFilters.maxPrice}
              onChange={(event) => setDraftFilters({ ...draftFilters, maxPrice: event.target.value })}
              placeholder="Max price"
            />
          </label>

          <label className="filter-field">
            <span>Sort</span>
            <select
              value={draftFilters.sort}
              onChange={(event) => setDraftFilters({ ...draftFilters, sort: event.target.value })}
            >
              <option value="recommended">Recommended</option>
              <option value="distance">Distance</option>
              <option value="price">Price</option>
            </select>
          </label>

          <div className="filter-actions">
            <button type="button" className="btn btn-primary" onClick={handleApplyFilters}>Apply</button>
            <button type="button" className="btn btn-secondary" onClick={handleResetFilters}>Reset</button>
          </div>
        </div>
      </section>

      <section className="listing-section">
        <div className="container">
          <div className="section-heading">
            <h2>Nearby Parking Options</h2>
            <span>{parkings.length} results</span>
          </div>

          {loading ? (
            <div className="loading-box">Loading parking lots...</div>
          ) : parkings.length === 0 ? (
            <div className="empty-state">No parking locations match your search. Try a different area or price range.</div>
          ) : (
            <div className="parking-list">
              {parkings.map((parking) => (
                <article key={parking._id} className="parking-card">
                  <div className="parking-card-header">
                    <div>
                      <h3>{parking.name}</h3>
                      <p>{parking.address}</p>
                    </div>
                    <span className={`pill ${parking.availableSlots > 0 ? 'green' : 'red'}`}>
                      {parking.availableSlots > 0 ? 'Available' : 'Full'}
                    </span>
                  </div>

                  <div className="parking-meta">
                    <span>📍 {parking.distance || '2.5'} km from city center</span>
                    <span>💰 ₹{parking.pricePerHour}/hr</span>
                    <span>🚗 {parking.vehicleType || 'Car'}</span>
                    <span>✅ {parking.availableSlots} / {parking.totalSlots} slots available</span>
                  </div>

                  <div className="parking-footer">
                    <small>{parking.parkingType}</small>
                    <button className="btn btn-primary btn-small" onClick={() => setSelectedParking(parking)}>
                      Reserve now
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section ref={mapRef} className="map-section">
        <div className="container">
          <div className="section-heading">
            <h2>Interactive Map</h2>
          </div>

          {parkings.length > 0 ? (
            <ParkingMap
              parkings={parkings}
              onSelectParking={(parking) => setSelectedParking(parking)}
            />
          ) : (
            <div className="empty-state">Map data will appear once parking results are available.</div>
          )}
        </div>
      </section>

      {selectedParking && (
        <div className="booking-modal">
          <BookingForm
            parking={selectedParking}
            onClose={() => setSelectedParking(null)}
            onBooked={() => {
              setSelectedParking(null);
              loadParkings();
            }}
          />
        </div>
      )}
    </div>
  );
}
