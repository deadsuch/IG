#!/bin/bash

echo "**********************************************"
echo "* Запуск туристического агентства через Docker *"
echo "**********************************************"

echo "Сборка и запуск контейнеров..."
docker-compose up -d

echo ""
echo "Проверка статуса контейнеров..."
docker-compose ps

echo ""
echo "Готово! Приложение доступно:"
echo "- Клиент: http://localhost"
echo "- Сервер: http://localhost:5001"
echo ""
echo "Для остановки приложения выполните:"
echo "docker-compose down"
echo "" 