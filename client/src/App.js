import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Компоненты
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import ToursList from './components/ToursList';
import TourDetails from './components/TourDetails';
import UserBookings from './components/UserBookings';
import AdminPanel from './components/admin/AdminPanel';
import AdminTours from './components/admin/AdminTours';
import AdminBookings from './components/admin/AdminBookings';
import AdminReviews from './components/admin/AdminReviews';
import Footer from './components/Footer';

// Создание AuthContext для хранения данных авторизации
export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Проверка JWT токена при загрузке приложения
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  // Функция авторизации
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Функция выхода
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Защищенный маршрут для пользователя
  const UserRoute = ({ children }) => {
    if (loading) return <div>Загрузка...</div>;
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };

  // Защищенный маршрут для администратора
  const AdminRoute = ({ children }) => {
    if (loading) return <div>Загрузка...</div>;
    
    if (!user || user.role !== 'admin') {
      return <Navigate to="/login" />;
    }
    
    return children;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <div className="app">
          <Navbar />
          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/tours" element={<ToursList />} />
              <Route path="/tours/:id" element={<TourDetails />} />
              
              {/* Маршруты для пользователя */}
              <Route path="/bookings" element={
                <UserRoute>
                  <UserBookings />
                </UserRoute>
              } />
              
              {/* Маршруты для администратора */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              } />
              <Route path="/admin/tours" element={
                <AdminRoute>
                  <AdminTours />
                </AdminRoute>
              } />
              <Route path="/admin/bookings" element={
                <AdminRoute>
                  <AdminBookings />
                </AdminRoute>
              } />
              <Route path="/admin/reviews" element={
                <AdminRoute>
                  <AdminReviews />
                </AdminRoute>
              } />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
