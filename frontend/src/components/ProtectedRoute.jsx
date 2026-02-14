import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from '../services/auth.service';

const ProtectedRoute = () => {
    const user = getCurrentUser();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
