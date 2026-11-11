
# SmartWinnr – Restaurant Rating and Review Platform

SmartWinnr is a MERN Stack web application that helps users discover restaurants, explore different cuisines, and share their dining experiences through ratings and reviews.

## Features

### Customer
- Register and login
- Browse and search restaurants
- Filter restaurants by location and cuisine
- View restaurant details and ratings
- Add, update, and delete reviews
- View personal reviews

### Restaurant Owner
- Secure owner login
- View assigned restaurant
- Update restaurant details
- View customer reviews and ratings

### Admin
- Admin dashboard with statistics
- Create restaurant owner accounts
- Add and manage restaurants
- Assign owners to restaurants
- Manage users
- Remove inappropriate reviews

## Technologies Used

**Frontend**
- React.js
- React Router DOM
- Axios
- CSS

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

## Project Structure

```text
SmartWinnr/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env.example
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
└── .gitignore
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Bhavya1614/SmartWinnr.git
cd SmartWinnr
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` and configure your MongoDB connection string and JWT secret.

Start the backend:

```bash
npm run dev
```

Backend runs at:

`http://localhost:5000`

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Database

MongoDB is used to store:
- Users
- Restaurants
- Reviews

## Security

- Password hashing using bcryptjs
- JWT-based authentication
- Role-based authorization
- Environment variables for sensitive configuration

## Author

Bhavya Sri

GitHub: https://github.com/Bhavya1614
