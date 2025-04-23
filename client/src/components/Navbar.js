import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { motion } from 'framer-motion';
import { FaUser, FaSuitcase, FaSignOutAlt, FaHome, FaGlobeAmericas, FaListAlt, FaUserShield } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Анимация для навигационных ссылок
  const linkVariants = {
    hover: {
      scale: 1.05,
      color: '#4a6fa5',
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  // Отслеживание прокрутки страницы
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  // Проверка, активна ли ссылка
  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <motion.nav 
      className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <div className="navbar-container">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
            <FaGlobeAmericas className="navbar-logo-icon" />
            ТурАгентство
          </Link>
        </motion.div>
        
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <div className={`menu-icon ${mobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <motion.div 
          className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            variants={linkVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link 
              to="/" 
              className={`navbar-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaHome className="nav-icon" />
              <span>Главная</span>
            </Link>
          </motion.div>
          
          <motion.div
            variants={linkVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link 
              to="/tours" 
              className={`navbar-link ${isActive('/tours') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaSuitcase className="nav-icon" />
              <span>Туры</span>
            </Link>
          </motion.div>
          
          {user && (
            <motion.div
              variants={linkVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link 
                to="/bookings" 
                className={`navbar-link ${isActive('/bookings') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaListAlt className="nav-icon" />
                <span>Мои бронирования</span>
              </Link>
            </motion.div>
          )}
          
          {user && user.role === 'admin' && (
            <motion.div
              variants={linkVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link 
                to="/admin" 
                className={`navbar-link ${isActive('/admin') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaUserShield className="nav-icon" />
                <span>Админ панель</span>
              </Link>
            </motion.div>
          )}
        </motion.div>
        
        <motion.div 
          className={`navbar-auth ${mobileMenuOpen ? 'active' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {user ? (
            <>
              <motion.div 
                className="user-greeting"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <FaUser className="user-icon" />
                <span>Привет, {user.username}!</span>
              </motion.div>
              <motion.button 
                onClick={handleLogout} 
                className="btn btn-outline"
                whileHover={{ scale: 1.05, backgroundColor: "#4a6fa5", color: "#fff" }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSignOutAlt className="btn-icon" />
                <span>Выйти</span>
              </motion.button>
            </>
          ) : (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/login" 
                  className="btn btn-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Войти
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/register" 
                  className="btn btn-outline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Регистрация
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar; 