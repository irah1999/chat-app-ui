import React, { useEffect, useState, useRef, useCallback } from 'react';
import useEcho from '../../hooks/echo';
import { useSelector } from 'react-redux';
import { axios } from '../../lib/axios';
import Styles from '../chat/chat.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const Chat = () => {
    const echo = useEcho();
    const user = useSelector((state) => state.auth.user);
    const recieverUser = useSelector((state) => state.chat.recieverUser);
    const chatContainerRef = useRef(null);
    const navigate = useNavigate();

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalPage, setTotalPage] = useState(1);
    const isPrependingRef = useRef(false);
    const hasFetched = useRef(false);

    const formattedCurrentTime = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(new Date());

    const fetchMessages = async (order = 0, customPage = page) => {
        if (!hasMore || loading) return;

        const scrollContent = chatContainerRef.current;
        const previousScrollHeight = scrollContent?.scrollHeight;
        const previousScrollTop = scrollContent?.scrollTop;

        setLoading(true);
        try {
            const response = await axios.post("get-messages", {
                user_id: recieverUser.user_id,
                limit: 20,
                page: customPage,
            });

            const newMessages = response.data.data;
            if (newMessages.length > 0) {
                setTotalPage(response.data.total_pages);

                if (order === 0) {
                    setMessages((prev) => [...prev, ...newMessages]);
                } else {
                    isPrependingRef.current = true;
                    setMessages((prev) => [...newMessages, ...prev]);

                    setTimeout(() => {
                        if (scrollContent) {
                            const newScrollHeight = scrollContent.scrollHeight;
                            scrollContent.scrollTop =
                                newScrollHeight - previousScrollHeight + previousScrollTop;
                        }
                    }, 0);
                }
            }

            setHasMore(newMessages.length > 0);
        } catch (err) {
            console.log("Error fetching messages:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const container = chatContainerRef.current;

        if (isPrependingRef.current) {
            isPrependingRef.current = false;
            return;
        }

        // Scroll to bottom only when new message is sent or received
        if (container) {
            container.scrollTop = container.scrollHeight;
        }

        updateUnRead();
    }, [messages]);

    useEffect(() => {
        if (!hasFetched.current) {
            hasFetched.current = true;
            fetchMessages(0, 1);
        }
    }, []);

    const handleScroll = useCallback(() => {
        const scrollContent = chatContainerRef.current;
        if (!scrollContent || loading) return;

        const { scrollTop } = scrollContent;
        if (scrollTop <= 10 && totalPage > page) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchMessages(1, nextPage);
        }
    }, [loading, page, totalPage]);

    useEffect(() => {
        const scrollContent = chatContainerRef.current;
        if (!scrollContent) return;

        scrollContent.addEventListener("scroll", handleScroll);
        return () => scrollContent.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        if (!echo || !user?.id) return;

        const channel = echo.private(`chat.${user.id}`);

        channel.listen("MessageSent", (event) => {
            console.log("chat event ", event);
            if (parseInt(event.receiver_id) === parseInt(user.id)) {
                setMessages((prev) => [...prev, { text: event.message, type: "received", timestamp: event.timestamp }]);
            }
        });

        return () => {
            channel.stopListening("MessageSent");
        };
    }, [echo, user]);

    const handleSend = (receiverId) => {
        if (!message.trim()) return;

        axios.post("send-message", {
            user_id: receiverId,
            from: user?.id,
            message: message,
        })
            .then(res => {
                if (res.statusText === 'No Content') {
                    setMessages((prev) => [...prev, { text: message, type: "sent", timestamp: formattedCurrentTime }]);
                    setMessage("");
                }
            })
            .catch((error) => console.error("Error sending message:", error));
    };

    const updateUnRead = () => {
        axios.post("update-unread", {
            from: recieverUser?.user_id,
            user_id: user?.id,
        }).then(res => {
            if (!res.data.success) {
                console.log("Error updating unread messages:");
            } else {
                console.log(res.data.message);
            }
            setHasMore(res.length > 0);
        }).catch((error) => console.log("Error updating message:", error));
    };

    return (
        <div className={`container h-screen bg-gray-100 lg:w-1/2 shadow-md ${Styles.chatMargin} mx-auto flex flex-col`}>
            {/* Header */}
            <header className="bg-white text-black shadow-md">
                <div className="container mx-auto flex items-center justify-start py-4 px-6">
                    <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faArrowLeft} className="cursor-pointer" onClick={() => navigate('/contact')} />
                        <img
                            src="/images/avatar.svg"
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-gray-300"
                        />
                        <div>
                            <p className="text-sm font-medium">{recieverUser.name}</p>
                            <p className="text-xs text-gray-400">{recieverUser.email}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Messages */}
            <div
                ref={chatContainerRef}
                className="flex flex-col flex-1 p-4 overflow-y-auto pb-16"
            >
                {loading && page === 1 && <p>Loading...</p>}
                {loading && page > 1 && <p className="mb-2">Loading more messages...</p>}

                {messages.length === 0 && !loading ? (
                    <div className="text-center text-gray-400 mt-10">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex items-end gap-2 mb-4 ${msg.type === "received" ? "justify-start" : "justify-end"
                                }`}
                        >
                            <div
                                className={`max-w-md px-4 py-2 rounded-xl shadow-md ${msg.type === "received"
                                        ? "bg-white text-black"
                                        : "bg-blue-950 text-white"
                                    }`}
                            >
                                <p className="break-words">{msg.text}</p>
                                <p
                                    className={`text-xs ${msg.type === "received" ? "text-gray-500" : "text-gray-400"
                                        } text-right mt-1`}
                                >
                                    {msg.timestamp}
                                </p>
                            </div>
                        </div>
                    ))
                )}


            </div>

            {/* Input Section */}
            <div className="bg-white p-4 flex gap-2 sticky bottom-0 w-full mx-auto shadow-md">
                <input
                    type="text"
                    placeholder="Type your message..."
                    className="w-full p-2 border border-gray-400 rounded-lg"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button
                    className="bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-blue-900"
                    onClick={() => handleSend(recieverUser.user_id)}
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </div>
        </div>
    );
};

export default Chat;
