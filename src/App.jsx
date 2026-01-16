import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TodoPage from './pages/TodoPage.jsx';
import WeekPage from './pages/WeekPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TodoPage />} />
        <Route path="/week" element={<WeekPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

