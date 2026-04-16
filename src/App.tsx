import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ClientsProvider } from './context/ClientsContext'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import ClientDetail from './pages/ClientDetail'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <ClientsProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/client/:id" element={<ClientDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </ClientsProvider>
    </BrowserRouter>
  )
}
