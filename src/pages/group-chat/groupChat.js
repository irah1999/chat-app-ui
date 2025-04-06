import React, { useEffect, useState, useRef, useCallback } from "react";
import useEcho from "../../hooks/echo";
import { useSelector } from "react-redux";
import { axios } from "../../lib/axios";
import Styles from "../chat/chat.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import ThreeDotMenu from '../../components/ThreeDotMenu/ThreeDotMenu';

const Groupchat = () => {
    const echo = useEcho();
    const user = useSelector((state) => state.auth.user);
    const groupUser = useSelector((state) => state.groupChat.groupUser);
    const chatContainerRef = useRef(null);
    const groupid = groupUser.group_id;

    const navigate = useNavigate();

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalPage, setTotalPage] = useState(1);

    const userId = user?.id || null;
    const hasFetched = useRef(false);
    const isPrependingRef = useRef(false);

    const formattedCurrentTime = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(new Date());

    useEffect(() => {
        if (isPrependingRef.current) {
            isPrependingRef.current = false;
            return;
        }

        const container = chatContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }

        updateUnread(null, groupid);
    }, [messages]);

    const fetchMessages = async (order = 0, customPage = page) => {
        if (!hasMore || loading) return;

        const scrollContent = chatContainerRef.current;
        const previousScrollHeight = scrollContent?.scrollHeight;
        const previousScrollTop = scrollContent?.scrollTop;

        setLoading(true);
        try {
            const response = await axios.post("group/get-messages", {
                group_id: groupid,
                limit: 10,
                page: customPage,
            });

            const newMessages = response.data.data;
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

            setHasMore(newMessages.length > 0);
        } catch (err) {
            console.error("Error fetching messages:", err);
        } finally {
            setLoading(false);
        }
    };

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
        if (!echo) return;

        const channel = echo.join(`group`);
        const groupUserChannel = echo.join(`groupUser`);

        // channel.listen("GroupUserSent", (event) => {

        // });
        

        // Listen for new messages
        channel.listen("GroupMessageSent", (event) => {
            console.log("group event => ", event);
            if (
                parseInt(event.sender_id) !== parseInt(userId) &&
                parseInt(event.group_id) === parseInt(groupid)
            ) {
                setMessages((prev) => [
                    ...prev,
                    {
                        text: event.message,
                        type: "received",
                        image: event.image,
                        timestamp: event.timestamp,
                        sender: event.sender_name,
                    },
                ]);
                updateUnread(event.message_id, groupid);
            }
        });

        // Listen for user joined (but not yourself)
        groupUserChannel.joining((userData) => {
            console.log("joing => ", userData.user.name);
            if (parseInt(userData.user.id) !== parseInt(userId)) {
                setMessages((prev) => [
                    ...prev,
                    {
                        type: "system",
                        text: `${userData.user.name} has joined the group.`,
                        timestamp: formattedCurrentTime,
                    },
                ]);
            }
            return () => {
                channel.stopListening("GroupMessageSent");
                echo.leave(`group`);
            };
        });

        // Listen for user left (but not yourself)
        groupUserChannel.leaving((userData) => {
            console.log("leaving => ", userData.user.name);
            if (parseInt(userData.user.id) !== parseInt(userId)) {
                setMessages((prev) => [
                    ...prev,
                    {
                        type: "system",
                        text: `${userData.user.name} has left the group.`,
                        timestamp: formattedCurrentTime,
                    },
                ]);
            }
        });

        return () => {
            channel.stopListening("GroupMessageSent");
            // channel.stopListening("GroupUserSent");
            echo.leave(`group`);
            echo.leave(`groupUser`);
        };
    }, [echo]);

    const handleSend = () => {
        if (!message.trim()) return;

        axios
            .post("group/message", {
                group_id: groupid,
                message: message,
            })
            .then((res) => {
                if (res.statusText === "No Content") {
                    setMessages((prev) => [
                        ...prev,
                        { text: message, type: "sent", timestamp: formattedCurrentTime },
                    ]);
                    setMessage("");
                }
            })
            .catch((error) => console.log("Error sending message:", error));
    };

    const updateUnread = (message_id = null, group_id = null) => {
        if (group_id) {
            axios
                .post("group/update-unread", {
                    group_id: group_id,
                    message_id: message_id,
                })
                .then((res) => {
                    if (!res.data.success) {
                        console.log("Error updating unread messages:");
                    }
                })
                .catch((error) => console.log("Error updating message:", error));
        }
    };

    // const groupDetails = () => {

    // }

    const threeDotMenus = [
        {
            name: "Group Info",
            action: null,
            navigation: "info",
        },
        {
            name: "Edit",
            action: null,
            navigation: "edit",
        },
    ];
    return (
        <div className={`container h-screen bg-gray-100 lg:w-1/2 shadow-md ${Styles.chatMargin} mx-auto flex flex-col`}>
            {/* Header */}
            <header className="bg-white text-black shadow-md">
                <div className="container mx-auto flex items-center justify-between py-4 px-6">
                    <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faArrowLeft} className="cursor-pointer" onClick={() => navigate('/contact')} />
                        <img src={ (groupUser?.image ? process.env.REACT_APP_BACKEND_IMAGE_URL+groupUser?.image : "/images/group-avatar.svg") || "/images/group-avatar.svg"} alt="Profile" className="w-10 h-10 rounded-full border-2 border-gray-300" />
                        <div>
                            <p className="text-sm font-medium">{groupUser?.name || "Group"}</p>
                        </div>
                    </div>
                    <div>
                        <ThreeDotMenu threeDotMenus={threeDotMenus} />
                    </div>
                </div>
            </header>

            {/* Chat Messages */}
            <div ref={chatContainerRef} className="flex flex-col flex-1 p-4 overflow-y-auto pb-16">
                {loading && page === 1 && <p>Loading...</p>}
                {loading && page > 1 && <p className="mb-2">Loading more messages...</p>}

                {messages.length === 0 && !loading ? (
                    <div className="text-center text-gray-500 mt-10">No messages yet. Start the conversation!</div>
                ) : (
                    messages.map((msg, index) => {
                        if (msg.type === "system") {
                            return (
                                <div key={index} className="text-center text-sm text-gray-500 mb-4 italic">
                                    {msg.text}
                                </div>
                            );
                        }

                        return (
                            <div key={index} className={`flex items-end gap-2 mb-4 ${msg.type === "received" ? "justify-start" : "justify-end"}`}>
                                {msg.type === "received" && (
                                    <img src={ msg.image ? process.env.REACT_APP_BACKEND_IMAGE_URL+msg.image : "/images/avatar.svg"} alt="avatar" className="w-8 h-8 rounded-full self-start" />
                                )}
                                <div className={`max-w-md px-4 py-2 rounded-xl shadow-md ${msg.type === "received" ? "bg-white text-black" : "bg-blue-950 text-white"}`}>
                                    {msg.type === "received" && (
                                        <p className="text-sm font-semibold text-gray-400 mb-1">{msg.sender}</p>
                                    )}
                                    <p className="break-words">{msg.text}</p>
                                    <p className={`text-xs ${msg.type === "received" ? "text-gray-500" : "text-gray-400"} text-right mt-1`}>
                                        {msg.timestamp}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <div className="bg-white p-4 flex gap-2 sticky bottom-0 w-full mx-auto shadow-md">
                <input
                    type="text"
                    placeholder="Type your message..."
                    className="w-full p-2 border border-gray-400 rounded-lg"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button className="bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-blue-900" onClick={handleSend}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </div>
        </div>
    );
};

export default Groupchat;
