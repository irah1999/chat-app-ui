import React, { useEffect, useState, useRef } from 'react';
import useEcho from '../../hooks/echo';
import { useSelector } from 'react-redux';
import { axios } from '../../lib/axios';
import Styles from '../chat/chat.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { chatUser } from '../../redux/slices/chatSlice';

const Contact = () => { 
    const echo = useEcho();
    const user = useSelector((state) => state.auth.user);
    const chatContainerRef = useRef(null);
    const dispatch = useDispatch();

    const [message, setMessage] = useState("");
    const [contacts, setContacts] = useState([]);  // Store chat history
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1); // Track current page
    const [hasMore, setHasMore] = useState(true); // Check if there are more messages to load

    // useRef to track if effect has already run
    const hasFetched = useRef(false);

    const navigate = useNavigate();

    // Fetch messages from API
    const fetchContact = async (page) => {
        if (!hasMore) return;  // Don't fetch if there are no more messages to load

        setLoading(true);
        try {
            const response = await axios.post("get-member", {
                limit: 50,
                page: page,
            });
            const contactList = response.data.data;
            setContacts(contactList); // Append new messages
            setHasMore(contactList.length > 0); // Check if there are more messages
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
        fetchContact(page);

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

        console.log("echo => ", echo)

        const channel = echo.private(`chat.${user.id}`);

        channel.listen("MessageSent", (event) => {
            console.log("event => ", event)
            if (parseInt(event.receiver.id) === parseInt(user.id)) {
                fetchContact();
                // setMessages((prev) => [...prev, { text: event.message, type: "received" }]);
            }
        });

        return () => {
            channel.stopListening("MessageSent");
        };
    }, [echo, user]);


    // Scroll to the bottom when new messages are added
    useEffect(() => {
        const container = chatContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight; // Scroll to the bottom
        }
    }, [contacts]);

    const handleClick = (member) => {
        console.log("member => ", member)
        dispatch(chatUser(member));
        navigate(`/chat`);
    }
    return (
        <div className={`container h-screen bg-gray-100 lg:w-1/2 shadow-md ${Styles.chatMargin} mx-auto flex flex-col`}>
            {/* Header */}
            <header className="bg-white text-black shadow-md">
                <div className="container mx-auto flex items-center justify-between py-4 px-6">
                    <div>
                        <h3 className='text-blue-950 font-medium'>Contact List</h3>
                    </div>

                    <div className="flex items-center space-x-2">
                        <img
                            src="/images/avatar.svg"
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-gray-300"
                        />
                        <div>
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-gray-400">{user?.email}</p>
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

                {contacts.map((member, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 border-b hover:bg-white cursor-pointer transition" 
                        onClick={() => handleClick(member)}
                    >
                        <div className="flex items-center space-x-3">
                            <img
                                src="/images/avatar.svg"
                                alt={member.name}
                                className="w-12 h-12 rounded-full border-2 border-gray-300"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-medium">{member.name}</p>
                                <p className="text-xs text-gray-500 truncate">{member.last_message}</p>
                            </div>
                        </div>
                        {member.unread_messages > 0 && (
                            <div className="flex items-center justify-center w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full">
                                {member.unread_messages}
                            </div>
                        )}

                    </div>
                ))}

                {loading && page > 1 ? <p>Loading more messages...</p> : null}
            </div>
        </div>
    );
};

export default Contact;
