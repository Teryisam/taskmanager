# Task Management System

## Overview
A simple task management system with user authentication, CRUD operations for tasks, real-time updates using WebSockets, and data persistence using MySQL.

## Features
- User authentication with JWT
- CRUD operations for tasks
- Real-time updates with WebSockets
- Input validation
- Data persistence with MySQL

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd project-root
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file and add the following environment variables:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=taskmanager
   DB_DIALECT=mysql
   JWT_SECRET=your-generated-secret-key
   ```

4. Start the server:
   ```bash
   node server.js
   ```

5. Open `http://localhost:3000` in your browser to view the client.

## API Endpoints

### Authentication

- **POST /api/auth/register**: Register a new user
  - Body: `{ "username": "string", "password": "string" }`

- **POST /api/auth/login**: Login a user
  - Body: `{ "username": "string", "password": "string" }`

### Tasks

- **GET /api/tasks**: Get all tasks (requires JWT)

- **POST /api/tasks**: Create a new task (requires JWT)
  - Body: `{ "title": "string" }`

- **PATCH /api/tasks/:id**: Update a task by ID (requires JWT)
  - Body: `{ "title": "string", "completed": "boolean" }`

- **DELETE /api/tasks/:id**: Delete a task by ID (requires JWT)

## Real-time Updates

The server uses `socket.io` to provide real-time updates for task creation, update, and deletion events. Clients can listen to the following events:

- `taskCreated`
- `taskUpdated`
- `taskDeleted`

## Real-time Updates Implementation

To implement real-time updates, the server emits the following events when a task is created, updated, or deleted. The clients can listen to these events and update the UI accordingly.

### Server-side (Node.js)

When a task is created, updated, or deleted, the server emits the corresponding event:

```javascript
const io = app.get('io');

// Example for task creation
Task.create({ title }).then(task => {
  io.emit('taskCreated', task);
});

// Example for task update
Task.update({ title, completed }, { where: { id: req.params.id } }).then(() => {
  io.emit('taskUpdated', { id: req.params.id, title, completed });
});

// Example for task deletion
Task.destroy({ where: { id: req.params.id } }).then(() => {
  io.emit('taskDeleted', { id: req.params.id });
});
```

### Client-side (JavaScript)

On the client side, you can listen to these events using `socket.io-client`:

```javascript
const socket = io('http://localhost:3000');

socket.on('taskCreated', (task) => {
  console.log('Task created:', task);
  // Update the UI accordingly
});

socket.on('taskUpdated', (task) => {
  console.log('Task updated:', task);
  // Update the UI accordingly
});

socket.on('taskDeleted', (task) => {
  console.log('Task deleted:', task);
  // Update the UI accordingly
});
```

By following these steps, you ensure real-time updates are implemented and clients are notified immediately of any changes in tasks.

## Contributing

If you'd like to contribute to this project, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## License

This project is licensed under the MIT License - see the LICENSE file for details.