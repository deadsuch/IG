import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import './TourDetails.css';

const TourDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Состояние для формы бронирования
  const [booking, setBooking] = useState({
    participants: 1,
    booking_date: new Date().toISOString().split('T')[0]
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Состояние для отзывов
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewError, setReviewError] = useState('');
  
  // Состояние для новго отзыва
  const [newReview, setNewReview] = useState({
    rating: 5,
    text: ''
  });
  const [addingReview, setAddingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [addReviewError, setAddReviewError] = useState('');

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/tours/${id}`);
        setTour(response.data);
        setLoading(false);
      } catch (err) {
        setError('Не удалось загрузить информацию о туре');
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/tours/${id}/reviews`);
        setReviews(response.data);
        setLoadingReviews(false);
      } catch (err) {
        setReviewError('Не удалось загрузить отзывы');
        setLoadingReviews(false);
      }
    };

    fetchTour();
    fetchReviews();
  }, [id]);

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBooking({
      ...booking,
      [name]: value
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    setBookingError('');
    setBookingLoading(true);
    
    try {
      const bookingData = {
        tour_id: tour.id,
        booking_date: booking.booking_date,
        participants: parseInt(booking.participants)
      };
      
      await axios.post('http://localhost:5001/api/bookings', bookingData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setBookingSuccess(true);
      setBookingLoading(false);
      
      // Обновляем данные о туре после бронирования
      const tourResponse = await axios.get(`http://localhost:5001/api/tours/${id}`);
      setTour(tourResponse.data);
      
    } catch (err) {
      setBookingError(
        err.response?.data?.error || 
        'Произошла ошибка при бронировании. Пожалуйста, попробуйте еще раз.'
      );
      setBookingLoading(false);
    }
  };
  
  // Обработчики для отзывов
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview({
      ...newReview,
      [name]: name === 'rating' ? parseInt(value) : value
    });
  };
  
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    setAddReviewError('');
    setAddingReview(true);
    
    try {
      const response = await axios.post(
        `http://localhost:5001/api/tours/${id}/reviews`, 
        newReview,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      setReviews([response.data, ...reviews]);
      setNewReview({ rating: 5, text: '' });
      setReviewSuccess(true);
      setAddingReview(false);
      
      // Скрываем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setReviewSuccess(false);
      }, 3000);
    } catch (err) {
      setAddReviewError(err.response?.data?.error || 'Не удалось добавить отзыв');
      setAddingReview(false);
    }
  };
  
  // Отрисовка звездного рейтинга
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star"}>★</span>
      );
    }
    return stars;
  };
  
  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    }).format(date);
  };

  if (loading) {
    return <p className="text-center">Загрузка информации о туре...</p>;
  }

  if (error) {
    return <p className="text-center form-error">{error}</p>;
  }

  if (!tour) {
    return <p className="text-center">Тур не найден</p>;
  }

  return (
    <div>
      <div className="tour-details">
        <div className="tour-image">
          <img src={tour.image_url} alt={tour.name} />
        </div>
        
        <div className="tour-info">
          <h1 className="tour-title">{tour.name}</h1>
          
          <div className="tour-meta">
            <div className="tour-meta-item">
              <strong>Направление:</strong> {tour.destination}
            </div>
            <div className="tour-meta-item">
              <strong>Длительность:</strong> {tour.duration} дней
            </div>
            <div className="tour-meta-item">
              <strong>Доступно мест:</strong> {tour.available_spots}
            </div>
            <div className="tour-meta-item">
              <strong>Цена:</strong> €{tour.price} за человека
            </div>
          </div>
          
          <div className="tour-description">
            <h3>Описание</h3>
            <p>{tour.description}</p>
          </div>

          <div className="tour-details-info">
            <h3>Детали тура</h3>
            <div className="tour-details-grid">
              <div className="tour-detail-item">
                <strong>Транспорт:</strong>
                <p>{tour.transport_type || 'Комфортабельный автобус'}</p>
              </div>
              <div className="tour-detail-item">
                <strong>Место отправления:</strong>
                <p>{tour.departure_location || 'Центральный автовокзал'}</p>
              </div>
              <div className="tour-detail-item">
                <strong>Время отправления:</strong>
                <p>{tour.departure_time || '08:00'}</p>
              </div>
              <div className="tour-detail-item">
                <strong>Ваш гид:</strong>
                <p>{tour.tour_guide || 'Опытный русскоговорящий гид'}</p>
              </div>
              <div className="tour-detail-item included-services">
                <strong>Включено в стоимость:</strong>
                <p>{tour.included_services || 'Проживание, завтраки, экскурсии'}</p>
              </div>
            </div>
          </div>
          
          <div className="tour-booking">
            <h3>Забронировать тур</h3>
            
            {bookingSuccess ? (
              <div style={{ color: '#28a745', marginTop: '1rem' }}>
                <p>Тур успешно забронирован! Вы можете просмотреть ваши бронирования в личном кабинете.</p>
                <button 
                  onClick={() => navigate('/bookings')} 
                  className="btn btn-primary"
                  style={{ marginTop: '1rem' }}
                >
                  Перейти к моим бронированиям
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit}>
                {bookingError && <div className="form-error">{bookingError}</div>}
                
                <div className="form-group">
                  <label htmlFor="participants" className="form-label">Количество участников</label>
                  <input
                    type="number"
                    id="participants"
                    name="participants"
                    className="form-control"
                    value={booking.participants}
                    onChange={handleBookingChange}
                    min="1"
                    max={tour.available_spots}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="booking_date" className="form-label">Дата бронирования</label>
                  <input
                    type="date"
                    id="booking_date"
                    name="booking_date"
                    className="form-control"
                    value={booking.booking_date}
                    onChange={handleBookingChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <p><strong>Итого:</strong> €{tour.price * booking.participants}</p>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={bookingLoading || tour.available_spots < 1}
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  {bookingLoading ? 'Обработка...' : 'Забронировать'}
                </button>
                
                {!user && (
                  <p style={{ marginTop: '1rem', color: '#6c757d' }}>
                    Для бронирования тура необходимо войти в систему
                  </p>
                )}
                
                {tour.available_spots < 1 && (
                  <p style={{ marginTop: '1rem', color: '#dc3545' }}>
                    К сожалению, все места на этот тур уже забронированы
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
      
      {/* Секция отзывов */}
      <div className="reviews-section">
        <h2>Отзывы о туре</h2>
        
        {/* Форма добавления отзыва */}
        {user && (
          <div className="add-review-form">
            <h3>Оставить отзыв</h3>
            {reviewSuccess && (
              <div className="alert alert-success">
                Ваш отзыв успешно добавлен!
              </div>
            )}
            {addReviewError && (
              <div className="alert alert-danger">
                {addReviewError}
              </div>
            )}
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label htmlFor="rating">Рейтинг:</label>
                <div className="rating-input">
                  {[5, 4, 3, 2, 1].map(star => (
                    <label key={star}>
                      <input
                        type="radio"
                        name="rating"
                        value={star}
                        checked={newReview.rating === star}
                        onChange={handleReviewChange}
                      />
                      <span className={newReview.rating >= star ? "star filled" : "star"}>★</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="text">Ваш отзыв:</label>
                <textarea
                  id="text"
                  name="text"
                  value={newReview.text}
                  onChange={handleReviewChange}
                  required
                  rows="4"
                  placeholder="Поделитесь своими впечатлениями о туре..."
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={addingReview}
              >
                {addingReview ? 'Отправка...' : 'Отправить отзыв'}
              </button>
            </form>
          </div>
        )}
        
        {/* Список отзывов */}
        <div className="reviews-list">
          {loadingReviews ? (
            <p>Загрузка отзывов...</p>
          ) : reviewError ? (
            <p className="error">{reviewError}</p>
          ) : reviews.length === 0 ? (
            <p>Отзывы отсутствуют. Будьте первым, кто оставит отзыв об этом туре!</p>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-author">{review.username}</div>
                  <div className="review-date">{formatDate(review.created_at)}</div>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
                <div className="review-text">
                  {review.text}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TourDetails; 