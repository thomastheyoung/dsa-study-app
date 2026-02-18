import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TopicLayout } from './components/layout/TopicLayout';
import { Home } from './pages/Home';
import { TopicPage } from './pages/TopicPage';
import { BigOPage } from './pages/BigOPage';
import { FlashCardsPage } from './pages/FlashCardsPage';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<TopicLayout />}>
          <Route index element={<Home />} />
          <Route path="/big-o" element={<BigOPage />} />
          <Route path="/flash-cards" element={<FlashCardsPage />} />
          <Route path="/topic/:topicId" element={<TopicPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
