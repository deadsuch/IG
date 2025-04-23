import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'cancelled'
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  // Получение списка бронирований
  const fetchBookings = async () => {
    try {
      const response = await axios.get('/admin/bookings');
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError('Не удалось загрузить бронирования');
      setLoading(false);
    }
  };

  // Изменение статуса бронирования
  const updateBookingStatus = async (id, status) => {
    try {
      await axios.put(`/admin/bookings/${id}`, { status });
      
      setActionSuccess(`Статус бронирования успешно изменен на "${formatStatus(status)}"`);
      fetchBookings();
      
      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (err) {
      setActionError(
        err.response?.data?.error || 
        'Произошла ошибка при обновлении статуса бронирования'
      );
      
      setTimeout(() => {
        setActionError('');
      }, 3000);
    }
  };

  // Отфильтрованные бронирования в соответствии с выбранным фильтром
  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  // Форматирование статуса для отображения
  const formatStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'Ожидает подтверждения';
      case 'confirmed':
        return 'Подтверждено';
      case 'cancelled':
        return 'Отменено';
      default:
        return status;
    }
  };

  // Отображение статуса с цветовой индикацией
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return <span style={{ color: '#ffc107' }}>Ожидает подтверждения</span>;
      case 'confirmed':
        return <span style={{ color: '#28a745' }}>Подтверждено</span>;
      case 'cancelled':
        return <span style={{ color: '#dc3545' }}>Отменено</span>;
      default:
        return <span>{status}</span>;
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  if (loading) {
    return <p className="text-center">Загрузка бронирований...</p>;
  }

  if (error) {
    return <p className="text-center form-error">{error}</p>;
  }

  return (
    <div>
      <div className="admin-header">
        <h2 className="admin-title">Управление бронированиями</h2>
        <div>
          <label className="form-label" style={{ marginRight: '0.5rem' }}>Фильтр:</label>
          <select 
            className="form-control"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ display: 'inline-block', width: 'auto' }}
          >
            <option value="all">Все бронирования</option>
            <option value="pending">Ожидающие подтверждения</option>
            <option value="confirmed">Подтвержденные</option>
            <option value="cancelled">Отмененные</option>
          </select>
        </div>
      </div>
      
      {actionSuccess && <p style={{ color: '#28a745', marginBottom: '1rem' }}>{actionSuccess}</p>}
      {actionError && <p className="form-error" style={{ marginBottom: '1rem' }}>{actionError}</p>}
      
      {filteredBookings.length === 0 ? (
        <p className="text-center">Бронирования не найдены</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Пользователь</th>
                <th>Тур</th>
                <th>Дата бронирования</th>
                <th>Участники</th>
                <th>Стоимость</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.username}</td>
                  <td>{booking.tour_name}</td>
                  <td>{formatDate(booking.booking_date)}</td>
                  <td>{booking.participants}</td>
                  <td>€{booking.total_price}</td>
                  <td>{getStatusLabel(booking.status)}</td>
                  <td>
                    {booking.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')} 
                          className="btn btn-primary"
                          style={{ marginRight: '0.5rem' }}
                        >
                          Подтвердить
                        </button>
                        <button 
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')} 
                          className="btn btn-danger"
                        >
                          Отменить
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')} 
                        className="btn btn-danger"
                      >
                        Отменить
                      </button>
                    )}
                    {booking.status === 'cancelled' && (
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')} 
                        className="btn btn-primary"
                      >
                        Восстановить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBookings; 