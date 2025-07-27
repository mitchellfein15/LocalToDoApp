# Local Todo App

A beautiful, locally-running todo list application built with Electron, React, and SQLite. Perfect for personal task management without any cloud dependencies.

## Features

-  **Add, edit, and delete todos**
-  **Mark todos as complete/incomplete**
-  **Add descriptions to todos**
-  **Persistent local storage with SQLite**
-  **Beautiful, modern UI with animations**
-  **Desktop application (no browser needed)**
-  **Cross-platform (Windows, Mac, Linux)**
-  **No internet connection required**

## Screenshots

*Coming soon - beautiful gradient UI with todo cards*

## Tech Stack

- **Frontend:** React 18 with modern CSS
- **Backend:** Express.js with SQLite database
- **Desktop:** Electron for cross-platform desktop app
- **Build:** Webpack for bundling
- **Database:** SQLite for local data persistence

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/local-todo-app.git
   cd local-todo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the application**
   ```bash
   npm start
   ```

### Development

- **Start in development mode:**
  ```bash
  npm run dev
  ```

- **Build for production:**
  ```bash
  npm run build
  ```

- **Create executable:**
  ```bash
  npm run dist:win  # Windows
  npm run dist      # All platforms
  ```

## Project Structure

```
LocalToDoApp/
├── src/
│   ├── main/           # Electron main process
│   ├── renderer/       # React frontend
│   │   ├── components/ # React components
│   │   └── services/   # API services
│   ├── server/         # Express backend
│   │   ├── controllers/
│   │   └── routes/
│   └── database/       # SQLite setup
├── public/             # Static assets
├── dist/               # Built files
└── package.json        # Project configuration
```

## API Endpoints

The backend provides these REST endpoints:

- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get single todo
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `PATCH /api/todos/:id/toggle` - Toggle completion

## Database Schema

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Building for Distribution

### Windows
```bash
npm run dist:win
```

### macOS
```bash
npm run dist
```

### Linux
```bash
npm run dist
```

The executable will be created in the `dist` folder.

## Customization

### Styling
- Edit CSS files in `src/renderer/components/`
- Main styles: `src/renderer/App.css`
- Component styles: `TodoList.css`, `TodoItem.css`, `TodoForm.css`

### Features
- Add new features in `src/renderer/components/`
- Modify API endpoints in `src/server/controllers/`
- Update database schema in `src/database/init.js`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with Electron for cross-platform desktop apps
- React for the beautiful UI
- SQLite for reliable local storage
- Express.js for the backend API

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/local-todo-app/issues) page
2. Create a new issue with details about your problem
3. Include your operating system and Node.js version

---

