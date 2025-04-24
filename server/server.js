const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');

// Загрузка переменных окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к базе данных
const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка при подключении к БД:', err.message);
  } else {
    console.log('Подключено к SQLite базе данных');
    initializeDatabase();
  }
});

// Инициализация базы данных
function initializeDatabase() {
  console.log('Инициализация базы данных...');
  
  // Используем промисы для последовательного выполнения SQL запросов
  const createUsersTable = () => {
    return new Promise((resolve, reject) => {
      // Создание таблицы пользователей
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user'
      )`, (err) => {
        if (err) {
          console.error('Ошибка при создании таблицы users:', err.message);
          reject(err);
        } else {
          console.log('Таблица users создана или уже существует');
          // Проверяем, есть ли уже пользователи
          db.get('SELECT COUNT(*) as count FROM users', [], async (err, row) => {
            if (err) {
              console.error('Ошибка при проверке пользователей:', err.message);
              reject(err);
              return;
            }
            
            // Если пользователей нет, создаем admin и user
            if (row.count === 0) {
              try {
                const adminHash = await bcrypt.hash('admin', 10);
                const userHash = await bcrypt.hash('user', 10);
                
                await new Promise((res, rej) => {
                  db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
                    ['admin', adminHash, 'admin'], function(err) {
                      if (err) rej(err);
                      else res();
                    });
                });
                
                await new Promise((res, rej) => {
                  db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
                    ['user', userHash, 'user'], function(err) {
                      if (err) rej(err);
                      else res();
                    });
                });
                
                console.log('Добавлены тестовые пользователи: admin/admin и user/user');
              } catch (error) {
                console.error('Ошибка при создании тестовых пользователей:', error);
                reject(error);
                return;
              }
            }
            resolve();
          });
        }
      });
    });
  };
  
  const createToursTable = () => {
    return new Promise((resolve, reject) => {
      // Создание таблицы туров
      db.run(`CREATE TABLE IF NOT EXISTS tours (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        duration INTEGER NOT NULL,
        destination TEXT NOT NULL,
        image_url TEXT,
        available_spots INTEGER NOT NULL,
        transport_type TEXT DEFAULT 'Автобус',
        departure_location TEXT DEFAULT 'Центральный автовокзал',
        departure_time TEXT DEFAULT '08:00',
        tour_guide TEXT DEFAULT 'Опытный гид',
        included_services TEXT DEFAULT 'Проживание, завтраки, экскурсии'
      )`, (err) => {
        if (err) {
          console.error('Ошибка при создании таблицы tours:', err.message);
          reject(err);
        } else {
          console.log('Таблица tours создана или уже существует');
          // Добавление тестовых данных, если таблица пуста
          db.get('SELECT COUNT(*) as count FROM tours', [], async (err, row) => {
            if (err) {
              console.error('Ошибка при проверке туров:', err.message);
              reject(err);
              return;
            }
            
            if (row.count === 0) {
              const tours = [
                {
                  name: 'Прекрасная Франция',
                  description: 'Незабываемое путешествие по Франции с посещением Парижа, Лиона и Ниццы',
                  price: 1500,
                  duration: 7,
                  destination: 'Франция',
                  image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
                  available_spots: 20,
                  transport_type: 'Комфортабельный автобус Volvo',
                  departure_location: 'Центральный вокзал, платформа 3',
                  departure_time: '07:30',
                  tour_guide: 'Андрей Петров - гид со знанием французского',
                  included_services: 'Проживание в отелях 4*, завтраки, экскурсии по программе, трансфер'
                },
                {
                  name: 'Итальянские каникулы',
                  description: 'Тур по историческим городам Италии: Рим, Венеция, Флоренция',
                  price: 1200,
                  duration: 6,
                  destination: 'Италия',
                  image_url: 'https://images.unsplash.com/photo-1529260830199-42c24126f198',
                  available_spots: 15,
                  transport_type: 'Самолет + автобусные переезды',
                  departure_location: 'Аэропорт, терминал B',
                  departure_time: '10:45',
                  tour_guide: 'Елена Сидорова - историк искусств',
                  included_services: 'Авиаперелет, отели 3-4*, завтраки, экскурсии в музеи, групповой трансфер'
                },
                {
                  name: 'Загадочная Греция',
                  description: 'Отдых на лучших пляжах греческих островов и экскурсии по древним руинам',
                  price: 950,
                  duration: 8,
                  destination: 'Греция',
                  image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077',
                  available_spots: 25,
                  transport_type: 'Самолет + паром',
                  departure_location: 'Аэропорт, терминал D',
                  departure_time: '09:15',
                  tour_guide: 'Дмитрий Иванов - специалист по греческой культуре',
                  included_services: 'Перелет, отели 4*, завтраки и ужины, экскурсии, трансферы, паромные переправы'
                }
              ];
              
              const insertTour = 'INSERT INTO tours (name, description, price, duration, destination, image_url, available_spots, transport_type, departure_location, departure_time, tour_guide, included_services) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
              
              // Последовательное добавление туров с использованием промисов
              try {
                for (const tour of tours) {
                  await new Promise((res, rej) => {
                    db.run(insertTour, [
                      tour.name, 
                      tour.description, 
                      tour.price, 
                      tour.duration, 
                      tour.destination, 
                      tour.image_url, 
                      tour.available_spots,
                      tour.transport_type,
                      tour.departure_location,
                      tour.departure_time,
                      tour.tour_guide,
                      tour.included_services
                    ], function(err) {
                      if (err) rej(err);
                      else res();
                    });
                  });
                }
                console.log('Добавлены тестовые туры');
              } catch (error) {
                console.error('Ошибка при добавлении тестовых туров:', error);
                reject(error);
                return;
              }
            }
            resolve();
          });
        }
      });
    });
  };
  
  const createBookingsTable = () => {
    return new Promise((resolve, reject) => {
      // Создание таблицы бронирований
      db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        tour_id INTEGER NOT NULL,
        booking_date TEXT NOT NULL,
        participants INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        total_price REAL NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(tour_id) REFERENCES tours(id)
      )`, (err) => {
        if (err) {
          console.error('Ошибка при создании таблицы bookings:', err.message);
          reject(err);
        } else {
          console.log('Таблица bookings создана или уже существует');
          resolve();
        }
      });
    });
  };
  
  const createReviewsTable = () => {
    return new Promise((resolve, reject) => {
      // Создание таблицы отзывов
      db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        tour_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(tour_id) REFERENCES tours(id)
      )`, (err) => {
        if (err) {
          console.error('Ошибка при создании таблицы reviews:', err.message);
          reject(err);
        } else {
          console.log('Таблица reviews создана или уже существует');
          resolve();
        }
      });
    });
  };
  
  // Последовательно выполняем создание таблиц
  createUsersTable()
    .then(() => createToursTable())
    .then(() => createBookingsTable())
    .then(() => createReviewsTable())
    .then(() => {
      console.log('База данных успешно инициализирована');
    })
    .catch(err => {
      console.error('Ошибка при инициализации базы данных:', err);
    });
}

// Middleware для проверки токена JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ error: 'Требуется авторизация' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Недействительный токен' });
    req.user = user;
    next();
  });
}

// Middleware для проверки роли администратора
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
  }
  next();
}

// Маршруты авторизации
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Требуется имя пользователя и пароль' });
  }
  
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    
    try {
      const match = await bcrypt.compare(password, user.password);
      
      if (match) {
        const userInfo = { id: user.id, username: user.username, role: user.role };
        const token = jwt.sign(userInfo, JWT_SECRET, { expiresIn: '24h' });
        
        return res.json({ token, user: userInfo });
      } else {
        return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
});

// Регистрация нового пользователя
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  
  console.log('Регистрация пользователя:', { username, hasPassword: !!password });
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Требуется имя пользователя и пароль' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Пароль должен содержать не менее 6 символов' });
  }
  
  try {
    // Проверка, существует ли уже пользователь с таким именем
    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, row) => {
      if (err) {
        console.error('Ошибка при проверке существования пользователя:', err.message);
        return res.status(500).json({ error: 'Ошибка сервера при проверке имени пользователя' });
      }
      
      if (row) {
        return res.status(400).json({ error: 'Пользователь с таким именем уже существует' });
      }
      
      try {
        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Сохранение нового пользователя
        db.run(
          'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
          [username, hashedPassword, 'user'],
          function(err) {
            if (err) {
              console.error('Ошибка при сохранении пользователя:', err.message);
              return res.status(500).json({ error: 'Ошибка сервера при сохранении пользователя' });
            }
            
            const userId = this.lastID;
            
            // Создание токена
            const userInfo = { id: userId, username, role: 'user' };
            const token = jwt.sign(userInfo, JWT_SECRET, { expiresIn: '24h' });
            
            return res.status(201).json({ token, user: userInfo });
          }
        );
      } catch (error) {
        console.error('Ошибка при хешировании пароля:', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при обработке пароля' });
      }
    });
  } catch (error) {
    console.error('Общая ошибка при регистрации:', error.message);
    return res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

// Маршруты для туров (публичный доступ)
app.get('/api/tours', (req, res) => {
  db.all('SELECT * FROM tours', [], (err, tours) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(tours);
  });
});

app.get('/api/tours/:id', (req, res) => {
  db.get('SELECT * FROM tours WHERE id = ?', [req.params.id], (err, tour) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!tour) {
      return res.status(404).json({ error: 'Тур не найден' });
    }
    res.json(tour);
  });
});

// =================== МАРШРУТЫ ДЛЯ ОТЗЫВОВ ===================

// Получить все отзывы для конкретного тура
app.get('/api/tours/:id/reviews', (req, res) => {
  const tourId = req.params.id;
  
  db.all(
    `SELECT r.*, u.username 
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.tour_id = ?
     ORDER BY r.created_at DESC`,
    [tourId],
    (err, reviews) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(reviews);
    }
  );
});

// Добавить отзыв (требуется авторизация)
app.post('/api/tours/:id/reviews', authenticateToken, (req, res) => {
  const tourId = req.params.id;
  const userId = req.user.id;
  const { rating, text } = req.body;
  
  console.log('Добавление отзыва:', { tourId, userId, rating, text });
  
  if (!rating || !text) {
    return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
  }
  
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Рейтинг должен быть от 1 до 5' });
  }
  
  // Проверяем, существует ли тур
  db.get('SELECT id FROM tours WHERE id = ?', [tourId], (err, tour) => {
    if (err) {
      console.error('Ошибка при проверке тура:', err.message);
      return res.status(500).json({ error: 'Ошибка при проверке тура: ' + err.message });
    }
    
    if (!tour) {
      return res.status(404).json({ error: 'Тур не найден' });
    }
    
    // Добавляем отзыв
    db.run(
      'INSERT INTO reviews (user_id, tour_id, rating, text) VALUES (?, ?, ?, ?)',
      [userId, tourId, rating, text],
      function(err) {
        if (err) {
          console.error('Ошибка при добавлении отзыва:', err.message);
          return res.status(500).json({ error: 'Ошибка при добавлении отзыва: ' + err.message });
        }
        
        db.get(
          'SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.id = ?',
          [this.lastID],
          (err, review) => {
            if (err) {
              console.error('Ошибка при получении данных отзыва:', err.message);
              return res.status(500).json({ error: 'Ошибка при получении данных отзыва: ' + err.message });
            }
            
            console.log('Отзыв успешно добавлен:', review);
            res.status(201).json(review);
          }
        );
      }
    );
  });
});

// Удалить отзыв (только администратор)
app.delete('/api/reviews/:id', authenticateToken, isAdmin, (req, res) => {
  const reviewId = req.params.id;
  
  db.run('DELETE FROM reviews WHERE id = ?', [reviewId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }
    
    res.json({ message: 'Отзыв успешно удален' });
  });
});

// Получение всех отзывов (для администратора)
app.get('/api/admin/reviews', (req, res) => {
  // Сначала проверим, есть ли отзывы в базе
  db.get('SELECT COUNT(*) as count FROM reviews', [], (err, row) => {
    if (err) {
      console.error('Ошибка при проверке таблицы отзывов:', err);
      return res.status(500).json({ error: 'Ошибка при проверке отзывов: ' + err.message });
    }
    
    // Если отзывов нет, сразу возвращаем пустой массив
    if (row.count === 0) {
      return res.json([]);
    }
    
    // Если отзывы есть, получаем их
    db.all(
      `SELECT r.*, u.username, t.name as tour_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN tours t ON r.tour_id = t.id
       ORDER BY r.created_at DESC`,
      [],
      (err, reviews) => {
        if (err) {
          console.error('Ошибка при получении отзывов:', err);
          return res.status(500).json({ error: 'Ошибка при получении отзывов: ' + err.message });
        }
        
        // Заменяем null значения на значения по умолчанию
        const processedReviews = reviews.map(review => ({
          ...review,
          username: review.username || 'Удаленный пользователь',
          tour_name: review.tour_name || 'Удаленный тур'
        }));
        
        res.json(processedReviews);
      }
    );
  });
});

// Маршруты для бронирования (требуется авторизация)
app.post('/api/bookings', authenticateToken, (req, res) => {
  const { tour_id, booking_date, participants } = req.body;
  const user_id = req.user.id;
  
  if (!tour_id || !booking_date || !participants) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }
  
  // Проверка наличия свободных мест
  db.get('SELECT price, available_spots FROM tours WHERE id = ?', [tour_id], (err, tour) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!tour) {
      return res.status(404).json({ error: 'Тур не найден' });
    }
    
    if (tour.available_spots < participants) {
      return res.status(400).json({ error: 'Недостаточно свободных мест' });
    }
    
    const total_price = tour.price * participants;
    
    // Создание бронирования
    db.run(
      'INSERT INTO bookings (user_id, tour_id, booking_date, participants, status, total_price) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, tour_id, booking_date, participants, 'pending', total_price],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Обновление количества свободных мест
        db.run(
          'UPDATE tours SET available_spots = available_spots - ? WHERE id = ?',
          [participants, tour_id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            
            res.status(201).json({
              id: this.lastID,
              user_id,
              tour_id,
              booking_date,
              participants,
              status: 'pending',
              total_price
            });
          }
        );
      }
    );
  });
});

// Получить все бронирования пользователя
app.get('/api/user/bookings', authenticateToken, (req, res) => {
  // Сначала проверим, что пользователь существует
  db.get('SELECT id FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      console.error('Ошибка при проверке пользователя:', err);
      return res.status(500).json({ error: 'Ошибка при проверке пользователя' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Сначала получим основные данные о бронированиях
    db.all(
      `SELECT b.*, t.name as tour_name, t.destination
       FROM bookings b
       JOIN tours t ON b.tour_id = t.id
       WHERE b.user_id = ?`,
      [req.user.id],
      (err, bookings) => {
        if (err) {
          console.error('Ошибка при получении бронирований:', err);
          return res.status(500).json({ error: 'Ошибка при получении бронирований' });
        }
        
        // Проверим, есть ли дополнительные поля в таблице tours
        db.get('PRAGMA table_info(tours)', [], (err, columns) => {
          if (err) {
            console.error('Ошибка при проверке структуры таблицы tours:', err);
            
            // Если не можем проверить структуру, просто вернем основные данные
            return res.json(bookings.map(booking => ({
              ...booking,
              transport_type: 'Автобус',
              departure_location: 'Центральный автовокзал',
              departure_time: '08:00',
              tour_guide: 'Опытный гид',
              included_services: 'Проживание, завтраки, экскурсии'
            })));
          }
          
          // Добавим значения по умолчанию для новых полей
          const result = bookings.map(booking => ({
            ...booking,
            transport_type: booking.transport_type || 'Автобус',
            departure_location: booking.departure_location || 'Центральный автовокзал',
            departure_time: booking.departure_time || '08:00',
            tour_guide: booking.tour_guide || 'Опытный гид',
            included_services: booking.included_services || 'Проживание, завтраки, экскурсии'
          }));
          
          res.json(result);
        });
      }
    );
  });
});

// Отмена бронирования пользователем
app.put('/api/user/bookings/:id/cancel', authenticateToken, (req, res) => {
  const bookingId = req.params.id;
  const userId = req.user.id;
  
  // Проверяем, существует ли бронирование и принадлежит ли оно пользователю
  db.get(
    'SELECT b.*, t.available_spots FROM bookings b JOIN tours t ON b.tour_id = t.id WHERE b.id = ? AND b.user_id = ?',
    [bookingId, userId],
    (err, booking) => {
      if (err) {
        console.error('Ошибка при поиске бронирования:', err);
        return res.status(500).json({ error: 'Ошибка при поиске бронирования' });
      }
      
      if (!booking) {
        return res.status(404).json({ error: 'Бронирование не найдено или у вас нет прав для его отмены' });
      }
      
      // Если бронирование уже отменено, возвращаем успех
      if (booking.status === 'cancelled') {
        return res.json({ id: bookingId, status: 'cancelled', message: 'Бронирование уже отменено' });
      }
      
      // Обновляем статус бронирования
      db.run(
        'UPDATE bookings SET status = ? WHERE id = ?',
        ['cancelled', bookingId],
        function(err) {
          if (err) {
            console.error('Ошибка при отмене бронирования:', err);
            return res.status(500).json({ error: 'Ошибка при отмене бронирования' });
          }
          
          if (this.changes === 0) {
            return res.status(404).json({ error: 'Не удалось отменить бронирование' });
          }
          
          // Возвращаем свободные места для тура
          db.run(
            'UPDATE tours SET available_spots = available_spots + ? WHERE id = ?',
            [booking.participants, booking.tour_id],
            function(err) {
              if (err) {
                console.error('Ошибка при обновлении свободных мест:', err);
                // Продолжаем выполнение, даже если не получилось обновить количество мест
              }
              
              res.json({ 
                id: bookingId, 
                status: 'cancelled', 
                message: 'Бронирование успешно отменено',
                updatedSpots: booking.available_spots + booking.participants
              });
            }
          );
        }
      );
    }
  );
});

// Маршруты админа (требуется роль администратора)

// Получить все бронирования (для админа)
app.get('/api/admin/bookings', authenticateToken, isAdmin, (req, res) => {
  db.all(
    `SELECT b.*, u.username, t.name as tour_name 
     FROM bookings b
     JOIN users u ON b.user_id = u.id
     JOIN tours t ON b.tour_id = t.id`,
    [],
    (err, bookings) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(bookings);
    }
  );
});

// Обновить статус бронирования (для админа)
app.put('/api/admin/bookings/:id', authenticateToken, isAdmin, (req, res) => {
  const { status } = req.body;
  const bookingId = req.params.id;
  
  if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Требуется действительный статус' });
  }
  
  db.run(
    'UPDATE bookings SET status = ? WHERE id = ?',
    [status, bookingId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Бронирование не найдено' });
      }
      
      // Если бронирование отменено, вернуть свободные места
      if (status === 'cancelled') {
        db.get('SELECT tour_id, participants FROM bookings WHERE id = ?', [bookingId], (err, booking) => {
          if (err || !booking) return;
          
          db.run(
            'UPDATE tours SET available_spots = available_spots + ? WHERE id = ?',
            [booking.participants, booking.tour_id]
          );
        });
      }
      
      res.json({ id: bookingId, status });
    }
  );
});

// Управление турами (для админа)
app.post('/api/admin/tours', authenticateToken, isAdmin, (req, res) => {
  const { name, description, price, duration, destination, image_url, available_spots } = req.body;
  
  if (!name || !price || !duration || !destination || !available_spots) {
    return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
  }
  
  db.run(
    'INSERT INTO tours (name, description, price, duration, destination, image_url, available_spots) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, description, price, duration, destination, image_url, available_spots],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.status(201).json({
        id: this.lastID,
        name,
        description,
        price,
        duration,
        destination,
        image_url,
        available_spots
      });
    }
  );
});

app.put('/api/admin/tours/:id', authenticateToken, isAdmin, (req, res) => {
  const tourId = req.params.id;
  const { name, description, price, duration, destination, image_url, available_spots } = req.body;
  
  if (!name || !price || !duration || !destination || !available_spots) {
    return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
  }
  
  db.run(
    'UPDATE tours SET name = ?, description = ?, price = ?, duration = ?, destination = ?, image_url = ?, available_spots = ? WHERE id = ?',
    [name, description, price, duration, destination, image_url, available_spots, tourId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Тур не найден' });
      }
      
      res.json({
        id: tourId,
        name,
        description,
        price,
        duration,
        destination,
        image_url,
        available_spots
      });
    }
  );
});

app.delete('/api/admin/tours/:id', authenticateToken, isAdmin, (req, res) => {
  const tourId = req.params.id;
  
  // Проверяем, есть ли активные бронирования для этого тура
  db.get('SELECT COUNT(*) as count FROM bookings WHERE tour_id = ? AND status != "cancelled"', [tourId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (row.count > 0) {
      return res.status(400).json({ error: 'Невозможно удалить тур с активными бронированиями' });
    }
    
    db.run('DELETE FROM tours WHERE id = ?', [tourId], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Тур не найден' });
      }
      
      res.json({ message: 'Тур успешно удален' });
    });
  });
});

// Запуск сервера только если файл запущен напрямую (не через require)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  }); 
}

// Экспортируем приложение для тестирования
module.exports = app; 