import React from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
  const navigateTo = (path) => {
    window.location.href = path;
  };

  return (
    <div className="admin-panel">
      <h1>Панель администратора</h1>
      
      <div className="admin-dashboard">
        <div className="admin-card">
          <h2>Управление турами</h2>
          <p>Создание, редактирование и удаление туров</p>
          <button 
            onClick={() => navigateTo('/admin/tours')} 
            className="btn btn-primary">
            Перейти к турам
          </button>
        </div>
        
        <div className="admin-card">
          <h2>Управление бронированиями</h2>
          <p>Просмотр и управление статусами бронирований пользователей</p>
          <button 
            onClick={() => navigateTo('/admin/bookings')} 
            className="btn btn-primary">
            Перейти к бронированиям
          </button>
        </div>
        
        <div className="admin-card">
          <h2>Управление отзывами</h2>
          <p>Просмотр и модерация отзывов пользователей</p>
          <button 
            onClick={() => navigateTo('/admin/reviews')} 
            className="btn btn-primary">
            Перейти к отзывам
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 