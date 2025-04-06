import React, { useEffect, useState, useRef } from 'react'
import useEcho from '../../hooks/echo';
import { useSelector } from 'react-redux';
import { axios } from '../../lib/axios';

const Dashboard = () => {
    const echo = useEcho();
    const user = useSelector((state) => state.auth.user);
    const effectRan = useRef(false);
    
    const [message, setMessage] = useState("");
    const [receivedMessages, setReceivedMessages] = useState([]);  // Store chat history
    const [senderMessages, setSenderMessages] = useState([]);  // Store chat history


    useEffect(() => {
        if (!echo || !user?.id) return;
    
        console.log("Echo connected:", echo);
    
        const channel = echo.private(`chat.${user.id}`);
    
        channel.listen("MessageSent", (event) => {
            console.log("Real-time event received:", event);
            console.log("event.receiver.id:", event.receiver.id);
            
            if (parseInt(event.receiver.id) === parseInt(user.id)) {
                console.log("user.id:", user.id);
                setReceivedMessages((prev) => [...prev, { text: event.message, type: "received" }]);
            }
        });
    
        return () => {
            channel.stopListening("MessageSent"); // Cleanup listener on unmount
        };
    }, [echo, user]); // Do not include `messages` in dependencies
    
    

    const handleSend = (receiverId) => {

        axios.post("send-message", {
            user_id: receiverId,
            from: user?.id,
            message: message,
        })
        .then(res => {
            if (res.statusText === 'No Content') {
                setSenderMessages((prev) => [...prev, { text: senderMessages, type: "sent" }]);
                setMessage("");
            }
        })
        .catch((error) => console.error("Error sending message:", error));
    };



    return (
        <div className="flex flex-col h-screen bg-gray-100 w-1/2 mx-auto">
            {/* Header */}
            <div className="bg-blue-500 text-white p-4 flex items-center">
                <h1 className="text-lg font-bold">Chat Application</h1>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex flex-col gap-4">

                    {/* Incoming Message */}
                    {receivedMessages.map((msg, index) => (
                        <div key={index} className="flex items-end gap-2 self-start">
                            <div className="bg-greay-500 text-black p-3 border rounded-lg">
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}

                    {/* Outgoing Message */}
                    <div className="flex items-end gap-2 self-end">
                        <div className="bg-blue-500 text-white p-3 rounded-lg">
                            <p>How do you think?</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message Input */}
            <div className="bg-gray-200 p-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Type your message..."
                    className="w-full p-2 border border-gray-400 rounded-lg"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    onClick={() => handleSend(user?.id)}
                > Send
                </button>
            </div>
        </div>
    )
}

export default Dashboard