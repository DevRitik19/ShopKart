import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getMyProfile } from '../services/api';

export default function ProtectedRoutes({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getMyProfile()
      .then(() => {
        if (isMounted) setAuth(true);
      })
      .catch(() => {
        if (isMounted) setAuth(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (auth === null) {
    return null;
  }

  return auth ? (children ? children : <Outlet />) : <Navigate to="/login" replace />;
}
