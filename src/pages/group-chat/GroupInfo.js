import { useEffect, useState, useRef } from "react";
import { axios } from "../../lib/axios";
import { useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GroupInfo = ({ groupId }) => {
    const [group, setGroup] = useState(null);
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const containerRef = useRef();
    const groupUser = useSelector((state) => state.groupChat.groupUser);

    useEffect(() => {
        setGroup(groupUser);
        fetchUsers(page);
    }, []);

    const fetchUsers = async (pageNum) => {
        if (!hasMore || loading) return;

        setLoading(true);
        try {
            const res = await axios.post("group/info", {
                group_id: groupUser?.group_id,
                page: pageNum,
                limit: 20,
            });

            const newUsers = res.data.users;

            if (newUsers.length === 0) {
                setHasMore(false);
            } else {
                setUsers((prev) => {
                    const uniqueUsers = newUsers.filter(
                        (newUser) =>
                            !prev.some((existingUser) => existingUser.id === newUser.id)
                    );
                    return [...prev, ...uniqueUsers];
                });
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = () => {
        const container = containerRef.current;
        if (
            container.scrollTop + container.clientHeight >=
                container.scrollHeight - 10 &&
            hasMore &&
            !loading
        ) {
            setPage((prev) => {
                const next = prev + 1;
                fetchUsers(next);
                return next;
            });
        }
    };

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/group-chat')}
                    className="text-blue-950 hover:text-blue-900 mb-4 flex items-center gap-1 font-medium"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>

                {group && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-blue-950 mb-3">
                            {group.name}
                        </h2>
                        <img
                            src={
                                group.image
                                    ? process.env.REACT_APP_BACKEND_IMAGE_URL +
                                      group.image
                                    : "/images/group-avatar.svg"
                            }
                            alt="Group"
                            className="w-28 h-28 rounded-full mx-auto border-4 border-blue-100 shadow mb-4"
                        />
                        <p className="text-center text-gray-600 text-sm mb-2">
                            Total Members:{" "}
                            <span className="font-semibold">{users.length}</span>
                        </p>
                    </>
                )}

                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search members..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900"
                />

                <div
                    className="h-96 overflow-y-auto border rounded p-2"
                    ref={containerRef}
                    onScroll={handleScroll}
                >
                    {filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className="flex gap-3 items-center mb-3 border-b pb-2"
                        >
                            <img
                                src={
                                    user?.image
                                        ? `${process.env.REACT_APP_BACKEND_IMAGE_URL}${user.image}`
                                        : "/images/avatar.svg"
                                }
                                className="w-10 h-10 rounded-full"
                                alt={user.name}
                            />
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                        </div>
                    ))}

                    {/* Loading Spinner */}
                    {loading && (
                        <div className="flex justify-center py-3">
                            <div className="w-6 h-6 border-2 border-blue-950 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {!hasMore && !loading && (
                        <p className="text-sm text-center text-gray-400 mt-4">
                            No more users
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupInfo;
