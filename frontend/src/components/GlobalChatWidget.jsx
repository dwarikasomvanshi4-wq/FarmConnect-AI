
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import api from "../services/api";

function GlobalChatWidget() {
  const navigate = useNavigate();

  const email =
    sessionStorage.getItem("userEmail") ||
    sessionStorage.getItem("email") ||
    "";

  const [conversations, setConversations] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [openingOrderId, setOpeningOrderId] = useState(null);

  const previousUnreadRef = useRef(null);
  const toastTimerRef = useRef(null);

  const totalUnread = conversations.reduce(
    (total, conversation) =>
      total + Number(conversation.unread_count || 0),
    0
  );

  const loadConversations = useCallback(async () => {
    if (!email) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(
        `/chat-conversations/${encodeURIComponent(email)}`
      );

      const data = Array.isArray(response.data) ? response.data : [];

      const unreadTotal = data.reduce(
        (total, conversation) =>
          total + Number(conversation.unread_count || 0),
        0
      );

      // Don't show a notification for messages that were already unread
      // when the widget first loaded.
      if (
        previousUnreadRef.current !== null &&
        unreadTotal > previousUnreadRef.current
      ) {
        setToast("You have received a new message!");

        if (toastTimerRef.current) {
          clearTimeout(toastTimerRef.current);
        }

        toastTimerRef.current = setTimeout(() => {
          setToast("");
        }, 4000);
      }

      previousUnreadRef.current = unreadTotal;
      setConversations(data);
    } catch (error) {
      console.error("Unable to load chat conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    loadConversations();

    const interval = setInterval(loadConversations, 3000);

    return () => {
      clearInterval(interval);

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, [loadConversations]);

  const openConversation = async (conversation) => {
    const orderId = conversation.order_id;

    if (!orderId || !email) return;

    setOpeningOrderId(orderId);

    const order = {
      id: orderId,
      crop_name: conversation.crop_name,
      buyer_email: conversation.buyer_email,
      farmer_email: conversation.farmer_email,
    };

    const isBuyer =
      String(conversation.buyer_email || "").toLowerCase() ===
      email.toLowerCase();

    try {
      await api.post(`/mark-messages-read/${orderId}`, {
        email,
      });
    } catch (error) {
      console.error("Unable to mark messages as read:", error);
    }

    await loadConversations();

    setIsOpen(false);
    setOpeningOrderId(null);

    if (isBuyer) {
      navigate(`/buyer-chat/${orderId}`, {
        state: {
          order,
          buyerEmail: email,
        },
      });
    } else {
      navigate(`/farmer-chat/${orderId}`, {
        state: {
          order,
          farmerEmail: email,
        },
      });
    }
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Don't display the widget on pages where the user isn't logged in.
  if (!email) return null;

  return (
    <>
      {/* New message toast */}
      {toast && (
        <div className="fixed bottom-24 right-5 z-[100] flex items-center gap-3 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-xl">
          <MessageCircle size={19} />
          <span>{toast}</span>
          <button
            type="button"
            onClick={() => setToast("")}
            className="ml-2 rounded-full p-1 hover:bg-green-600"
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Conversation panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 z-[99] flex h-[min(520px,calc(100vh-140px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-green-700 px-5 py-4 text-white">
            <div>
              <h2 className="text-lg font-bold">Messages</h2>
              <p className="text-xs text-green-100">
                Your buyer and farmer conversations
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 hover:bg-green-600"
              aria-label="Close messages"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex h-40 items-center justify-center gap-2 text-gray-500">
                <Loader2 className="animate-spin" size={20} />
                <span>Loading conversations...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center px-6 text-center">
                <MessageCircle size={38} className="mb-3 text-gray-300" />
                <p className="font-semibold text-gray-700">
                  No conversations yet
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Your conversations will appear here when someone sends a
                  message.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {conversations.map((conversation) => {
                  const unread = Number(conversation.unread_count || 0);

                  return (
                    <button
                      key={conversation.order_id}
                      type="button"
                      onClick={() => openConversation(conversation)}
                      disabled={openingOrderId === conversation.order_id}
                      className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-green-50 disabled:opacity-60"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                        <MessageCircle size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-bold text-gray-800">
                            {conversation.other_name || conversation.other_email || "User"}
                          </p>

                          <span className="shrink-0 text-xs text-gray-400">
                            {formatTime(conversation.last_message_at)}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-xs text-gray-500">
                          {conversation.crop_name || "Order"} · Order #
                          {conversation.order_id}
                        </p>

                        <p className="mt-1 truncate text-sm text-gray-600">
                          {conversation.last_message || "No message text"}
                        </p>
                      </div>

                      {openingOrderId === conversation.order_id ? (
                        <Loader2
                          size={18}
                          className="shrink-0 animate-spin text-green-700"
                        />
                      ) : unread > 0 ? (
                        <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-green-600 px-2 text-xs font-bold text-white">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 px-4 py-3 text-center text-xs text-gray-400">
            New messages refresh automatically
          </div>
        </div>
      )}

      {/* Floating chat button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => !current);
          setToast("");
        }}
        className="fixed bottom-3 right-3 z-[98] flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-white shadow-xl transition hover:scale-105 hover:bg-green-800 sm:bottom-5 sm:right-5 sm:h-14 sm:w-14"
        aria-label="Open messages"
        title="Messages"
      >
        {isOpen ? <X size={25} /> : <MessageCircle size={26} />}

        {totalUnread > 0 && !isOpen && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-xs font-bold text-white">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </button>
    </>
  );
}

export default GlobalChatWidget;
