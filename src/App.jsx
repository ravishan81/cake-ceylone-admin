import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import ImageManagement from './pages/ImageManagement'
import OrderManagement from './pages/OrderManagement'
import ReviewManagement from './pages/ReviewManagement'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/images" element={<ImageManagement />} />
        <Route path="/orders" element={<OrderManagement />} />
        <Route path="/reviews" element={<ReviewManagement />} />
      </Route>
    </Routes>
  )
}
