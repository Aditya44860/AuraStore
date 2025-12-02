import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [originalFullName, setOriginalFullName] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          const name = data.user.fullName || data.user.name;
          const phoneNum = data.user.phone || '';
          setFullName(name);
          setPhone(phoneNum);
          setOriginalFullName(name);
          setOriginalPhone(phoneNum);
        }
      });
    }
  }, []);

  const validatePhone = (phoneNum) => {
    const cleanPhone = phoneNum.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSave = async () => {
    if (!validatePhone(phone)) {
      return;
    }
    
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullName, phone })
      });
      
      const data = await response.json();
      if (response.ok) {
        setOriginalFullName(fullName);
        setOriginalPhone(phone);
        updateUser({ ...user, fullName, phone, name: fullName });
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Failed to update');
      }
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div style={{backgroundImage: 'url(/website_background.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', minHeight: '100vh'}}>
      <div className="absolute inset-0 bg-white/50"></div>
      <div className="relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">{(fullName || user.name)?.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{fullName || user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">Member since {new Date(user.createdAt).getFullYear()}</p>
            </div>
          </div>
          
          {message && (
            <div className={`mb-4 p-3 rounded-md ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}
          
          {!phone && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Welcome to AuraStore! 🎉</h3>
              <p className="text-blue-700">Please complete your profile by adding your phone number to get started.</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{!phone ? 'Complete Your Profile' : 'Update Your Profile'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500" 
                  />
                </div>
                <div className={!phone ? 'p-3 bg-yellow-50 border border-yellow-200 rounded-md' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number * {!phone && <span className="text-yellow-600">(Required)</span>}
                  </label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(value);
                      if (value.length > 0) validatePhone(value);
                    }}
                    placeholder="Enter your 10-digit mobile number"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      !phone ? 'border-yellow-300 focus:ring-yellow-500' : phoneError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
                    }`}
                  />
                  {phoneError && <p className="text-red-600 text-sm mt-1">{phoneError}</p>}
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order History</h2>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Order #12345</span>
                    <span className="text-green-600 text-sm">Delivered</span>
                  </div>
                  <p className="text-gray-600 text-sm">3 items - $257</p>
                  <p className="text-gray-500 text-xs">Ordered on Jan 15, 2024</p>
                </div>
                <div className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Order #12344</span>
                    <span className="text-blue-600 text-sm">Shipped</span>
                  </div>
                  <p className="text-gray-600 text-sm">1 item - $89</p>
                  <p className="text-gray-500 text-xs">Ordered on Jan 10, 2024</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button 
              onClick={handleSave}
              disabled={loading || !fullName || !phone || phoneError || (fullName === originalFullName && phone === originalPhone)}
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition mr-4 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/';
              }}
              className="text-red-600 hover:text-red-800 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Profile