
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, Send, RefreshCw } from "lucide-react";
import api from "../services/api";

function BuyerChat() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;

  const buyerEmail =
    location.state?.buyerEmail ||
    sessionStorage.getItem("userEmail") ||
    sessionStorage.getItem("email");

  const farmerEmail = order?.farmer_email || "";

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadMessages = useCallback(async () => {
    if (!buyerEmail || !orderId) return;

    try {
      const res = await api.get(
        `/order-messages/${orderId}`,
        {
          params: { email: buyerEmail },
        }
      );

      setMessages(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      console.error("Error loading chat:", err);
      setError(
        err.response?.data?.error || "Unable to load messages."
      );
    } finally {
      setLoading(false);
    }
  }, [buyerEmail, orderId]);

  useEffect(() => {
    loadMessages();

    const interval = setInterval(loadMessages, 3000);

    return () => clearInterval(interval);
  }, [loadMessages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const messageText = message.trim();

    if (!messageText || !buyerEmail || !farmerEmail) return;

    try {
      setSending(true);

      await api.post("/send-message", {
        order_id: Number(orderId),
        sender_email: buyerEmail,
        receiver_email: farmerEmail,
        message: messageText,
        image_url: "",
      });

      setMessage("");
      await loadMessages();
    } catch (err) {
      console.error("Error sending message:", err);
      setError(
        err.response?.data?.error || "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-green-700 text-white px-5 py-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-green-600"
          >
            <ArrowLeft size={22} />
          </button>

          <div className="bg-white/20 p-2 rounded-full">
            <MessageCircle size={23} />
          </div>

          <div className="min-w-0">
            <h1 className="font-bold text-lg">
              FarmConnect Chat
            </h1>
            <p className="text-sm text-green-100 truncate">
              Order #{orderId} · {order?.crop_name || "Farmer"}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 flex flex-col">
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-sm text-gray-500">Farmer</p>
          <p className="font-semibold text-gray-800 break-all">
            {farmerEmail || "Farmer details unavailable"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-3">
            {error}
          </div>
        )}

        <section className="flex-1 bg-white rounded-2xl shadow-sm p-4 min-h-80">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="font-bold text-gray-800">
              Messages
            </h2>

            <button
              onClick={loadMessages}
              className="text-green-700 hover:text-green-900"
              title="Refresh messages"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 py-10">
              Loading messages...
            </p>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle
                size={42}
                className="mx-auto text-gray-300"
              />
              <p className="font-semibold text-gray-600 mt-3">
                No messages yet
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Start a conversation with the farmer.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((item) => {
                const isBuyer =
                  item.sender_email?.toLowerCase() ===
                  buyerEmail?.toLowerCase();

                return (
                  <div
                    key={item.id}
                    className={`flex ${
                      isBuyer ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isBuyer
                          ? "bg-green-600 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      {item.message && (
                        <p className="whitespace-pre-wrap break-words">
                          {item.message}
                        </p>
                      )}

                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt="Shared attachment"
                          className="max-w-full rounded-lg mt-2"
                        />
                      )}

                      <p
                        className={`text-xs mt-2 ${
                          isBuyer ? "text-green-100" : "text-gray-400"
                        }`}
                      >
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <form
          onSubmit={sendMessage}
          className="bg-white rounded-2xl shadow-sm p-3 mt-4 flex gap-2"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            type="submit"
            disabled={sending || !message.trim() || !farmerEmail}
            className="bg-green-700 hover:bg-green-800 text-white px-5 rounded-xl disabled:opacity-50 flex items-center gap-2"
          >
            <Send size={18} />
            <span className="hidden sm:inline">
              {sending ? "Sending..." : "Send"}
            </span>
          </button>
        </form>
      </main>
    </div>
  );
}

export default BuyerChat;
