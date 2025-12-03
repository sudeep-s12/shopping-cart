import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { getOrdersByUser, cancelOrder } from "../../api/orders";

export default function OrdersPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user?.id) {
        setOrders([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getOrdersByUser(user.id, 50);
        setOrders(data || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?.id]);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-lg font-semibold text-emerald-200">Your orders</h1>

        {loading ? (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 text-sm text-slate-400">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 text-sm text-slate-400">
            You have no orders yet.
            <Link to="/home" className="text-emerald-300 hover:text-emerald-100 underline ml-1">Start shopping</Link>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
              {orders.map((o) => (
                <div key={o.id} className="block rounded-2xl bg-slate-900/80 border border-slate-800 p-4 hover:border-emerald-400">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Order #{o.id}</p>
                      <p className="text-slate-400 text-sm">{o.created_at ? new Date(o.created_at).toLocaleString() : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{o.total_amount?.toFixed ? o.total_amount.toFixed(2) : o.total_amount}</p>
                      <p className="text-slate-400 text-sm">{o.order_status?.replace(/_/g, " ")}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <Link to={`/order/${o.id}`} className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-200 hover:bg-slate-700">View</Link>
                    {/* Show Cancel button when order is cancellable */}
                    {(["pending_payment", "confirmed"].includes(o.order_status) ) ? (
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          if (!window.confirm("Cancel this order?")) return;
                          try {
                            await cancelOrder(o.id, "Cancelled by user");
                            // refresh list
                            const data = await getOrdersByUser((await import('../../context/UserContext')).useUser().user?.id || null);
                            // fallback: refetch via effect by setting orders again
                            // simpler: reload page to refresh
                            window.location.reload();
                          } catch (err) {
                            console.error("Cancel order failed:", err);
                            alert("Failed to cancel order: " + (err.message || err));
                          }
                        }}
                        className="px-3 py-1 bg-rose-600 rounded-full text-sm text-white hover:bg-rose-500"
                      >
                        Cancel Order
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
