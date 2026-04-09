import { Navigate, Route, Routes } from 'react-router-dom';
import WritePage from './pages/WritePage';
import BoardPage from './pages/BoardPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WritePage />} />
      <Route path="/board" element={<BoardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
