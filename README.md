# TaskFlow - Organize Your Universe 🌟

A feature-rich, modern to-do list application with cosmic themes, advanced task management, and a beautiful user interface. Built with Node.js, Express, and SQLite.

![TaskFlow Banner](https://img.shields.io/badge/TaskFlow-Universe-db2777?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)

## 📋 Table of Contents
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Installation & Setup](#-installation--setup)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Technologies Used](#-technologies-used)
- [API Endpoints](#-api-endpoints)

## ✨ Features

### 🎯 Core Task Management
- **Create & Edit Tasks** - Add tasks with titles, descriptions, priorities, and due dates
- **Task Types** - Individual tasks or Group tasks with subtasks
- **Priority Levels** - Low, Medium, and High priorities with color coding
- **Mark Complete** - Toggle completion status with visual feedback
- **Inline Editing** - Click to edit task details directly
- **Duplicate Tasks** - Create copies of existing tasks quickly
- **Delete Tasks** - Remove tasks with confirmation

### 📊 Advanced Organization
- **Subtasks & Groups** - Create hierarchical task structures with unlimited subtasks
- **Progress Tracking** - Visual progress bars showing completion percentage
- **Smart Filtering** - View All, Active, or Completed tasks with real-time counts
- **Pin Tasks** - Keep important tasks at the top
- **Context Menu** - Right-click for quick actions (edit, duplicate, pin, delete, etc.)
- **Expand/Collapse** - Toggle visibility of subtasks in group tasks

### 🎨 Visual Customization
- **8 Beautiful Themes**:
    - 🌌 **Galactic** - Cosmic design with stellar animations
    - 💼 **Corporate** - Clean, professional workspace
    - 🌿 **Nature** - Fresh and organic feel
    - 🌙 **Dark Mode** - Easy on the eyes
    - ☁️ **Sky Dreams** - Serene with cloud animations
    - ⚡ **Neon Nights** - Cyberpunk style with glowing effects
    - 💗 **Pink & Black** - Bold and elegant contrast
    - 🌸 **Blooming Garden** - Floral paradise with animated petals
- **Custom Task Colors** - Personalize individual task cards with color picker
- **Resizable Cards** - Adjust task card sizes with drag handles
- **Flexible Layouts** - Grid view or Fluid mode with drag & drop positioning

### 👤 User Management
- **User Registration** - Create accounts with secure password hashing
- **User Login** - Session-based authentication with 24-hour tokens
- **Remember Me** - Save login credentials
- **Theme Persistence** - Your theme choice is saved
- **First-time Setup** - Theme selection wizard for new users

### 💫 User Experience
- **Smooth Animations** - Polished transitions and effects
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Real-time Updates** - Changes reflect immediately
- **Notifications** - Clear success/error feedback
- **Keyboard Support** - Escape to cancel, Enter to save
- **Auto-save** - All changes saved automatically

## 🚀 Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v14.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### Verify Installation
Check your Node.js and npm versions:
```bash
node --version
npm --version
```

## 📦 Installation & Setup

Follow these steps to set up TaskFlow on your local machine:

### 1. Clone the Repository
```bash
git clone https://github.com/notabzdev/TodoApp.git
cd TodoApp
```

### 2. Install Dependencies
Install the required packages in the root directory:
```bash
npm install
```

This will install:
- `express` - Web framework
- `sqlite3` - Database
- `bcryptjs` - Password hashing
- `cors` - Cross-origin resource sharing

### 3. Database Setup
The SQLite database (`identifier.sqlite`) will be created automatically when you first start the server. The application will create the following tables:
- `users` - User accounts
- `user_sessions` - Authentication sessions
- `tasks` - Individual and group tasks
- `subtasks` - Subtasks within group tasks

**Note:** The database file `identifier.sqlite` is already in the root directory and will be initialized on first run.

### 4. Start the Application
Start the server from the Backend directory:
```bash
cd Backend
node server.js
```

You should see:
```
Server running at http://localhost:3000
Landing: http://localhost:3000
Login: http://localhost:3000/login
Signup: http://localhost:3000/signup
Dashboard: http://localhost:3000/dashboard
```

### 5. Open in Browser
Navigate to:
```
http://localhost:3000
```

### 6. Create Your Account
1. Click **"Create Account"** on the landing page
2. Fill in your name, email, and password
3. Agree to the terms
4. Click **"Create Account"**
5. You'll be redirected to login
6. Choose your favorite theme on first login!

## 🎮 Usage

### Creating Your First Task
1. Click the **"+ New Task"** button in the dashboard
2. Enter a task title (required)
3. Add an optional description
4. Select a priority level (Low/Medium/High)
5. Set a due date (optional)
6. Choose between Individual Task or Task Group
7. Click **"Create Task"**

### Working with Group Tasks
1. Create a task and select **"Task Group"** as the type
2. Once created, click **"+ Add Subtask"** within the group
3. Enter subtask titles and save
4. Check off subtasks as you complete them
5. Watch the progress bar update automatically
6. Click the expand/collapse button (▼) to show/hide subtasks

### Customizing Your Workspace
- **Change Theme**: Click the theme icon in the header
- **Resize Tasks**: Drag the resize handle (⋰) in the bottom-right corner
- **Change Colors**: Right-click a task → Change Color
- **Pin Tasks**: Right-click a task → Pin Task
- **Switch Views**: Toggle between Grid and Fluid mode

### Filtering Tasks
- **All Tasks** - View everything
- **Active** - See only incomplete tasks
- **Completed** - View finished tasks

## 📁 Project Structure

```
taskflow/
├── Backend/
│   ├── server.js              # Main Express server with auth
│   ├── servertasks.js         # Task & subtask API routes
│   ├── database.db            # Backend database created on first time run
│   └── package.json           # Backend dependencies
├── Frontend/
│   ├── Dashboard/
│   │   ├── dashboard.html     # Main dashboard page
│   │   ├── dashboard.css      # Core dashboard styles
│   │   ├── dashboardtwo.css   # Extended styling
│   │   ├── dashboardthree.css # Group task styles
│   │   ├── dashboardfour.css  # Additional UI styles
│   │   ├── canvasmove.css     # Fluid mode drag styles
│   │   ├── dashboard.js       # Main dashboard logic
│   │   ├── dashboardtwo.js    # Task CRUD operations
│   │   ├── dashboardthree.js  # Group task & subtask logic
│   │   ├── dashboardfour.js   # Additional features
│   │   ├── dashboardfive.js   # Extended functionality
│   │   ├── canvasmove.js      # Drag & drop in fluid mode
│   │   ├── resize.js          # Task card resizing
│   │   ├── taskbox.js         # Context menu & interactions
│   │   ├── integration.js     # Component integration
│   │   └── themes.css         # All theme definitions
│   ├── landing.html           # Landing page
│   ├── landing.css            # Landing page styles
│   ├── landing.js             # Landing page animations
│   ├── index.html             # Login page
│   ├── style.css              # Login styles
│   ├── script.js              # Login logic
│   ├── signup.html            # Registration page
│   ├── signup.css             # Registration styles
│   └── signup.js              # Registration logic
├── identifier.sqlite          # SQLite database (auto-generated)
├── package.json               # Root dependencies
└── README.md                  # This file
```


## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Database
- **bcryptjs** - Password hashing and security
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with custom properties and animations
- **Vanilla JavaScript** - No frameworks, pure JS
- **Fetch API** - HTTP requests

### Features
- **RESTful API** - Clean API design
- **Session-based Authentication** - Secure user sessions
- **Responsive Design** - Mobile-first approach
- **CSS Grid & Flexbox** - Modern layouts
- **CSS Custom Properties** - Dynamic theming

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - Create new user account
- `POST /api/login` - User login
- `POST /api/logout` - End session
- `GET /api/user` - Get current user info

### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Subtasks
- `POST /api/tasks/:taskId/subtasks` - Add subtask to group
- `PUT /api/tasks/:taskId/subtasks/:subtaskId` - Update subtask
- `DELETE /api/tasks/:taskId/subtasks/:subtaskId` - Delete subtask

### User Preferences
- `PUT /api/user/theme` - Update user theme


## ⚡Running the Application
1. Extract the project files
2. Run `npm install` in the root directory
3. Run `npm start`
4. Open `http://localhost:3000` in your browser

### Testing the Features
- Create an account at `/signup`
- Try different themes from the theme selector
- Create both individual tasks and group tasks
- Test the filtering system (All/Active/Completed)
- Try resizing and customizing task cards
- Test the subtask functionality in group tasks

### Database
The SQLite database file (`identifier.sqlite`) contains all tables and will be initialized automatically. To reset the database, simply delete the file and restart the server.

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is already in use, modify `Backend/server.js`:
```javascript
const PORT = process.env.PORT || 3001; // Change to different port
```

### Database Issues
Delete `identifier.sqlite` and restart the server to recreate the database.

### Dependencies Not Installing
Try clearing npm cache:
```bash
npm cache clean --force
npm install
```

## 📝 License

This project is licensed for educational purposes.



🌟 If you have any questions or issues, please create an issue in the repository or contact me.
