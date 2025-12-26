# 🐝 BuzzHub

A modern, community-driven social platform for users to create communities, share posts, engage with content, and discover personalized recommendations. Built with React + Express.js + MongoDB.

## 🌟 Features

### Core Functionality
- **Community Management** - Create, join, and manage communities with customizable rules and settings
- **Post Creation & Engagement** - Share posts with voting (upvote/downvote) and comment systems
- **User Profiles** - Customizable profiles with bio, profile pictures, karma points, and follower tracking
- **Social Features** - Follow/unfollow users, receive notifications for interactions and follows
- **Admin Dashboard** - Comprehensive moderation and management tools for administrators

### Smart Recommendations
- **Personalized Feed** - AI-powered recommendations based on user engagement and preferences
- **Engagement Tracking** - Track time spent and visit frequency in communities
- **User Preferences** - Manage interest categories and personalization settings
- **Community Suggestions** - Get recommended communities based on engagement patterns

### Moderation & Safety
- **Content Moderation** - Admin tools for flagging and managing reported content
- **User Suspension** - Temporary and permanent account restrictions with logging
- **Report System** - Users can report inappropriate content for review

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.0 - UI library
- **React Router DOM** 7.10.0 - Client-side routing
- **Axios** 1.6.0 - HTTP client
- **Tailwind CSS** 3.4.1 - Styling
- **Vite** 7.2.2 - Build tool

### Backend
- **Express.js** 5.1.0 - Web framework
- **MongoDB** 9.0.1 - NoSQL database
- **Mongoose** 9.0.1 - MongoDB ODM
- **JWT** 9.0.3 - Authentication
- **bcrypt** 6.0.0 - Password hashing
- **multer** 1.4.5 - File uploads

## 📋 Prerequisites

- **Node.js** 16+ and npm/yarn
- **MongoDB** 4.4+ (local or cloud instance)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/selinsmry/BuzzHub.git
cd BuzzHub
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/buzzhub
JWT_SECRET=your_secret_key_here
```

Start the backend server:

```bash
npm run dev    # Development with nodemon
# or
npm start      # Production
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
BuzzHub/
├── backend/
│   ├── controllers/        # Request handlers
│   │   ├── authController.js
│   │   ├── communityController.js
│   │   └── recommendationController.js
│   ├── middleware/         # Express middleware
│   │   ├── uploadMiddleware.js
│   │   ├── verifyToken.js
│   │   └── verifyAdmin.js
│   ├── routes/            # API routes
│   │   ├── authRoutes.js
│   │   ├── communityRoutes.js
│   │   └── recommendationRoutes.js
│   ├── models.js          # MongoDB schemas
│   ├── index.js           # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🔑 Key API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Communities
- `GET /api/communities` - List all communities
- `POST /api/communities` - Create community (protected)
- `GET /api/communities/:id` - Get community details
- `PUT /api/communities/:id` - Update community (protected)
- `DELETE /api/communities/:id` - Delete community (protected)

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post (protected)
- `PUT /api/posts/:id` - Update post (protected)
- `PUT /api/votes/:id` - Vote on post (protected)

### Recommendations
- `GET /api/recommendations/feed` - Get personalized feed (protected)
- `GET /api/recommendations/communities` - Get recommended communities (protected)
- `POST /api/recommendations/preferences` - Update user preferences (protected)

For complete API documentation, see the backend routes in `backend/routes/`.

## 👥 User Roles

- **Regular User** - Can create posts, communities, and engage with content
- **Admin** - Can manage users, moderate content, and view analytics

## 🔐 Authentication

The app uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are issued upon successful login and stored in the browser's local storage.



## 👤 Made by

- [@selinsmry](https://github.com/selinsmry)
- [@cemkagba](https://github.com/cemkagba)
- [@gokenomi](https://github.com/gokenomi)
