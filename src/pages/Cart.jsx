import { Link } from 'react-router-dom'

function Cart() {
  const cartItems = [
    { id: 1, name: 'Trendy Hoodie', price: 89, quantity: 1, size: 'M' },
    { id: 2, name: 'Vintage Jeans', price: 129, quantity: 2, size: 'L' },
    { id: 3, name: 'Classic T-Shirt', price: 39, quantity: 1, size: 'S' }
  ]

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <Link to="/collections" className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                    <span className="text-gray-500 text-xs">Image</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">Size: {item.size}</p>
                    <p className="text-gray-900 font-bold">${item.price}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                      +
                    </button>
                  </div>
                  <button className="text-red-500 hover:text-red-700">
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total: ${total}</span>
              </div>
              <Link to="/checkout" className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition block text-center">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart