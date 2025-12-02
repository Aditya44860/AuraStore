import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token with backend
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.status === 401) {
          localStorage.removeItem('token')
          return null
        }
        if (!response.ok) {
          return null
        }
        return response.json()
      })
      .then(data => {
        if (data?.user) {
          setIsLoggedIn(true)
          setUser(data.user)
        }
      })
      .catch((err) => {
        console.error('Auth check failed:', err)
      })
      .finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const login = (userData) => {
    setIsLoggedIn(true)
    setUser(userData)
  }

  const logout = () => {
    setIsLoggedIn(false)
    setUser(null)
    localStorage.removeItem('token')
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  const value = {
    isLoggedIn,
    user,
    login,
    logout,
    updateUser,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}