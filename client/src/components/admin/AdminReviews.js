import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  // Получение списка отзывов
  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get('http://localhost:5001/api/admin/reviews');
      
      setReviews(response.data);
      setLoading(false);
    } catch (err) {
      setError('Не удалось загрузить отзывы: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  // Удаление отзыва
  const deleteReview = async (id) => {
    try {
      setDeletingId(id);
      setActionError('');
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:5001/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Обновляем список отзывов
      setReviews(reviews.filter(review => review.id !== id));
      setActionSuccess('Отзыв успешно удален');
      
      // Скрываем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
      
      setDeletingId(null);
    } catch (err) {
      setActionError('Ошибка при удалении отзыва: ' + (err.response?.data?.error || err.message));
      setDeletingId(null);
      
      // Скрываем сообщение об ошибке через 3 секунды
      setTimeout(() => {
        setActionError('');
      }, 3000);
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
    return (
      <div className="container admin-page">
        <h2>Управление отзывами</h2>
        <div className="loading">
          <p>Загрузка отзывов...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container admin-page">
        <h2>Управление отзывами</h2>
        <div className="alert alert-danger">
          {error}
          <button onClick={fetchReviews} className="btn btn-primary mt-2">Попробовать снова</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container admin-page">
      <h2>Управление отзывами</h2>
      
      {actionSuccess && (
        <div className="alert alert-success">{actionSuccess}</div>
      )}
      
      {actionError && (
        <div className="alert alert-danger">{actionError}</div>
      )}
      
      <div className="admin-reviews">
        {reviews.length === 0 ? (
          <p>Отзывы не найдены</p>
        ) : (
          <div className="reviews-grid">
            {reviews.map(review => (
              <div key={review.id} className="review-card admin-review">
                <div className="review-header">
                  <div className="review-tour">{review.tour_name}</div>
                  <div className="review-author">Автор: {review.username}</div>
                </div>
                <div className="review-date">Дата: {formatDate(review.created_at)}</div>
                <div className="review-rating">
                  Оценка: {renderStars(review.rating)}
                </div>
                <div className="review-text">{review.text}</div>
                <div className="review-actions">
                  <button 
                    className="btn btn-danger"
                    onClick={() => deleteReview(review.id)}
                    disabled={deletingId === review.id}
                  >
                    {deletingId === review.id ? 'Удаление...' : 'Удалить отзыв'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews; 