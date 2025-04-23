import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserBookings.css';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Необходимо войти в систему');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:5001/api/user/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось загрузить бронирования');
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      setCancelingId(bookingId);
      setCancelError(null);
      
      const token = localStorage.getItem('token');
      
      await axios.put(`http://localhost:5001/api/user/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Обновляем статус бронирования в локальном состоянии
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? {...booking, status: 'cancelled'} 
          : booking
      ));
      
      setCancelSuccess(true);
      setCancelingId(null);
      
      // Закрываем модальное окно с деталями, если оно открыто
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(null);
      }
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Не удалось отменить бронирование');
      setCancelingId(null);
    }
  };

  const closeCancelSuccess = () => {
    setCancelSuccess(false);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge pending">Ожидает подтверждения</span>;
      case 'confirmed':
        return <span className="status-badge confirmed">Подтверждено</span>;
      case 'cancelled':
        return <span className="status-badge cancelled">Отменено</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    }).format(date);
  };
  
  const openBookingDetails = (booking) => {
    setSelectedBooking(booking);
  };
  
  const closeBookingDetails = () => {
    setSelectedBooking(null);
  };
  
  if (loading) {
    return (
      <div className="container user-bookings">
        <h2>Мои бронирования</h2>
        <div className="loading">
          <div className="spinner"></div>
          <p>Загрузка бронирований...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container user-bookings">
        <h2>Мои бронирования</h2>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchBookings} className="btn btn-primary">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }
  
  if (bookings.length === 0) {
    return (
      <div className="container user-bookings">
        <h2>Мои бронирования</h2>
        <div className="empty-bookings">
          <i className="fas fa-calendar-times empty-icon"></i>
          <h3>У вас пока нет бронирований</h3>
          <p>Изучите наши туры и забронируйте незабываемое путешествие!</p>
          <a href="/tours" className="btn btn-primary">Смотреть доступные туры</a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container user-bookings">
      <h2>Мои бронирования</h2>
      
      {cancelSuccess && (
        <div className="alert alert-success" style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '1rem', 
          borderRadius: '0.25rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Бронирование успешно отменено!</span>
            <button 
              onClick={closeCancelSuccess} 
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '1.5rem', 
                cursor: 'pointer',
                color: '#155724'
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
      
      {cancelError && (
        <div className="alert alert-danger" style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '1rem', 
          borderRadius: '0.25rem',
          marginBottom: '1rem'
        }}>
          {cancelError}
        </div>
      )}
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Тур</th>
              <th>Направление</th>
              <th>Дата бронирования</th>
              <th>Участники</th>
              <th>Статус</th>
              <th>Стоимость</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.tour_name}</td>
                <td>{booking.destination}</td>
                <td>{formatDate(booking.booking_date)}</td>
                <td>{booking.participants}</td>
                <td>{getStatusLabel(booking.status)}</td>
                <td>€{booking.total_price}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => openBookingDetails(booking)} 
                      className="btn btn-outline primary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                    >
                      Детали
                    </button>
                    
                    {booking.status !== 'cancelled' && (
                      <button 
                        onClick={() => cancelBooking(booking.id)} 
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                        disabled={cancelingId !== null}
                      >
                        {cancelingId === booking.id ? 'Отмена...' : 'Отменить'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selectedBooking && (
        <div className="modal" onClick={closeBookingDetails}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeBookingDetails}>&times;</button>
            <h3 className="mb-2">Детали бронирования #{selectedBooking.id}</h3>
            
            <div className="booking-details">
              <div className="booking-info-section">
                <h4>Информация о туре</h4>
                <div className="booking-info-grid">
                  <div className="booking-info-item">
                    <strong>Название тура:</strong>
                    <p>{selectedBooking.tour_name}</p>
                  </div>
                  <div className="booking-info-item">
                    <strong>Направление:</strong>
                    <p>{selectedBooking.destination}</p>
                  </div>
                  <div className="booking-info-item">
                    <strong>Дата бронирования:</strong>
                    <p>{formatDate(selectedBooking.booking_date)}</p>
                  </div>
                  <div className="booking-info-item">
                    <strong>Количество участников:</strong>
                    <p>{selectedBooking.participants}</p>
                  </div>
                  <div className="booking-info-item">
                    <strong>Статус:</strong>
                    <p>{getStatusLabel(selectedBooking.status)}</p>
                  </div>
                  <div className="booking-info-item">
                    <strong>Общая стоимость:</strong>
                    <p>€{selectedBooking.total_price}</p>
                  </div>
                </div>
              </div>
              
              <div className="booking-info-section">
                <h4>Детали отправления</h4>
                <div className="booking-info-grid">
                  <div className="booking-info-item">
                    <strong>Транспорт:</strong>
                    <p>{selectedBooking.transport_type || 'Комфортабельный автобус'}</p>
                  </div>
                  <div className="booking-info-item">
                    <strong>Место отправления:</strong>
                    <p>{selectedBooking.departure_location || 'Центральный автовокзал'}</p>
                  </div>
                  <div className="booking-info-item">
                    <strong>Время отправления:</strong>
                    <p>{selectedBooking.departure_time || '08:00'}</p>
                  </div>
                  <div className="booking-info-item">
                    <strong>Ваш гид:</strong>
                    <p>{selectedBooking.tour_guide || 'Опытный русскоговорящий гид'}</p>
                  </div>
                </div>
              </div>
              
              <div className="booking-info-section">
                <h4>Включено в стоимость</h4>
                <div className="included-services-box">
                  <p>{selectedBooking.included_services || 'Проживание, завтраки, экскурсии'}</p>
                </div>
              </div>
              
              <div className="booking-info-section">
                <h4>Дополнительная информация</h4>
                <p>Пожалуйста, прибудьте на место отправления не позднее, чем за 20 минут до указанного времени.</p>
                <p>Возьмите с собой паспорт и распечатку бронирования.</p>
                <p>По всем вопросам обращайтесь по телефону +7 (999) 123-45-67.</p>
              </div>
            </div>
            
            <div className="text-center mt-4" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-primary" onClick={closeBookingDetails}>Закрыть</button>
              
              {selectedBooking.status !== 'cancelled' && (
                <button 
                  className="btn btn-danger" 
                  onClick={() => {
                    closeBookingDetails();
                    cancelBooking(selectedBooking.id);
                  }}
                  disabled={cancelingId !== null}
                >
                  {cancelingId === selectedBooking.id ? 'Отмена...' : 'Отменить бронирование'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="card mt-4">
        <div className="card-content">
          <h3 className="mb-2">Информация о статусах</h3>
          <p><strong>Ожидает подтверждения</strong> - ваше бронирование находится на рассмотрении у администратора.</p>
          <p><strong>Подтверждено</strong> - бронирование подтверждено, вы можете отправляться в путешествие.</p>
          <p><strong>Отменено</strong> - бронирование было отменено администратором.</p>
        </div>
      </div>
    </div>
  );
};

export default UserBookings; 