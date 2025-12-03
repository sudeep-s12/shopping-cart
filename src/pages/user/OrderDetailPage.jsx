import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getOrderById, getOrderTracking } from "../../api/orders";

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id || !orderId) {
      navigate("/login");
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await getOrderById(orderId);
        console.log("Order data:", orderData);
        setOrder(orderData);

        const trackingData = await getOrderTracking(orderId);
        console.log("Tracking data:", trackingData);
        setTracking(trackingData);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user?.id, navigate]);

  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen text-slate-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-slate-300">Loading order details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-slate-950 min-h-screen text-slate-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-red-400">{error || "Order not found"}</p>
          <button
            onClick={() => navigate("/orders")}
            className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 rounded-full font-semibold hover:bg-emerald-600"
          >
            Back to Orders
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending_payment: "text-yellow-400",
      confirmed: "text-blue-400",
      dispatched: "text-purple-400",
      delivered: "text-emerald-400",
      cancelled: "text-red-400",
    };
    return colors[status] || "text-slate-400";
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-emerald-200">Order Details</h1>
          <p className="text-slate-400">
            Order ID: <span className="font-mono">{order.id}</span>
          </p>
        </div>

        {/* Status Card */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Order Status</p>
              <p className={`text-xl font-bold ${getStatusColor(order.order_status)}`}>
                {order.order_status.replace(/_/g, " ").toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Order Date</p>
              <p className="text-lg font-semibold">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        {tracking && (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6">
            <h2 className="text-lg font-bold text-emerald-200 mb-6">Delivery Tracking</h2>
            <div className="space-y-4">
              {tracking.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        event.completed
                          ? "bg-emerald-500 border-emerald-500"
                          : "bg-slate-700 border-slate-600"
                      }`}
                    />
                    {index < tracking.timeline.length - 1 && (
                      <div
                        className={`w-0.5 h-12 ${
                          event.completed ? "bg-emerald-500" : "bg-slate-700"
                        }`}
                      />
                    )}
                  </div>
                  <div className="pt-1">
                    <p
                      className={`font-semibold ${
                        event.completed ? "text-emerald-300" : "text-slate-400"
                      }`}
                    >
                      {event.status}
                    </p>
                    {event.date && (
                      <p className="text-sm text-slate-500">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6">
          <h2 className="text-lg font-bold text-emerald-200 mb-4">Items</h2>
          <div className="space-y-3">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-slate-700 pb-3 last:border-b-0">
                <div className="flex-1">
                  <p className="font-semibold text-slate-100">{item.items?.name}</p>
                  <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{item.price_at_purchase}</p>
                  {item.discount_at_purchase > 0 && (
                    <p className="text-sm text-green-400">
                      {item.discount_at_purchase}% off
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        {order.addresses && (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6">
            <h2 className="text-lg font-bold text-emerald-200 mb-4">Delivery Address</h2>
            <div className="text-slate-300 space-y-1">
              <p className="font-semibold">{order.addresses.street || "N/A"}</p>
              <p>
                {order.addresses.city}, {order.addresses.state} {order.addresses.pincode}
              </p>
              <p className="text-sm text-slate-400">Phone: {order.addresses.phone}</p>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6">
          <h2 className="text-lg font-bold text-emerald-200 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal</span>
              <span>₹{order.subtotal?.toFixed(2)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount</span>
                <span>-₹{order.discount_amount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-300">
              <span>Tax (18%)</span>
              <span>₹{order.tax_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Shipping</span>
              <span>{order.shipping_cost === 0 ? "Free" : `₹${order.shipping_cost?.toFixed(2)}`}</span>
            </div>
            <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-emerald-300">
              <span>Total</span>
              <span>₹{order.total_amount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 px-4 py-2 bg-slate-800 text-slate-100 rounded-full font-semibold hover:bg-slate-700"
          >
            Back to Orders
          </button>
          <button
            onClick={() => navigate("/shop")}
            className="flex-1 px-4 py-2 bg-emerald-500 text-slate-950 rounded-full font-semibold hover:bg-emerald-600"
          >
            Continue Shopping
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
