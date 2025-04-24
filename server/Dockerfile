FROM node:18-alpine

# Создаем директорию приложения
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код приложения
COPY . .

# Открываем порт
EXPOSE 5001

# Запускаем сервер
CMD ["npm", "start"] 