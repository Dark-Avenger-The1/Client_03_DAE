import { BrowserRouter, Routes, Route } from 'react-router'

//  Routes & Paths
import HomeSeller from './pages/HomeSeller'
import MyListings from './pages/MyListing'
import SellerAnalytics from './pages/SellerAnalytics'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/seller" element={<HomeSeller />} />
        <Route path="/seller/listings" element={<MyListings />} />
        <Route path="/seller/analytics" element={<SellerAnalytics />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App