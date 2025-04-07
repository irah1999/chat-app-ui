import React, { useEffect, useState, useRef } from 'react';
import useEcho from '../../hooks/echo';
import { useSelector, useDispatch } from 'react-redux';
import { axios } from '../../lib/axios';
import Styles from '../chat/chat.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { chatUser } from '../../redux/slices/chatSlice';
import { updateGroupChatUser } from '../../redux/slices/groupChatSlice';
import ThreeDotMenu from '../../components/ThreeDotMenu/ThreeDotMenu';
import MultiSelectDropdown from '../../components/MultiSelectDropdown/MultiSelectDropdown';
import LoaderButton from '../../components/Loader/LoaderButton';
import Toast from "../../components/Toast/toast";

const Contact = () => {
    const echo = useEcho();
    const user = useSelector((state) => state.auth.user);
    const chatContainerRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addUser, setAddusers] = useState([]);
    const [formData, setFormData] = useState({ name: "", user: addUser });
    const [loadingBtn, setLoadingBtn] = useState(false);

    const fetchContact = async (page = 1, searchTerm = '') => {
        if (!hasMore && page !== 1) return;

        setLoading(true);
        try {
            const response = await axios.post("group/getConversations", {
                limit: 20,
                page,
                search: searchTerm
            });

            const contactList = response.data.data;

            if (page === 1) {
                setContacts(contactList);
            } else {
                setContacts((prev) => [...prev, ...contactList]);
            }

            setHasMore(contactList.length === 20);
        } catch (err) {
            console.error("Error fetching contacts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContact(page, search);
    }, [page]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setPage(1);
            setHasMore(true);
            fetchContact(1, search);
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [search]);

    const handleScroll = () => {
        const container = chatContainerRef.current;
        if (
            container.scrollHeight - container.scrollTop <= container.clientHeight + 100 &&
            !loading &&
            hasMore
        ) {
            setPage((prev) => prev + 1);
        }
    };

    useEffect(() => {
        if (!echo || !user?.id) return;
        console.log("echo => ", echo);

        const channel = echo.private(`chat.${user.id}`);
        const groupChannel = echo.join(`group`);

        channel.listen("MessageSent", () => {
            setPage(1);
            // setContacts([]);
            fetchContact();
            setHasMore(true);
        });

        groupChannel.listen("GroupMessageSent", (event) => {
            console.log("group event => ", event);
            if (parseInt(event.sender_id) !== parseInt(user.id)) {
                setPage(1);
                // setContacts([]);
                fetchContact();
                setHasMore(true);
            }
        });

        return () => {
            channel.stopListening("MessageSent");
            groupChannel.stopListening("GroupMessageSent");
            echo.leave(`presence-group`);
        };
    }, [echo, user]);

    const handleClick = (member) => {
        if (member.type === 'group') {
            dispatch(updateGroupChatUser({
                id: member.group_id,
                group_id: member.group_id,
                name: member.name,
                image: member.image
            }));
            navigate(`/group-chat`);
        } else {
            dispatch(chatUser(member));
            navigate(`/chat`);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            Toast.showError("Group name is required.");
            return;
        }

        if (!addUser || addUser.length < 2) {
            Toast.showError("Please select at least two users.");
            return;
        }

        formData.user = addUser;
        setLoadingBtn(true);

        axios.post("group/create-group", formData)
            .then(res => {
                if (res.data.success) {
                    Toast.showSuccess(res.data.message);
                    setIsModalOpen(false);
                    setPage(1);
                    // setContacts([]);
                    fetchContact();
                    setHasMore(true);
                } else {
                    Toast.showError(res.data.message);
                }
            })
            .catch(err => {
                console.log("Error:", err);
            })
            .finally(() => {
                setLoadingBtn(false);
            });
    };

    const handleAddUser = (user) => setAddusers(user);

    const threeDotMenus = [
        { name: "+ Group Chat", action: () => setIsModalOpen(true) },
        { name: "Profile", navigation: "/profile" },
        { name: "Logout", navigation: "/logout" }
    ];

    return (
        <div className={`container h-screen bg-gray-100 lg:w-1/2 shadow-md ${Styles.chatMargin} mx-auto flex flex-col`}>
            <header className="bg-white text-black shadow-md">
                <div className="container mx-auto flex items-center justify-between py-4 px-6">
                    <div className="flex items-center space-x-2">
                        <img
                            src={user?.image || "images/avatar.svg"}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-gray-300"
                        />
                        <div>
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                    </div>
                    <ThreeDotMenu threeDotMenus={threeDotMenus} />
                </div>
            </header>

            <div
                ref={chatContainerRef}
                className="flex flex-col flex-1 p-4 overflow-y-auto pb-16"
                onScroll={handleScroll}
            >
                {/* Search Bar */}
                <div className="flex items-center border-b mb-4">
                    <div className="relative w-full">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <FontAwesomeIcon icon={faSearch} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-900"
                        />
                    </div>
                </div>
                {loading && page === 1 && <p>Loading...</p>}
                {contacts.length === 0 && !loading ? (
                    <div className="text-center text-gray-500 py-10">
                        <p className="text-sm">No contacts found</p>
                    </div>
                ) : (
                    contacts.map((member, index) => (
                        <div
                            key={index}
                            onClick={() => handleClick(member)}
                            className="flex items-center justify-between p-4 border-b bg-white hover:bg-gray-50 cursor-pointer"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <img
                                        src={
                                            member?.image
                                                ? `${process.env.REACT_APP_BACKEND_IMAGE_URL}${member.image}`
                                                : member.type === 'group'
                                                    ? '/images/group-avatar.svg'
                                                    : '/images/avatar.svg'
                                        }
                                        alt={member.name}
                                        className="w-12 h-12 rounded-full border border-gray-300"
                                    />
                                    {member.type === 'group' && (
                                        <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[10px] px-1 rounded">
                                            G
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col max-w-[200px]">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{member.name}</p>
                                        {member.type === 'group' ? (
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Group</span>
                                        ) : (
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Private</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">
                                        {member.last_message
                                            ? (member.last_message.length > 50
                                                ? member.last_message.slice(0, 50) + "..."
                                                : member.last_message)
                                            : "Start the conversation"}
                                    </p>
                                </div>
                            </div>
                            {member.unread_messages > 0 && (
                                <div className="flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                                    {member.unread_messages}
                                </div>
                            )}
                        </div>
                    ))
                )}
                {loading && page > 1 && <p>Loading more contacts...</p>}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-blue-950">+ Create Group</h2>
                            <FontAwesomeIcon icon={faTimes} className="cursor-pointer" onClick={() => setIsModalOpen(false)} />
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-medium text-gray-700">Group Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-950"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-medium text-gray-700">Add Users</label>
                                <MultiSelectDropdown handleAddUser={handleAddUser} />
                            </div>
                            <div className="flex items-center justify-end">
                                <LoaderButton isLoading={loadingBtn} text="Create" loadingText="Processing..." />
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contact;
