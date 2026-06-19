import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Setup from "@/pages/Setup"
import Channel from "@/pages/Channel"
import SpotDetail from "@/pages/SpotDetail"
import Trips from "@/pages/Trips"
import Publish from "@/pages/Publish"
import StoreQueue from "@/pages/StoreQueue"
import BottomNav from "@/components/BottomNav"
import { useAppStore } from "@/store"

function AppRoutes() {
  const { hasPreference } = useAppStore()

  return (
    <div className="max-w-md mx-auto min-h-screen relative">
      <Routes>
        <Route path="/" element={hasPreference ? <Navigate to="/channel" replace /> : <Setup />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/channel" element={<Channel />} />
        <Route path="/spot/:id" element={<SpotDetail />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/store-queue" element={<StoreQueue />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}
