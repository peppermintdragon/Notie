import { Navigate, Route, Routes } from 'react-router-dom';
import WritePage from './pages/WritePage';
import BoardPage from './pages/BoardPage';
import PrivateBoardPage from './pages/private-board/PrivateBoardPage';
import MemoLanePage from './pages/memolane/MemoLanePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WritePage />} />
      <Route path="/board" element={<BoardPage />} />
      <Route path="/private" element={<PrivateBoardPage />} />
      <Route path="/private/:dateKey" element={<PrivateBoardPage />} />
      <Route path="/memolane" element={<MemoLanePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
