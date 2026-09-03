import { BrowserRouter, Routes, Route } from 'react-router'

//  Routes & Paths
import HomeSeller from './pages/HomeSeller'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/seller" element={<HomeSeller />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App