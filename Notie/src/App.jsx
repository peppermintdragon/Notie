import { Navigate, Route, Routes } from 'react-router-dom';
import WritePage from './pages/WritePage';
import BoardPage from './pages/BoardPage';
import BareLayout from './layouts/BareLayout';
import NoteMaker from './components/NoteMaker';

export default function App() {
  return (
    <Routes>
      {/* NoteMaker Wizard - Isolated Layout */}
      <Route element={<BareLayout />}>
        <Route path="/make" element={<NoteMaker />} />
      </Route>

      {/* Main App Routes */}
      <Route path="/" element={<WritePage />} />
      <Route path="/board" element={<BoardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

