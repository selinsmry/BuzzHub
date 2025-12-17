# ToplulukApp - Frontend & Backend Setup

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB connection string (already configured)

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Run the backend:**
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

The backend will start at `http://localhost:5000`

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Run the frontend:**
```bash
npm run dev
```

The frontend will start at `http://localhost:5173` (or another port if 5173 is in use)

---

## 📋 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout user
- `POST /change-role` - Change user role (admin only)

### Community Join/Leave Routes (`/api/auth`)
- `POST /community/:communityId/join` - Join a community
- `POST /community/:communityId/leave` - Leave a community
- `GET /user-communities` - Get all communities user is in

### Community Management Routes (`/api/communities`)
- `GET /` - Get all communities (with pagination & search)
- `GET /:communityId` - Get single community details
- `POST /` - Create new community (protected)
- `PUT /:communityId` - Update community (owner only)
- `DELETE /:communityId` - Delete community (owner only)
- `GET /:communityId/members` - Get community members
- `GET /:communityId/check-membership` - Check if user is member/owner

---

## 🔐 Features Implemented

### Backend
✅ User authentication (JWT tokens)
✅ Community creation
✅ User join/leave communities
✅ Community management (CRUD)
✅ Member tracking
✅ Token refresh mechanism
✅ Admin controls

### Frontend
✅ Browse all communities
✅ Search and filter communities
✅ Join/leave communities
✅ Create new communities
✅ Display member count
✅ Real-time UI updates
✅ Error handling
✅ Loading states

---

## 📝 Data Models

### User Schema
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  profile_picture: String,
  bio: String,
  karma_points: Number,
  is_suspended: Boolean,
  communities: [ObjectId] // New: Array of community IDs
}
```

### Community Schema
```javascript
{
  name: String (unique),
  members: [ObjectId] // Array of user IDs
  description: String,
  owner_id: ObjectId,
  rules: [String],
  is_private: Boolean,
  member_count: Number,
  icon: String
}
```

---

## 🎯 Frontend Components

### Pages
- **Communities.jsx** - Browse all communities with join functionality
- **CreateCommunity.jsx** - Create new community
- **Login/Register** - Authentication pages
- **Profile** - User profile
- **PostDetail** - Individual post view

### Components
- **CommunityCard.jsx** - Reusable community card with join/leave button
- **Navbar.jsx** - Navigation bar
- **Sidebar.jsx** - Navigation sidebar
- **ProtectedRoute.jsx** - Route protection for authenticated users

### API Utilities
- **axiosInstance.js** - Configured axios with token handling
- **communityApi.js** - Community API functions
- **validation.js** - Input validation
- **errorHandler.js** - Error handling utilities

---

## 🔄 How User-Community Relationships Work

1. **Join Community:**
   - User clicks "Katıl" button on community card
   - API call: `POST /api/auth/community/:communityId/join`
   - Backend adds user to community's members array
   - Backend adds community to user's communities array
   - Frontend updates UI to show "✓ Üyesin"

2. **Leave Community:**
   - User clicks "✓ Üyesin" button
   - API call: `POST /api/auth/community/:communityId/leave`
   - Backend removes user from community's members array
   - Backend removes community from user's communities array
   - Frontend updates UI to show "Katıl"

3. **Fetch User Communities:**
   - On page load, frontend fetches user's communities
   - API call: `GET /api/auth/user-communities`
   - Compares returned community IDs with displayed communities
   - Shows correct join/leave button state

---

## 🛠️ Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 📱 Testing the Features

### Step 1: Register User
1. Go to `http://localhost:5173`
2. Click "Register"
3. Create account with username and password

### Step 2: Browse Communities
1. Click "Topluluklar" (Communities) in navbar
2. See list of all communities

### Step 3: Create Community
1. Click "Yeni Topluluk" (New Community)
2. Fill in name, description, and rules
3. Click "Topluluğu Oluştur"
4. You'll be the owner

### Step 4: Join Community
1. Go back to Communities page
2. Click "Katıl" on any community
3. Button should change to "✓ Üyesin"
4. Leave the community to test the leave functionality

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify MongoDB connection string
- Ensure all dependencies are installed: `npm install`

### Frontend can't connect to backend
- Make sure backend is running on port 5000
- Check `.env.local` has correct API URL
- Check browser console for CORS errors

### Join/Leave buttons not working
- Verify you're logged in (check localStorage for tokens)
- Check browser console for error messages
- Ensure backend is returning proper responses

### Missing communities data
- Backend may need initial data seeding
- Check MongoDB connection
- Verify community routes are properly mounted in index.js

---

## 📚 Further Development

Planned features:
- Posts within communities
- Comments on posts
- Moderation tools
- Community statistics
- Private communities
- Invite system
- Notifications

---

## 👨‍💻 Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- BCrypt for password hashing

**Frontend:**
- React 19
- React Router v7
- Axios for API calls
- Tailwind CSS for styling
- Vite for bundling

---

Generated: December 16, 2025
