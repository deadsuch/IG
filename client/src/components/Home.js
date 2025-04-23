import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaArrowRight, FaStar, FaHeart } from 'react-icons/fa';

const Home = () => {
  const [featuredTours, setFeaturedTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Анимация для контейнеров
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  // Анимация для карточек
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  useEffect(() => {
    const fetchFeaturedTours = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/tours');
        
        // Получаем 3 тура с наивысшей ценой (предполагаем, что они "премиум")
        const sortedTours = response.data.sort((a, b) => b.price - a.price);
        const featured = sortedTours.slice(0, 3);
        
        setFeaturedTours(featured);
        setLoading(false);
      } catch (err) {
        setError('Не удалось загрузить информацию о турах');
        setLoading(false);
      }
    };

    fetchFeaturedTours();
  }, []);

  // Функция для отображения звездочек рейтинга (случайное число для демонстрации)
  const renderStars = (tourId) => {
    // Генерация псевдослучайного рейтинга на основе id тура (для демонстрации)
    const rating = 3.5 + (tourId % 3) * 0.5; // Рейтинг от 3.5 до 5
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="tour-rating">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={i} className="star filled" />
        ))}
        {hasHalfStar && <FaStar className="star half" />}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <FaStar key={i + fullStars + (hasHalfStar ? 1 : 0)} className="star empty" />
        ))}
        <span className="rating-text">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Если загружаются данные
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <motion.div 
        className="hero"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <img 
          src="https://images.unsplash.com/photo-1504150558240-0b4fd8946624?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80" 
          alt="Красивый вид на море" 
          className="hero-image"
        />
        <div className="hero-overlay">
          <div className="hero-content">
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Откройте для себя новые горизонты путешествий
            </motion.h1>
            <motion.p 
              className="hero-text"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Незабываемые приключения, захватывающие дух пейзажи и уникальные впечатления ждут вас
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <Link to="/tours" className="btn btn-primary hero-btn">
                Исследовать туры <FaArrowRight className="btn-icon-right" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      <section className="featured-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="section-header"
        >
          <h2 className="section-title">Популярные направления</h2>
          <p className="section-subtitle">Откройте для себя наши лучшие туры, выбранные специально для вас</p>
        </motion.div>
        
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <motion.div 
            className="grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {featuredTours.map(tour => (
              <motion.div 
                key={tour.id}
                className="card tour-card"
                variants={itemVariants}
                whileHover={{ 
                  y: -10, 
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.18)',
                  transition: { duration: 0.3 }
                }}
              >
                <div className="card-image-container">
                  <img src={tour.image_url} alt={tour.name} className="card-image" />
                  <div className="card-badge">
                    Популярное
                  </div>
                  <motion.button 
                    className="favorite-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaHeart />
                  </motion.button>
                </div>
                
                <div className="card-content">
                  <div className="destination-tag">
                    <FaMapMarkerAlt className="tag-icon" />
                    {tour.destination}
                  </div>
                  <h3 className="card-title">{tour.name}</h3>
                  
                  {renderStars(tour.id)}
                  
                  <p className="card-text">{tour.description.substring(0, 100)}...</p>
                  
                  <div className="tour-details-container">
                    <div className="tour-detail">
                      <FaClock className="detail-icon" />
                      <span>{tour.duration} дней</span>
                    </div>
                    <div className="tour-detail">
                      <FaCalendarAlt className="detail-icon" />
                      <span>Круглый год</span>
                    </div>
                  </div>
                  
                  <div className="card-price-container">
                    <div className="card-price">
                      <FaMoneyBillWave className="price-icon" />
                      {tour.price} €
                    </div>
                    <div className="available-spots">
                      Осталось мест: <span className="spots-count">{tour.available_spots}</span>
                    </div>
                  </div>
                </div>
                
                <div className="card-footer">
                  <Link to={`/tours/${tour.id}`} className="btn btn-primary">
                    Подробнее
                    <FaArrowRight className="btn-icon-right" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        <motion.div 
          className="view-all-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Link to="/tours" className="btn btn-outline view-all-btn">
            Посмотреть все туры
            <FaArrowRight className="btn-icon-right" />
          </Link>
        </motion.div>
      </section>
      
      <section className="benefits-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="section-header"
        >
          <h2 className="section-title">Почему выбирают нас</h2>
          <p className="section-subtitle">Мы предлагаем лучший опыт путешествий с индивидуальным подходом</p>
        </motion.div>
        
        <motion.div 
          className="benefits-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="benefit-card"
            variants={itemVariants}
            whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
          >
            <div className="benefit-icon-container">
              <svg viewBox="0 0 24 24" className="benefit-icon">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <h3 className="benefit-title">Глобальный охват</h3>
            <p className="benefit-text">Путешествуйте по всему миру с нашими турами в более чем 50 стран на всех континентах</p>
          </motion.div>
          
          <motion.div 
            className="benefit-card"
            variants={itemVariants}
            whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
          >
            <div className="benefit-icon-container">
              <svg viewBox="0 0 24 24" className="benefit-icon">
                <path d="M20.2 5.9l.8-.8C19.6 3.7 17.8 3 16 3c-1.8 0-3.6.7-5 2.1l.8.8C13 4.8 14.5 4.2 16 4.2s3 .6 4.2 1.7zm-.9.8c-.9-.9-2.1-1.4-3.3-1.4s-2.4.5-3.3 1.4l.8.8c.7-.7 1.6-1 2.5-1 .9 0 1.8.3 2.5 1l.8-.8zM15 4.8V2L9 4v3.4l1-.6V4.3l4-1.4v2c-1.2 0-2.3.5-3.2 1.3l.6.7c.7-.6 1.7-1 2.6-1 .9 0 1.9.4 2.6 1l.6-.7c-.8-.8-1.9-1.3-3.2-1.3V3.4s-2.9 1-2.9 1v1.9c-2.1-.3-4.3.3-6 1.7l1.4 1.4c.8-.8 2.1-1.4 3.3-1.4s2.5.6 3.3 1.5l1.1-1.1c-1.1-1.1-2.5-1.7-4.1-1.7V4.8zM19 12.9l2.5 2.5c.3.3.3.8 0 1.1-.3.3-.7.3-1 0l-2.4-2.4c-.6.5-1.3.9-2.1 1.2V17h-4v-1.8c-.7-.2-1.4-.7-2-1.2l-2.4 2.4c-.3.3-.7.3-1 0-.3-.3-.3-.8 0-1.1l2.5-2.5c-.4-.6-.7-1.3-.8-2.1h-2v-4h2.2c.1-.8.3-1.5.8-2.1L6.1 2.1c-.3-.3-.3-.8 0-1.1.3-.3.7-.3 1 0l2.4 2.4c.6-.5 1.3-.9 2.1-1.2V0h4v2.2c.7.2 1.4.7 2 1.2l2.4-2.4c.3-.3.7-.3 1 0 .3.3.3.8 0 1.1l-2.5 2.5c.4.6.7 1.3.8 2.1H21v4h-2.2c0 .8-.3 1.5-.8 2.2zM16 7.6c-1.9 0-3.4 1.5-3.4 3.4s1.5 3.4 3.4 3.4 3.4-1.5 3.4-3.4-1.5-3.4-3.4-3.4z"/>
              </svg>
            </div>
            <h3 className="benefit-title">Лучшие цены</h3>
            <p className="benefit-text">Мы гарантируем конкурентоспособные цены и специальные предложения на все наши туры</p>
          </motion.div>
          
          <motion.div 
            className="benefit-card"
            variants={itemVariants}
            whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
          >
            <div className="benefit-icon-container">
              <svg viewBox="0 0 24 24" className="benefit-icon">
                <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
              </svg>
            </div>
            <h3 className="benefit-title">Поддержка 24/7</h3>
            <p className="benefit-text">Наша команда поддержки доступна круглосуточно, чтобы помочь вам во время вашего путешествия</p>
          </motion.div>
        </motion.div>
      </section>
      
      <motion.section 
        className="cta-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="cta-overlay">
          <motion.div 
            className="cta-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <h2 className="cta-title">Готовы отправиться в путешествие своей мечты?</h2>
            <p className="cta-text">Присоединяйтесь к тысячам счастливых путешественников и создайте незабываемые воспоминания</p>
            <Link to="/tours" className="btn btn-primary cta-button">
              Забронировать сейчас
              <FaArrowRight className="btn-icon-right" />
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home; 