const request = require('supertest');
const assert = require('assert');
const bcrypt = require('bcrypt');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Тестируем сервер без его перезапуска
const app = require('./server');

// Вспомогательные переменные для тестов
let adminToken;
let userToken;
let testTourId;
let testBookingId;
let testReviewId;

// Функция для красивого вывода результатов тестов
function logTestResult(testName, success, error = null) {
  if (success) {
    console.log(`✅ ТЕСТ ПРОЙДЕН: ${testName}`);
  } else {
    console.log(`❌ ТЕСТ НЕ ПРОЙДЕН: ${testName}`);
    if (error) console.error(`   Ошибка: ${error.message || error}`);
  }
}

// Функция для запуска всех тестов последовательно
async function runTests() {
  console.log('\n=== НАЧАЛО ИНТЕГРАЦИОННЫХ ТЕСТОВ СЕРВЕРА ===\n');
  
  // Массив с тестами в порядке их выполнения
  const tests = [
    testServerIsRunning,
    testUserRegistration,
    testUserLogin,
    testAdminLogin,
    testGetTours,
    testGetSingleTour,
    testCreateTour,
    testUpdateTour,
    testBookTour,
    testGetUserBookings,
    testAddReview,
    testGetTourReviews,
    testCancelBooking,
    testGetAllBookingsAsAdmin,
    testUpdateBookingStatusAsAdmin,
    testGetAllReviewsAsAdmin,
    testDeleteReviewAsAdmin,
    testDeleteTour,
    testInvalidRegistrationData,
    testAuthorizationRequired
  ];
  
  // Запускаем тесты последовательно
  let passedTests = 0;
  
  for (const test of tests) {
    try {
      await test();
      passedTests++;
    } catch (error) {
      logTestResult(test.name, false, error);
    }
  }
  
  // Вывод итогов тестирования
  console.log('\n=== ИТОГИ ТЕСТИРОВАНИЯ ===');
  console.log(`Всего тестов: ${tests.length}`);
  console.log(`Успешно пройдено: ${passedTests}`);
  console.log(`Не пройдено: ${tests.length - passedTests}`);
  
  if (passedTests === tests.length) {
    console.log('\n✨ ВСЕ ТЕСТЫ УСПЕШНО ПРОЙДЕНЫ! СЕРВЕР РАБОТАЕТ КОРРЕКТНО! ✨\n');
  } else {
    console.log('\n⚠️ ВНИМАНИЕ: Некоторые тесты не прошли. Проверьте журнал ошибок. ⚠️\n');
  }
}

// 1. Проверка работоспособности сервера
async function testServerIsRunning() {
  const response = await request(app).get('/api/tours');
  assert.equal(response.status, 200);
  logTestResult('Проверка работоспособности сервера', true);
}

// 2. Тест регистрации нового пользователя
async function testUserRegistration() {
  const testUser = {
    username: `testuser_${Date.now()}`,
    password: 'password123'
  };
  
  const response = await request(app)
    .post('/api/auth/register')
    .send(testUser);
    
  assert.equal(response.status, 201);
  assert.ok(response.body.token);
  assert.equal(response.body.user.username, testUser.username);
  assert.equal(response.body.user.role, 'user');
  
  userToken = response.body.token;
  logTestResult('Регистрация нового пользователя', true);
}

// 3. Тест авторизации пользователя
async function testUserLogin() {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ username: 'user', password: 'user' });
    
  assert.equal(response.status, 200);
  assert.ok(response.body.token);
  assert.equal(response.body.user.username, 'user');
  
  if (!userToken) userToken = response.body.token;
  logTestResult('Авторизация пользователя', true);
}

// 4. Тест авторизации администратора
async function testAdminLogin() {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'admin' });
    
  assert.equal(response.status, 200);
  assert.ok(response.body.token);
  assert.equal(response.body.user.username, 'admin');
  assert.equal(response.body.user.role, 'admin');
  
  adminToken = response.body.token;
  logTestResult('Авторизация администратора', true);
}

// 5. Получение списка туров
async function testGetTours() {
  const response = await request(app).get('/api/tours');
  
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
  assert.ok(response.body.length > 0);
  
  logTestResult('Получение списка туров', true);
}

// 6. Получение информации об одном туре
async function testGetSingleTour() {
  // Сначала получим список туров
  const toursResponse = await request(app).get('/api/tours');
  const firstTourId = toursResponse.body[0].id;
  
  const response = await request(app).get(`/api/tours/${firstTourId}`);
  
  assert.equal(response.status, 200);
  assert.equal(response.body.id, firstTourId);
  assert.ok(response.body.name);
  
  logTestResult('Получение информации о туре', true);
}

// 7. Создание нового тура (только администратор)
async function testCreateTour() {
  const newTour = {
    name: 'Тестовый тур',
    description: 'Тур создан для тестирования API',
    price: 999.99,
    duration: 5,
    destination: 'Тестовое направление',
    image_url: 'https://example.com/test-image.jpg',
    available_spots: 10
  };
  
  const response = await request(app)
    .post('/api/admin/tours')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(newTour);
    
  assert.equal(response.status, 201);
  assert.equal(response.body.name, newTour.name);
  assert.equal(response.body.price, newTour.price);
  
  testTourId = response.body.id;
  logTestResult('Создание нового тура', true);
}

// 8. Обновление тура (только администратор)
async function testUpdateTour() {
  const updatedTour = {
    name: 'Обновленный тестовый тур',
    description: 'Описание обновлено для тестирования API',
    price: 1099.99,
    duration: 6,
    destination: 'Обновленное направление',
    image_url: 'https://example.com/updated-test-image.jpg',
    available_spots: 15
  };
  
  const response = await request(app)
    .put(`/api/admin/tours/${testTourId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send(updatedTour);
    
  assert.equal(response.status, 200);
  assert.equal(response.body.name, updatedTour.name);
  assert.equal(response.body.price, updatedTour.price);
  
  logTestResult('Обновление тура', true);
}

// 9. Бронирование тура
async function testBookTour() {
  const booking = {
    tour_id: testTourId,
    booking_date: new Date().toISOString().split('T')[0],
    participants: 2
  };
  
  const response = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${userToken}`)
    .send(booking);
    
  assert.equal(response.status, 201);
  assert.equal(response.body.tour_id, booking.tour_id);
  assert.equal(response.body.participants, booking.participants);
  
  testBookingId = response.body.id;
  logTestResult('Бронирование тура', true);
}

// 10. Получение бронирований пользователя
async function testGetUserBookings() {
  const response = await request(app)
    .get('/api/user/bookings')
    .set('Authorization', `Bearer ${userToken}`);
    
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
  assert.ok(response.body.some(booking => booking.id === testBookingId));
  
  logTestResult('Получение бронирований пользователя', true);
}

// 11. Добавление отзыва о туре
async function testAddReview() {
  const review = {
    rating: 5,
    text: 'Отличный тур, всем рекомендую!'
  };
  
  const response = await request(app)
    .post(`/api/tours/${testTourId}/reviews`)
    .set('Authorization', `Bearer ${userToken}`)
    .send(review);
    
  assert.equal(response.status, 201);
  assert.equal(response.body.tour_id, testTourId);
  assert.equal(response.body.rating, review.rating);
  assert.equal(response.body.text, review.text);
  
  testReviewId = response.body.id;
  logTestResult('Добавление отзыва', true);
}

// 12. Получение отзывов о туре
async function testGetTourReviews() {
  const response = await request(app).get(`/api/tours/${testTourId}/reviews`);
  
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
  assert.ok(response.body.some(review => review.id === testReviewId));
  
  logTestResult('Получение отзывов о туре', true);
}

// 13. Отмена бронирования
async function testCancelBooking() {
  const response = await request(app)
    .put(`/api/user/bookings/${testBookingId}/cancel`)
    .set('Authorization', `Bearer ${userToken}`);
    
  assert.equal(response.status, 200);
  assert.equal(response.body.id, testBookingId);
  assert.equal(response.body.status, 'cancelled');
  
  logTestResult('Отмена бронирования', true);
}

// 14. Получение всех бронирований (для администратора)
async function testGetAllBookingsAsAdmin() {
  const response = await request(app)
    .get('/api/admin/bookings')
    .set('Authorization', `Bearer ${adminToken}`);
    
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
  
  logTestResult('Получение всех бронирований (админ)', true);
}

// 15. Обновление статуса бронирования (для администратора)
async function testUpdateBookingStatusAsAdmin() {
  // Создадим новое бронирование для теста
  const booking = {
    tour_id: testTourId,
    booking_date: new Date().toISOString().split('T')[0],
    participants: 1
  };
  
  const bookingResponse = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${userToken}`)
    .send(booking);
    
  const newBookingId = bookingResponse.body.id;
  
  // Обновим статус этого бронирования
  const response = await request(app)
    .put(`/api/admin/bookings/${newBookingId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'confirmed' });
    
  assert.equal(response.status, 200);
  assert.equal(response.body.id, newBookingId);
  assert.equal(response.body.status, 'confirmed');
  
  logTestResult('Обновление статуса бронирования (админ)', true);
}

// 16. Получение всех отзывов (для администратора)
async function testGetAllReviewsAsAdmin() {
  const response = await request(app)
    .get('/api/admin/reviews')
    .set('Authorization', `Bearer ${adminToken}`);
    
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
  
  logTestResult('Получение всех отзывов (админ)', true);
}

// 17. Удаление отзыва (только администратор)
async function testDeleteReviewAsAdmin() {
  const response = await request(app)
    .delete(`/api/reviews/${testReviewId}`)
    .set('Authorization', `Bearer ${adminToken}`);
    
  assert.equal(response.status, 200);
  assert.ok(response.body.message.includes('удален'));
  
  logTestResult('Удаление отзыва (админ)', true);
}

// 18. Удаление тура (только администратор)
async function testDeleteTour() {
  // Сначала получим все бронирования для тестового тура
  const bookingsResponse = await request(app)
    .get('/api/admin/bookings')
    .set('Authorization', `Bearer ${adminToken}`);
  
  // Отменяем все бронирования для тестового тура
  for (const booking of bookingsResponse.body) {
    if (booking.tour_id === testTourId) {
      await request(app)
        .put(`/api/admin/bookings/${booking.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'cancelled' });
    }
  }
  
  // Теперь пробуем удалить тур
  const response = await request(app)
    .delete(`/api/admin/tours/${testTourId}`)
    .set('Authorization', `Bearer ${adminToken}`);
    
  assert.equal(response.status, 200);
  assert.ok(response.body.message.includes('удален'));
  
  logTestResult('Удаление тура (админ)', true);
}

// 19. Проверка отказа в регистрации с некорректными данными
async function testInvalidRegistrationData() {
  // Тест с коротким паролем
  const response = await request(app)
    .post('/api/auth/register')
    .send({ username: 'testuser', password: '123' });
    
  assert.equal(response.status, 400);
  assert.ok(response.body.error.includes('не менее 6 символов'));
  
  logTestResult('Проверка отказа в регистрации с некорректными данными', true);
}

// 20. Проверка требования авторизации для защищенных маршрутов
async function testAuthorizationRequired() {
  // Попытка создать бронирование без токена
  const booking = {
    tour_id: 1,
    booking_date: new Date().toISOString().split('T')[0],
    participants: 1
  };
  
  const response = await request(app)
    .post('/api/bookings')
    .send(booking);
    
  assert.equal(response.status, 401);
  
  logTestResult('Проверка требования авторизации', true);
}

// Запускаем все тесты
runTests();

module.exports = { runTests }; 