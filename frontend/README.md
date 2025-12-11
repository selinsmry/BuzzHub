# Topluluk App - Frontend

A modern, interactive community platform built with React, featuring user communities, posts, and an admin dashboard for community management.

## Tech Stack

- **React** 19.2.0 - UI library
- **React Router DOM** 7.10.0 - Client-side routing
- **Axios** 1.6.0 - HTTP client for API integration
- **Tailwind CSS** 3.4.1 - Utility-first CSS framework
- **Vite** 7.2.2 - Fast build tool and dev server

## Installation

```bash
cd client
npm install
```

## Running the Application

```bash
npm run dev
```

The application will start on `http://localhost:5173` by default.

## Build for Production

```bash
npm run build
```

## Environment Variables

Create a `.env.local` file based on `.env.example`:

```
REACT_APP_API_URL=http://localhost:5000/api
```

This URL should point to your backend API server.

## MVP Scope

This MVP implementation includes three core user flows:

1. **Home/Listing View** - Users can browse a feed of posts from different communities with sorting (Popular/New) and filtering capabilities
2. **Admin/Management Dashboard** - An admin panel at `/admin` with multiple management sections (Users, Communities, Posts, Moderation, Reports, Settings) allowing CRUD operations
3. **Create/Edit Forms** - A fully functional post creation form at `/add` with validation, error handling, and API integration

## Project Structure

```
client/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page components (Home, Admin, CreatePost, etc.)
│   ├── App.jsx            # Main application component with routing
│   ├── main.jsx           # Entry point
│   └── index.css           # Global styles
├── public/                # Static assets
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # This file
```

## Features

### User Features
- View community posts in an interactive feed
- Filter posts by popularity or recency
- Create new posts with text, links, or images
- Browse different communities

### Admin Features
- Dashboard with system statistics
- User management (view, filter)
- Community management (CRUD operations)
- Post moderation and management
- Report handling
- System settings configuration

## API Integration

The application communicates with the backend API at `http://localhost:5000/api`. Key endpoints used:

- `GET /api/posts` - Fetch all posts
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post
- `GET /api/communities` - Fetch all communities
- `GET /api/users` - Fetch all users

## Available Scripts

- `npm run dev` - Start development server with hot module reloading
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Browser Support

Modern browsers with ES6+ support (Chrome, Firefox, Safari, Edge)

## License

This project is part of the SENG 429 course assignment.
