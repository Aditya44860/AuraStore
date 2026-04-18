import Navbar from './components/Navbar'
import Home from './pages/Home'
import Profile from './pages/Profile'
import UpperWear from './pages/UpperWear'
import BottomWear from './pages/BottomWear'
import Sneakers from './pages/Sneakers'
import Sale from './pages/Sale'
import AllProducts from './pages/AllProducts'
import Wishlist from './pages/Wishlist'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProductPage from './pages/ProductPage'
import SearchResults from './pages/SearchResults'
import { useLocation, createBrowserRouter, RouterProvider } from 'react-router-dom'
import BnwBackground from './components/BnwBackground'

const PageWrapper = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  return (
    <div className="pt-16 sm:pt-20">
      {!isHome && <BnwBackground />}
      {children}
    </div>
  );
}

const router = createBrowserRouter([
  { path: '/', element: <><Navbar /><PageWrapper><Home /></PageWrapper></> },
  { path: '/profile', element: <><Navbar /><PageWrapper><Profile /></PageWrapper></> },
  { path: '/upper-wear', element: <><Navbar /><PageWrapper><UpperWear /></PageWrapper></> },
  { path: '/bottom-wear', element: <><Navbar /><PageWrapper><BottomWear /></PageWrapper></> },
  { path: '/sneakers', element: <><Navbar /><PageWrapper><Sneakers /></PageWrapper></> },
  { path: '/sale', element: <><Navbar /><PageWrapper><Sale /></PageWrapper></> },
  { path: '/all-products', element: <><Navbar /><PageWrapper><AllProducts /></PageWrapper></> },
  { path: '/search', element: <><Navbar /><PageWrapper><SearchResults /></PageWrapper></> },
  { path: '/product/:id', element: <><Navbar /><PageWrapper><ProductPage /></PageWrapper></> },
  { path: '/wishlist', element: <><Navbar /><PageWrapper><Wishlist /></PageWrapper></> },
  { path: '/cart', element: <><Navbar /><PageWrapper><Cart /></PageWrapper></> },
  { path: '/checkout', element: <Checkout /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
])

const App = () => (
  <RouterProvider router={router} />
)

export default App
