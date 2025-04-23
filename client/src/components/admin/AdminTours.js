import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Состояние для модального окна добавления/редактирования тура
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' или 'edit'
  const [currentTour, setCurrentTour] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    duration: '',
    destination: '',
    image_url: '',
    available_spots: ''
  });
  
  // Состояние для сообщений об успехе/ошибке при операциях с турами
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchTours();
  }, []);

  // Получение списка туров
  const fetchTours = async () => {
    try {
      const response = await axios.get('/tours');
      setTours(response.data);
      setLoading(false);
    } catch (err) {
      setError('Не удалось загрузить туры');
      setLoading(false);
    }
  };

  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTour({
      ...currentTour,
      [name]: value
    });
  };

  // Открытие модального окна для добавления тура
  const openAddModal = () => {
    setCurrentTour({
      id: null,
      name: '',
      description: '',
      price: '',
      duration: '',
      destination: '',
      image_url: '',
      available_spots: ''
    });
    setModalType('add');
    setIsModalOpen(true);
  };

  // Открытие модального окна для редактирования тура
  const openEditModal = (tour) => {
    setCurrentTour({
      id: tour.id,
      name: tour.name,
      description: tour.description || '',
      price: tour.price,
      duration: tour.duration,
      destination: tour.destination,
      image_url: tour.image_url || '',
      available_spots: tour.available_spots
    });
    setModalType('edit');
    setIsModalOpen(true);
  };

  // Закрытие модального окна
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Сохранение тура (добавление или редактирование)
  const saveTour = async (e) => {
    e.preventDefault();
    
    try {
      // Проверка обязательных полей
      const requiredFields = ['name', 'price', 'duration', 'destination', 'available_spots'];
      for (const field of requiredFields) {
        if (!currentTour[field]) {
          setActionError(`Поле ${field} обязательно для заполнения`);
          return;
        }
      }
      
      // Подготовка данных
      const tourData = {
        name: currentTour.name,
        description: currentTour.description,
        price: parseFloat(currentTour.price),
        duration: parseInt(currentTour.duration),
        destination: currentTour.destination,
        image_url: currentTour.image_url,
        available_spots: parseInt(currentTour.available_spots)
      };
      
      if (modalType === 'add') {
        // Добавление нового тура
        await axios.post('/admin/tours', tourData);
        setActionSuccess('Тур успешно добавлен');
      } else {
        // Редактирование существующего тура
        await axios.put(`/admin/tours/${currentTour.id}`, tourData);
        setActionSuccess('Тур успешно обновлен');
      }
      
      // Закрытие модального окна и обновление списка туров
      closeModal();
      fetchTours();
      
      // Скрытие сообщения об успехе через 3 секунды
      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (err) {
      setActionError(
        err.response?.data?.error || 
        'Произошла ошибка при сохранении тура'
      );
    }
  };

  // Удаление тура
  const deleteTour = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот тур?')) {
      try {
        await axios.delete(`/admin/tours/${id}`);
        setActionSuccess('Тур успешно удален');
        fetchTours();
        
        setTimeout(() => {
          setActionSuccess('');
        }, 3000);
      } catch (err) {
        setActionError(
          err.response?.data?.error || 
          'Произошла ошибка при удалении тура'
        );
      }
    }
  };

  if (loading) {
    return <p className="text-center">Загрузка туров...</p>;
  }

  return (
    <div>
      <div className="admin-header">
        <h2 className="admin-title">Управление турами</h2>
        <button onClick={openAddModal} className="btn btn-primary">
          Добавить новый тур
        </button>
      </div>
      
      {error && <p className="form-error">{error}</p>}
      {actionSuccess && <p style={{ color: '#28a745', marginBottom: '1rem' }}>{actionSuccess}</p>}
      {actionError && <p className="form-error" style={{ marginBottom: '1rem' }}>{actionError}</p>}
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Направление</th>
              <th>Цена</th>
              <th>Длительность</th>
              <th>Доступные места</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {tours.map(tour => (
              <tr key={tour.id}>
                <td>{tour.id}</td>
                <td>{tour.name}</td>
                <td>{tour.destination}</td>
                <td>€{tour.price}</td>
                <td>{tour.duration} дней</td>
                <td>{tour.available_spots}</td>
                <td>
                  <button 
                    onClick={() => openEditModal(tour)} 
                    className="btn btn-primary"
                    style={{ marginRight: '0.5rem' }}
                  >
                    Редактировать
                  </button>
                  <button 
                    onClick={() => deleteTour(tour.id)} 
                    className="btn btn-danger"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Модальное окно для добавления/редактирования тура */}
      {isModalOpen && (
        <div className="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3>{modalType === 'add' ? 'Добавить новый тур' : 'Редактировать тур'}</h3>
            
            <form onSubmit={saveTour}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Название тура *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={currentTour.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description" className="form-label">Описание</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={currentTour.description}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="price" className="form-label">Цена (€) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  className="form-control"
                  value={currentTour.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="duration" className="form-label">Длительность (дней) *</label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  className="form-control"
                  value={currentTour.duration}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="destination" className="form-label">Направление *</label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  className="form-control"
                  value={currentTour.destination}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="image_url" className="form-label">URL изображения</label>
                <input
                  type="text"
                  id="image_url"
                  name="image_url"
                  className="form-control"
                  value={currentTour.image_url}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="available_spots" className="form-label">Доступные места *</label>
                <input
                  type="number"
                  id="available_spots"
                  name="available_spots"
                  className="form-control"
                  value={currentTour.available_spots}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalType === 'add' ? 'Добавить тур' : 'Сохранить изменения'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTours; 