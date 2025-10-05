import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HazardMapApp from './components/HazardMapApp';
import CauseDetailsPage from './components/pages/CauseDetailsPage';
import DamageDetailsPage from './components/pages/DamageDetailsPage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HazardMapApp />} />
          <Route path="/cause" element={<CauseDetailsPage />} />
          <Route path="/cause/:parkId" element={<CauseDetailsPage />} />
          <Route path="/damage" element={<DamageDetailsPage />} />
          <Route path="/damage/:parkId" element={<DamageDetailsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
