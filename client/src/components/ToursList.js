import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ToursList = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    destination: '',
    duration: ''
  });

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axios.get('/tours');
        setTours(response.data);
        setLoading(false);
      } catch (err) {
        setError('Не удалось загрузить список туров');
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const filterTours = () => {
    return tours.filter(tour => {
      // Фильтр по минимальной цене
      if (filters.minPrice && tour.price < parseInt(filters.minPrice)) {
        return false;
      }
      
      // Фильтр по максимальной цене
      if (filters.maxPrice && tour.price > parseInt(filters.maxPrice)) {
        return false;
      }
      
      // Фильтр по направлению
      if (filters.destination && 
          !tour.destination.toLowerCase().includes(filters.destination.toLowerCase())) {
        return false;
      }
      
      // Фильтр по длительности
      if (filters.duration && tour.duration !== parseInt(filters.duration)) {
        return false;
      }
      
      return true;
    });
  };

  const filteredTours = filterTours();
  
  // Получаем уникальные направления для фильтра
  const destinations = [...new Set(tours.map(tour => tour.destination))];
  
  // Получаем уникальные длительности для фильтра
  const durations = [...new Set(tours.map(tour => tour.duration))];

  return (
    <div>
      <h1 className="text-center mb-4">Доступные туры</h1>
      
      <div className="card mb-4">
        <div className="card-content">
          <h3 className="mb-2">Фильтры</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label className="form-label">Минимальная цена (€)</label>
              <input 
                type="number" 
                name="minPrice" 
                className="form-control" 
                value={filters.minPrice} 
                onChange={handleFilterChange}
              />
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label className="form-label">Максимальная цена (€)</label>
              <input 
                type="number" 
                name="maxPrice" 
                className="form-control" 
                value={filters.maxPrice} 
                onChange={handleFilterChange}
              />
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label className="form-label">Направление</label>
              <select 
                name="destination" 
                className="form-control" 
                value={filters.destination} 
                onChange={handleFilterChange}
              >
                <option value="">Все направления</option>
                {destinations.map(destination => (
                  <option key={destination} value={destination}>{destination}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label className="form-label">Длительность (дней)</label>
              <select 
                name="duration" 
                className="form-control" 
                value={filters.duration} 
                onChange={handleFilterChange}
              >
                <option value="">Любая длительность</option>
                {durations.map(duration => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <p className="text-center">Загрузка туров...</p>
      ) : error ? (
        <p className="text-center form-error">{error}</p>
      ) : filteredTours.length === 0 ? (
        <p className="text-center">По вашим критериям не найдено туров</p>
      ) : (
        <div className="grid">
          {filteredTours.map(tour => (
            <div key={tour.id} className="card">
              <img 
                src={tour.image_url} 
                alt={tour.name} 
                className="card-image" 
              />
              <div className="card-content">
                <h3 className="card-title">{tour.name}</h3>
                <p className="card-text">{tour.description.substring(0, 100)}...</p>
                <p className="card-price">€{tour.price}</p>
                <div className="tour-meta">
                  <div className="tour-meta-item">
                    <span>Направление: {tour.destination}</span>
                  </div>
                  <div className="tour-meta-item">
                    <span>Длительность: {tour.duration} дней</span>
                  </div>
                  <div className="tour-meta-item">
                    <span>Доступно мест: {tour.available_spots}</span>
                  </div>
                </div>
                <Link to={`/tours/${tour.id}`} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Подробнее
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToursList; 