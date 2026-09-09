import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QuestionList from './pages/Questions/QuestionList';
import QuestionForm from './pages/Questions/QuestionForm';
import SignList from './pages/Signs/SignList';
import DuplicateReview from './pages/Duplicates/DuplicateReview';
import SourceList from './pages/Sources/SourceList';
import CountryList from './pages/Countries/CountryList';
import ContentImport from './pages/Content/ContentImport';
import MediaLibrary from './pages/Media/MediaLibrary';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected admin shell */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="questions" element={<QuestionList />} />
            <Route path="questions/new" element={<QuestionForm />} />
            <Route path="questions/:id/edit" element={<QuestionForm />} />
            <Route path="signs" element={<SignList />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="countries" element={<CountryList />} />
            <Route path="sources" element={<SourceList />} />
            <Route path="duplicates" element={<DuplicateReview />} />
            <Route path="content" element={<ContentImport />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
