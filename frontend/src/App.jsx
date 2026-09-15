import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login    from './pages/Login';
import Home     from './pages/Home';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect */}
        <Route path="/"         element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login"    element={<Login />} />

        {/*
          Protected route — Home itself calls GET /customers/me on mount.
          If the server returns 401 (no valid cookie), Home redirects to /login.
        */}
        <Route path="/home"     element={<Home />} />

        {/* Catch-all → login */}
        <Route path="*"         element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
