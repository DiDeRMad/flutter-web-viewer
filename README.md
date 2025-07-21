# 🎮 Epic Battle Arena

**Многопользовательская онлайн арена сражений** с элементами MMORPG, стратегии и action-геймплея в реальном времени.

## 🚀 Особенности

### 🎯 Игровые механики
- **Real-time PvP сражения** до 100 игроков одновременно
- **Система классов персонажей** с уникальными способностями
- **Прокачка и экипировка** с тысячами предметов
- **Гильдии и альянсы** для командной игры
- **Турниры и рейтинговые сезоны**
- **Кастомизация персонажей** и база/замок
- **Экономическая система** с торговлей между игроками

### 🛠️ Технические особенности
- **WebSocket** для мгновенного отклика в сражениях
- **Advanced matchmaking** система
- **Anti-cheat** защита
- **Кроссплатформенность** (Web, Mobile ready)
- **Микросервисная архитектура**
- **Redis** для быстрого кэширования
- **PostgreSQL** для надежного хранения данных

## 🏗️ Архитектура

```
epic-battle-arena/
├── client/                 # React + TypeScript фронтенд
│   ├── src/
│   │   ├── components/     # UI компоненты
│   │   ├── game/          # Игровая логика
│   │   ├── services/      # API и WebSocket
│   │   ├── store/         # State management
│   │   └── utils/         # Утилиты
├── server/                # Node.js + Express бэкенд
│   ├── src/
│   │   ├── controllers/   # API контроллеры
│   │   ├── services/      # Бизнес-логика
│   │   ├── models/        # Модели данных
│   │   ├── middleware/    # Промежуточное ПО
│   │   ├── websocket/     # WebSocket обработчики
│   │   └── game/          # Игровой движок
├── shared/                # Общий код
├── docker/                # Docker конфигурация
└── docs/                  # Документация
```

## 🎮 Игровой процесс

### Режимы игры
1. **Battle Royale** - Выживание до последнего (50-100 игроков)
2. **Team Deathmatch** - Командные сражения 5v5, 10v10
3. **Conquest** - Захват и удержание территорий
4. **Guild Wars** - Масштабные войны гильдий
5. **PvE Dungeons** - Кооперативные подземелья
6. **Arena 1v1** - Дуэли с рейтинговой системой

### Классы персонажей
- 🗡️ **Warrior** - Ближний бой, высокая защита
- 🏹 **Archer** - Дальний бой, мобильность
- ⚡ **Mage** - Магические атаки, контроль
- 🛡️ **Paladin** - Танк с лечением
- 🗡️ **Assassin** - Скрытность и критический урон
- 🔮 **Necromancer** - Призыв миньонов

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker (опционально)

### Установка

```bash
# Клонирование и настройка
git clone https://github.com/epic-games/epic-battle-arena.git
cd epic-battle-arena

# Установка всех зависимостей
npm run setup

# Настройка базы данных
cp server/.env.example server/.env
# Отредактируйте server/.env с вашими настройками БД

# Запуск в режиме разработки
npm run dev
```

### Docker развертывание

```bash
# Сборка и запуск всех сервисов
npm run docker:build
npm run docker:up

# Игра будет доступна на http://localhost:3000
```

## 🎯 API эндпоинты

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход
- `GET /api/auth/profile` - Профиль пользователя

### Игровые данные
- `GET /api/player/stats` - Статистика игрока
- `GET /api/player/inventory` - Инвентарь
- `POST /api/player/upgrade` - Прокачка персонажа
- `GET /api/leaderboard` - Таблица лидеров

### Матчмейкинг
- `POST /api/matchmaking/queue` - Поиск игры
- `DELETE /api/matchmaking/queue` - Отмена поиска
- `GET /api/matchmaking/status` - Статус поиска

### Гильдии
- `GET /api/guilds` - Список гильдий
- `POST /api/guilds` - Создание гильдии
- `POST /api/guilds/:id/join` - Вступление в гильдию

## 🎮 WebSocket события

### Клиент → Сервер
- `game:join` - Присоединение к игре
- `game:move` - Движение персонажа
- `game:attack` - Атака
- `game:cast_spell` - Использование заклинания
- `chat:message` - Отправка сообщения

### Сервер → Клиент  
- `game:state_update` - Обновление состояния игры
- `game:player_joined` - Игрок присоединился
- `game:player_left` - Игрок покинул игру
- `game:match_end` - Конец матча
- `chat:new_message` - Новое сообщение

## 🏆 Система достижений

- **First Blood** - Первое убийство
- **Killing Spree** - 5 убийств подряд
- **Legendary** - 15 убийств подряд
- **Guild Master** - Создание гильдии
- **Arena Champion** - 100 побед в арене
- **Treasure Hunter** - Найти 1000 предметов

## 🛡️ Безопасность

- JWT аутентификация
- Rate limiting для API
- Input validation и sanitization
- Anti-cheat система
- Защита от DDoS атак
- Шифрование критических данных

## 📊 Мониторинг и аналитика

- Реальное время онлайн
- Метрики производительности
- Логирование действий игроков
- A/B тестирование игровых механик
- Система отчетов и аналитики

## 🤝 Участие в разработке

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения с тестами
4. Создайте Pull Request

## 📞 Поддержка

- 📧 Email: support@epic-battle-arena.com
- 💬 Discord: https://discord.gg/epic-battle-arena
- 🐛 Issues: https://github.com/epic-games/epic-battle-arena/issues

## 📄 Лицензия

MIT License. См. [LICENSE](LICENSE) для деталей.

---

**🎮 Готов к эпическим сражениям? Присоединяйся к битве!**