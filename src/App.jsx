import Navbar from './components/Navbar'
import Home from './pages/Home'
import Profile from './pages/Profile'
import UpperWear from './pages/UpperWear'
import LowerWear from './pages/LowerWear'
import Sneakers from './pages/Sneakers'
import Sale from './pages/Sale'
import AllProducts from './pages/AllProducts'
import Wishlist from './pages/Wishlist'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  { path: '/', element: <><Navbar /><Home /></> },
  { path: '/profile', element: <><Navbar /><Profile /></> },
  { path: '/upper-wear', element: <><Navbar /><UpperWear /></> },
  { path: '/bottom-wear', element: <><Navbar /><LowerWear /></> },
  { path: '/sneakers', element: <><Navbar /><Sneakers /></> },
  { path: '/sale', element: <><Navbar /><Sale /></> },
  { path: '/all-products', element: <><Navbar /><AllProducts /></> },
  { path: '/wishlist', element: <><Navbar /><Wishlist /></> },
  { path: '/cart', element: <><Navbar /><Cart /></> },
  { path: '/checkout', element: <><Navbar /><Checkout /></> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
])

const App = () => (
  <RouterProvider router={router} />
)

export default App
