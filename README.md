# Internship Management System

A web-based application for managing student internships, built with Node.js, Express, and vanilla JavaScript.

## Features

- **User Authentication**
  - Student Login/Register
  - Admin Login
  - Secure authentication system

- **Student Features**
  - Register for internships
  - View internship status
  - Update personal information
  - Submit and track applications

- **Admin Features**
  - Dashboard with overview statistics
  - Manage student applications
  - View and update internship statuses
  - Monitor student registrations

## Project Structure

```
internship-management/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── admin-dashboard.html
│   ├── admin-login.html
│   ├── student-dashboard.html
│   ├── index.html
│   ├── login.html
│   ├── form.html
│   ├── style.css
│   └── js files
└── config/
    └── defaultAdmin.js
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install dependencies for backend:
```bash
cd backend
npm install
npm intsall exceljs
```

3. Install dependencies for frontend client (if applicable):
```bash
cd client
npm install
```

4. Create a `.env` file in the root directory and add your environment variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Default Admin Credentials

- Email: admin@college.edu
- Password: admin123

**Note:** It's recommended to change these credentials after first login.

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Access the application:
   - Open `frontend/index.html` in your web browser
   - The application will be available at `http://localhost:5001`

## Technologies Used

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB (with Mongoose)
  - JWT Authentication

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript (Vanilla)

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Protected API routes
- Input validation and sanitization

## Deployment on Render

### Backend Deployment

1. Sign up for a [Render account](https://render.com) if you haven't already

2. Create a new Web Service:
   - Go to your Render dashboard
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository

3. Configure the Web Service:
   - Name: `internship-management-backend` (or your preferred name)
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
   - Select the appropriate plan (Free tier available)

4. Add Environment Variables:
   - In your Web Service settings, add the following environment variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     PORT=10000
     ```

### Frontend Deployment

1. Create a new Static Site:
   - In Render dashboard, click "New +" and select "Static Site"
   - Connect your GitHub repository

2. Configure the Static Site:
   - Name: `internship-management-frontend` (or your preferred name)
   - Build Command: leave empty (no build required for static files)
   - Publish Directory: `frontend`

3. Update API URLs:
   - In your frontend JavaScript files, update the API base URL to point to your Render backend URL
   - Example: Replace `http://localhost:5000` with `https://your-backend-url.onrender.com`

### Important Notes

- Ensure your MongoDB database is accessible from Render (use MongoDB Atlas for cloud hosting)
- Update CORS settings in backend to allow requests from your Render frontend URL
- The free tier of Render may have cold starts, which can cause initial delay
- Monitor your application logs in Render dashboard for troubleshooting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request