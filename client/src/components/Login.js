import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!username || !password) {
      setError('Пожалуйста, введите логин и пароль');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post('/auth/login', { username, password });
      login(response.data.user, response.data.token);
      
      // Перенаправление на соответствующую страницу
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Произошла ошибка при попытке входа. Пожалуйста, попробуйте еще раз.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    const credentials = {
      username: role,
      password: role
    };
    
    setLoading(true);
    
    try {
      const response = await axios.post('/auth/login', credentials);
      login(response.data.user, response.data.token);
      
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Произошла ошибка при попытке входа. Пожалуйста, попробуйте еще раз.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Функция быстрого входа для тестового пользователя
  const handleTestUserLogin = async () => {
    const credentials = {
      username: 'testuser',
      password: 'testuser'
    };
    
    setLoading(true);
    
    try {
      // Сначала попробуем зарегистрировать тестового пользователя
      try {
        await axios.post('/auth/register', credentials);
      } catch (registerErr) {
        // Игнорируем ошибку, если пользователь уже существует
      }
      
      // Входим как тестовый пользователь
      const response = await axios.post('/auth/login', credentials);
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Произошла ошибка при попытке входа. Пожалуйста, попробуйте еще раз.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Вход в систему</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">Имя пользователя</label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="Введите имя пользователя"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Пароль</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Введите пароль"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary auth-button" 
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        
        <div className="quick-access">
          <h4>Быстрый вход:</h4>
          <div className="quick-access-buttons">
            <button 
              onClick={() => handleQuickLogin('admin')} 
              className="btn btn-outline"
              disabled={loading}
            >
              Администратор
            </button>
            <button 
              onClick={() => handleQuickLogin('user')} 
              className="btn btn-outline"
              disabled={loading}
            >
              Пользователь
            </button>
            <button 
              onClick={handleTestUserLogin} 
              className="btn btn-outline primary"
              disabled={loading}
            >
              Тестовый пользователь
            </button>
          </div>
        </div>
        
        <div className="auth-footer">
          <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login; 