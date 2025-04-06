import { useEffect, useState, useRef } from "react";
import { axios } from "../../lib/axios";
import { useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import Toast from "../../components/Toast/toast";
import LoaderButton from "../../components/Loader/LoaderButton";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { groupChatUser, updateGroupChatUser } from '../../redux/slices/groupChatSlice';

const GroupEdit = ({ groupId }) => {
    const [group, setGroup] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [existingUsers, setExistingUsers] = useState([]);
    const [name, setName] = useState("");
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const containerRef = useRef();
    const groupUser = useSelector((state) => state.groupChat.groupUser);

    useEffect(() => {
        if (groupUser) {
            setGroup(groupUser);
            setName(groupUser.name);
            setPreviewImage(process.env.REACT_APP_BACKEND_IMAGE_URL + groupUser.image);
            setSelectedUsers(groupUser.users || []);
        }

        fetchUsers(1);
    }, []);

    const fetchUsers = async (pageNum) => {
        if (!hasMore || loading) return;

        setLoading(true);
        try {
            const res = await axios.post("group/info/users", {
                group_id: groupUser?.group_id,
                page: pageNum,
                limit: 20,
            });

            const existingUserIds = res.data.group_users.map((u) => u.id) || [];
            setExistingUsers(res.data.group_users);

            // Exclude already added users
            const newUsers = res.data.users.filter(
                (user) => !existingUserIds.includes(user.id)
            );

            if (newUsers.length === 0) {
                setHasMore(false);
            } else {
                setAllUsers((prev) => {
                    const uniqueUsers = newUsers.filter(
                        (newUser) => !prev.some((existingUser) => existingUser.id === newUser.id)
                    );
                    return [...prev, ...uniqueUsers];
                });
            }
        } catch (error) {
            console.log("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = () => {
        const container = containerRef.current;
        if (
            container.scrollTop + container.clientHeight >= container.scrollHeight - 10 &&
            hasMore &&
            !loading
        ) {
            const next = page + 1;
            setPage(next);
            fetchUsers(next);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const toggleUser = (user) => {
        const isSelected = selectedUsers.some((u) => u.id === user.id);
        if (isSelected) {
            setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id));
        } else {
            setSelectedUsers((prev) => [...prev, user]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            Toast.showError("Group name is required.");
            return;
        }

        // if (selectedUsers.length < 2) {
        //     Toast.showError("Select at least 2 users.");
        //     return;
        // }

        const formData = new FormData();
        formData.append("group_id", groupUser.group_id);
        formData.append("name", name);
        if (image) {
            formData.append("image", image);
        }
        selectedUsers.forEach((user) => {
            formData.append("user[]", user.id);
        });

        try {
            setSaving(true);
            const response = await axios.post("/group/Update-group", formData);
            console.log("response => ", response.data);
            const groupDet = {
                id: response.data.group.id,
                group_id: response.data.group.id,
                name: response.data.group.name,
                image: response.data.group.image
            };
            dispatch(updateGroupChatUser(groupDet))
            Toast.showSuccess("Group updated successfully!");
            navigate('/group-chat/info');
        } catch (err) {
            console.log(err);
            Toast.showError("Failed to update group.");
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = allUsers.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
                <button
                    onClick={() => navigate('/group-chat')}
                    className="text-blue-950 hover:text-blue-900 mb-4 flex items-center gap-1 font-medium"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>

                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold text-center text-blue-950 mb-3">
                        Edit Group
                    </h2>

                    {/* Group Image Upload */}
                    <div className="flex justify-center mb-4">
                        <label htmlFor="groupImage" className="cursor-pointer">
                            <img
                                src={previewImage || "/images/group-avatar.svg"}
                                alt="Group"
                                className="w-28 h-28 rounded-full border-4 border-blue-100 shadow object-cover"
                            />
                        </label>
                        <input
                            type="file"
                            id="groupImage"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                    <p className="text-sm text-blue-950 mb-2 text-end">
                        Total Members:{" "}
                        <span className="font-semibold">{existingUsers.length}</span>
                    </p>
                    {/* Name Input */}
                    <input
                        type="text"
                        placeholder="Group name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />

                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />

                    {/* Selected count */}
                    <div className="flex justify-between mb-4">
                        <p className="text-sm text-blue-950 mb-2">
                            Selected users:{" "}
                            <span className="font-semibold">{selectedUsers.length}</span>
                        </p>
                    </div>

                    {/* User List */}
                    <div
                        className="h-96 overflow-y-auto border rounded p-2 mb-4"
                        ref={containerRef}
                        onScroll={handleScroll}
                    >
                        {filteredUsers.map((user) => {
                            const isSelected = selectedUsers.some(
                                (u) => u.id === user.id
                            );
                            return (
                                <div
                                    key={user.id}
                                    className={`flex gap-3 items-center mb-3 border-b pb-2 cursor-pointer ${
                                        isSelected
                                            ? "bg-blue-100"
                                            : "hover:bg-gray-100"
                                    } rounded px-2`}
                                    onClick={() => toggleUser(user)}
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
                            );
                        })}

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

                    {/* Submit Button */}
                    <LoaderButton
                        isLoading={saving}
                        text="Save Changes"
                        loadingText="Saving..."
                    />
                </form>
            </div>
        </div>
    );
};

export default GroupEdit;
