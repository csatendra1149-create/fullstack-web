# HomeTaste Flavours - Frontend Web Application

Fresh home-cooked meals delivered from your kitchen to your office across Nepal.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Create .env file**
```bash
cp .env.example .env
```

Update `.env` with your backend URL:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

3. **Start development server**
```bash
npm start
```

App will run on `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/         # Navbar, Footer
│   ├── common/         # Reusable components
│   └── home/           # Home page components
├── pages/              # Page components
├── context/            # React Context (Auth)
├── services/           # API services
├── utils/              # Helper functions
├── App.js              # Main App component
└── index.js            # Entry point
```

## 🎨 Features

- ✅ User Authentication
- ✅ Browse & Search Meals
- ✅ View Meal Details
- ✅ Place Orders
- ✅ Track Orders
- ✅ User Profile Management
- ✅ Real-time Updates
- ✅ Responsive Design

## 🛠️ Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 📦 Dependencies

- React 18
- React Router DOM
- Axios
- Socket.io Client
- React Toastify
- React Icons
- Formik & Yup

## 🔗 API Endpoints

Backend must be running on `http://localhost:5000`

## 👨‍💻 Developer

Created by Satendra
- Email: c.satendra1149@gmail.com
- Phone: +977 9807258278

## 📄 License

© 2025 HomeTaste Flavours. All rights reserved.