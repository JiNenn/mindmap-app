import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Editor from './pages/Editor';
import ExportMarkdown from './pages/ExportMarkdown';
import Login from './pages/Login';
import Register from './pages/Register';
import MyPage from './pages/MyPage'; // ★ 追加
import PublicView from './pages/PublicView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/public/:shareId" element={<PublicView />} />
        <Route path="/mypage" element={<MyPage />} /> {/* ★ 追加 */}
        <Route path="/editor/:mindmapId" element={<Editor />} />
        <Route path="/export/:mindmapId" element={<ExportMarkdown />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;

