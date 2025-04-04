import React, { useEffect, useState, useRef } from 'react';
import useEcho from '../../hooks/echo';
import { useSelector } from 'react-redux';
import { axios } from '../../lib/axios';
import Styles from '../chat/chat.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
const Groupchat = () => {
    const echo = useEcho({ channelType: 'presence', channelName: 1 });
    const user = useSelector((state) => state.auth.user);
    const recieverUser = useSelector((state) => state.chat.recieverUser);
    const chatContainerRef = useRef(null);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);  // Store chat history
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1); // Track current page
    const [hasMore, setHasMore] = useState(true); // Check if there are more messages to load

    // useRef to track if effect has already run
    const hasFetched = useRef(false);

    // Fetch messages from API
    const fetchMessages = async (page) => {
        if (!hasMore) return;  // Don't fetch if there are no more messages to load

        setLoading(true);
        try {
            const response = await axios.post("get-messages", {
                user_id: recieverUser.id,
                limit: 10,
                page: page,
            });
            const newMessages = response.data.data;
            setMessages((prev) => [...prev, ...newMessages]); // Append new messages
            setHasMore(newMessages.length > 0); // Check if there are more messages
        } catch (err) {
            // console.error("Error fetching messages:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check if the effect has already run
        if (hasFetched.current) return;  // Prevent subsequent calls after first

        hasFetched.current = true;  // Mark effect as run

        // Fetch messages when page changes
        // fetchMessages(page);

    }, [page]);  // Dependency array contains `page`


    // Handle scrolling to load more messages
    const handleScroll = () => {
        const container = chatContainerRef.current;
        if (container.scrollTop === 0 && !loading && hasMore) {
            // If scrolled to the top, fetch more messages
            setPage((prev) => prev + 1);
        }
    };


    // Handle real-time message updates via Echo
    useEffect(() => {
        if (!echo || !user?.id) return;
    
        const channel = echo.join(`group.1`);
        
        channel.listen("GroupMessageSent", (event) => {
            console.log("event => ", event);
        });
    
        return () => {
            channel.stopListening(".GroupMessageSent");
            channel.leave();
        };
    }, [echo, user]);

    const handleSend = (receiverId) => {
        if (!message.trim()) return; // Prevent sending empty messages

        axios.post("send-message", {
            user_id: receiverId,
            from: user?.id,
            message: message,
        })
        .then(res => {
            if (res.statusText === 'No Content') {
                setMessages((prev) => [...prev, { text: message, type: "sent" }]);
                setMessage(""); // Clear message input
            }
        })
        .catch((error) => console.error("Error sending message:", error));
    };

    const updateUnRead = () => {

        // if (!hasMore) return;  // Don't fetch if there are no more messages to load

        // setLoading(true);
        try {
            const response = axios.post("update-unread", {
                from: recieverUser?.id,
                user_id: user?.id,
            });
            const responseData = response.data;
            if (!responseData.success) {
                console.log("Error updated unread messages:");
            }
            // setHasMore(responseData.length > 0); // Check if there are more messages
        } catch (err) {
            console.log("Error updated unread messages:", err);
        } finally {
            // setLoading(false);
        }

    }

    // Scroll to the bottom when new messages are added
    useEffect(() => {
        const container = chatContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight; // Scroll to the bottom
        }
        // updateUnRead();
    }, [messages]);

    return (
        <div className={`container h-screen bg-gray-100 lg:w-1/2 shadow-md ${Styles.chatMargin} mx-auto flex flex-col`}>
            {/* Header */}
            <header className="bg-white text-black shadow-md">
                <div className="container mx-auto flex items-center justify-start py-4 px-6">
                    <div className="flex items-center space-x-2">
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

            {/* Chat Messages Area */}
            <div
                ref={chatContainerRef}
                className="flex flex-col flex-1 p-4 overflow-y-auto pb-16"
                onScroll={handleScroll} // Add scroll event listener
            >
                {loading && page === 1 ? <p>Loading...</p> : null}

                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 mt-2 ${msg.type === 'received' ? 'self-start' : 'self-end'}`}>
                        <div className={`p-2 rounded-lg ${msg.type === 'received' ? 'bg-gray-200 text-black' : 'bg-blue-900 text-white border'}`}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}

                {loading && page > 1 ? <p>Loading more messages...</p> : null}
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
                    onClick={() => handleSend(recieverUser.id)}
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </div>
        </div>
    );
};

export default Groupchat;
