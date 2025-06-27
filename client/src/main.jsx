import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import './index.css';
import Home from './pages/Home';
import WorkoutsSection from './components/Workouts/WorkoutsSection';
import NutritionSection from './components/Nutrition/NutritionSection';
import ProductsSection from './components/Products/ProductsSection';
import ProfileSection from './components/Profile/ProfileSection';
import CommunitySection from './components/Community/CommunitySection';
import Login from './auth/Login';
import Signup from './auth/Signup';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import AuthLayout from './auth/AuthLayout';
import Dashboard from './components/Dashboard';
import PrivateRoute from './auth/PrivateRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'auth',
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <Login /> },
          { path: 'signup', element: <Signup /> },
        ],
      },
      
      {
        element:<PrivateRoute/>,
        children:[
          {
            element: <Layout />,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'workouts', element: <WorkoutsSection /> },
          { path: 'nutrition', element: <NutritionSection /> },
          { path: 'products', element: <ProductsSection /> },
          { path: 'community', element: <CommunitySection /> },
          { path: 'profile', element: <ProfileSection /> },
        ],
          }
        ]
      } 
    ],
  },
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);