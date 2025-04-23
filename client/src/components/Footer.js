import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaFacebookF, FaTwitter, FaInstagram, FaYoutube, 
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock,
  FaGlobeAmericas, FaPlane, FaHotel, FaCar, FaUmbrella
} from 'react-icons/fa';

const Footer = () => {
  // Анимации
  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const socialVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <motion.footer 
      className="footer"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="footer-content">
        <motion.div variants={itemVariants} className="footer-section">
          <h3 className="footer-title">
            <FaGlobeAmericas className="footer-icon" /> О нас
          </h3>
          <p className="footer-text">
            Мы создаем незабываемые путешествия и впечатления для наших клиентов уже более 10 лет. 
            Наша миссия — сделать ваше путешествие уникальным и безопасным.
          </p>
          <div className="social-links">
            <motion.a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              variants={socialVariants}
              whileHover={{ y: -5, scale: 1.1 }}
            >
              <FaFacebookF />
            </motion.a>
            <motion.a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              variants={socialVariants}
              whileHover={{ y: -5, scale: 1.1 }}
            >
              <FaTwitter />
            </motion.a>
            <motion.a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              variants={socialVariants}
              whileHover={{ y: -5, scale: 1.1 }}
            >
              <FaInstagram />
            </motion.a>
            <motion.a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              variants={socialVariants}
              whileHover={{ y: -5, scale: 1.1 }}
            >
              <FaYoutube />
            </motion.a>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="footer-section">
          <h3 className="footer-title">
            <FaPlane className="footer-icon" /> Навигация
          </h3>
          <ul className="footer-links">
            <li className="footer-link">
              <Link to="/">Главная</Link>
            </li>
            <li className="footer-link">
              <Link to="/tours">Туры</Link>
            </li>
            <li className="footer-link">
              <Link to="/login">Авторизация</Link>
            </li>
            <li className="footer-link">
              <Link to="/register">Регистрация</Link>
            </li>
          </ul>
        </motion.div>

        <motion.div variants={itemVariants} className="footer-section">
          <h3 className="footer-title">
            <FaUmbrella className="footer-icon" /> Услуги
          </h3>
          <ul className="footer-links">
            <li className="footer-link">
              <button className="footer-button"><FaPlane className="service-icon" /> Авиабилеты</button>
            </li>
            <li className="footer-link">
              <button className="footer-button"><FaHotel className="service-icon" /> Бронирование отелей</button>
            </li>
            <li className="footer-link">
              <button className="footer-button"><FaCar className="service-icon" /> Аренда автомобилей</button>
            </li>
            <li className="footer-link">
              <button className="footer-button"><FaUmbrella className="service-icon" /> Страхование</button>
            </li>
          </ul>
        </motion.div>

        <motion.div variants={itemVariants} className="footer-section">
          <h3 className="footer-title">
            <FaEnvelope className="footer-icon" /> Контакты
          </h3>
          <div className="contact-info">
            <p className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <span>123 Улица Путешествий, Город, Страна</span>
            </p>
            <p className="contact-item">
              <FaPhone className="contact-icon" />
              <span>+7 (999) 123-45-67</span>
            </p>
            <p className="contact-item">
              <FaEnvelope className="contact-icon" />
              <span>info@travelagency.com</span>
            </p>
            <p className="contact-item">
              <FaClock className="contact-icon" />
              <span>Пн-Пт: 9:00 - 18:00</span>
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="footer-bottom"
        variants={itemVariants}
      >
        <p>
          &copy; {new Date().getFullYear()} ТурАгентство. Все права защищены.
          <motion.span 
            className="heart-icon"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, repeatDelay: 1.5 }}
          >
            ❤️
          </motion.span>
        </p>
      </motion.div>
    </motion.footer>
  );
};

export default Footer; 