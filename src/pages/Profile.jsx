function Profile() {
  return (
    <div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-2xl">👤</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">John Doe</h1>
              <p className="text-gray-600">john.doe@email.com</p>
              <p className="text-sm text-gray-500">Member since 2024</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value="John Doe" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value="john.doe@email.com" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value="+1 (555) 123-4567" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
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
            <button className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition mr-4">
              Save Changes
            </button>
            <button className="text-red-600 hover:text-red-800 transition">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile