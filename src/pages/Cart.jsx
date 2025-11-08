import { Link } from "react-router-dom";

function Cart() {
  const cartItems = [
    { id: 1, name: "Trendy Hoodie", price: 89, quantity: 1, size: "M" },
    { id: 2, name: "Vintage Jeans", price: 129, quantity: 2, size: "L" },
    { id: 3, name: "Classic T-Shirt", price: 39, quantity: 1, size: "S" },
  ];

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div
      style={{
        backgroundImage: "url(/website_background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <div className="absolute inset-0 bg-white/50 h-full"></div>
      <div className="relative z-10 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            Shopping Cart
          </h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500 text-base sm:text-lg mb-4">Your cart is empty</p>
              <Link
                to="/collections"
                className="bg-black text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-md hover:bg-gray-800 transition"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-4 sm:space-y-0"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-500 text-xs">Image</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">Size: {item.size}</p>
                      <p className="text-base sm:text-lg text-gray-900 font-bold">${item.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                    <div className="flex items-center space-x-2">
                      <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-sm">
                        -
                      </button>
                      <span className="w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                      <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-sm">
                        +
                      </button>
                    </div>
                    <button className="text-red-500 hover:text-red-700 text-sm sm:text-base">
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base sm:text-lg font-semibold">Total: ${total}</span>
                </div>
                <Link
                  to="/checkout"
                  className="w-full bg-black text-white py-2 sm:py-3 text-sm sm:text-base rounded-md hover:bg-gray-800 transition block text-center"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;
