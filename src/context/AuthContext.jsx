import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('user')
    return cached ? JSON.parse(cached) : null
  })
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
          localStorage.setItem('user', JSON.stringify(data.user))
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
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setIsLoggedIn(false)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
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