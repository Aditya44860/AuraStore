import { useNavigate } from 'react-router-dom'

function Checkout() {
  const navigate = useNavigate()

  return (
    <div style={{backgroundImage: 'url(/website_background.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', minHeight: '100vh'}}>
      <div className="absolute inset-0 bg-white/50"></div>
      <div className="relative z-10">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition"
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="space-y-8">
            {/* Shipping Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
                <input type="text" placeholder="Last Name" className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
                <input type="email" placeholder="Email" className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
                <input type="text" placeholder="Address" className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
                <input type="text" placeholder="City" className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
                <input type="text" placeholder="ZIP Code" className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
            </div>
            
            {/* Payment Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Card Number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="MM/YY" className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
                  <input type="text" placeholder="CVV" className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <input type="text" placeholder="Cardholder Name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md h-fit">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span>Trendy Hoodie (M) x1</span>
                <span>$89</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span>Vintage Jeans (L) x2</span>
                <span>$258</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span>Classic T-Shirt (S) x1</span>
                <span>$39</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Shipping</span>
                <span>$10</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-gray-200 font-semibold text-lg">
                <span>Total</span>
                <span>$396</span>
              </div>
            </div>
            
            <button className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition mt-6">
              Place Order
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Checkout