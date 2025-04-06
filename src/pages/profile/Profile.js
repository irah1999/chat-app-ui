import React, { useState } from "react";
import { Pencil, Upload, MessageCircle, ArrowLeft, Eye, EyeOff } from "lucide-react"; // Added Eye and EyeOff icons
import { useNavigate } from "react-router-dom";
import { axios } from "../../lib/axios";
import Toast from "../../components/Toast/toast";
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../redux/slices/authSlice';
import { persistor } from '../../redux/store';

const ProfileCard = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    console.log("profile user => ", user);
    const navigate = useNavigate();
    const [uploadImage, setUploadImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: user?.name,
        email: user?.email,
        password: "",
        confirmPassword: "",
        image: user?.image,
    });
    const [passwordVisible, setPasswordVisible] = useState(false); // State to toggle password visibility
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // State to toggle confirm password visibility

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfile({ ...profile, image: URL.createObjectURL(file) });
            setUploadImage(file);
        }
    };

    const handleSaveChanges = () => {
        const formData = new FormData();
        formData.append("name", profile.name);
        formData.append("email", profile.email);
        formData.append("password", profile.password);
        formData.append("confirm_password", profile.confirmPassword);
        if (uploadImage) {
            formData.append("image", uploadImage);
        }
        // Send the form data to the backend (Laravel)
        axios.post("/profile/update", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
            .then((response) => {
                console.log(response.data);
                if (response.data.success) {
                    // Handle success (e.g., show success message, navigate, etc.)
                    dispatch(updateUser(response.data.user));
                    setProfile({ ...profile, image: response.data.user.image });
                    Toast.showSuccess("Profile updated successfully!");
                    setIsEditing(false);
                    return true;
                } else {
                    Toast.showError("Failed to update profile.");
                }
                // navigate("/chat"); // Navigate to chat page after saving changes
            })
            .catch((error) => {
                console.log(error);
                Toast.showError("Failed to update profile.");
                // Handle error (e.g., show error message)
            });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
            <div className="max-w-xl w-full p-6 bg-gradient-to-br from-blue-50 to-white rounded-3xl shadow-2xl">
                <button
                    onClick={() => navigate('/contact')} // This sets isEditing to false to go back to profile details
                    className="mb-4 flex items-center text-blue-950 font-medium hover:text-blue-600"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Contact
                </button>
                <h1 className="text-2xl font-bold text-center text-blue-950 mb-6">Chat-Application</h1>
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-36 h-36">
                        <img
                            src={profile.image || "images/avatar.svg"}
                            alt="Profile"
                            className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-md"
                        />
                        {isEditing && (
                            <label className="absolute bottom-2 right-2 bg-blue-950 text-white p-1 rounded-full shadow-md cursor-pointer hover:bg-blue-900">
                                <Upload className="w-4 h-4" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    <div className="w-full space-y-4">
                        <div className={isEditing ? "text-start" : "text-center"}>
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)} // This sets isEditing to false to go back to profile details
                                        className="mb-4 flex items-center text-blue-950 font-medium hover:text-blue-600"
                                    >
                                        <ArrowLeft className="w-5 h-5 mr-2" />
                                        Back to Profile
                                    </button>
                                    <label htmlFor="name" className="block text-sm font-semibold text-gray-600 mb-1">
                                        Name
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                                    />
                                </>
                            ) : (
                                <p className="text-gray-800 text-base font-medium">
                                    <span className="font-semibold">{profile.name}</span>
                                </p>
                            )}
                        </div>

                        <div className={isEditing ? "text-start" : "text-center"}>
                            {isEditing ? (
                                <>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-600 mb-1">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                                    />
                                </>
                            ) : (
                                <p className="text-gray-800 text-sm font-medium">
                                    <span className="font-semibold">{profile.email}</span>
                                </p>
                            )}
                        </div>

                        {isEditing && (
                            <>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-600 mb-1">
                                        Change Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={passwordVisible ? "text" : "password"} // Toggle password visibility
                                            value={profile.password}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setPasswordVisible(!passwordVisible)} // Toggle password visibility
                                            className="absolute top-1/2 right-3 transform -translate-y-1/2"
                                        >
                                            {passwordVisible ? (
                                                <EyeOff className="w-5 h-5 text-gray-600" />
                                            ) : (
                                                <Eye className="w-5 h-5 text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-600 mb-1">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={confirmPasswordVisible ? "text" : "password"} // Toggle confirm password visibility
                                            value={profile.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} // Toggle confirm password visibility
                                            className="absolute top-1/2 right-3 transform -translate-y-1/2"
                                        >
                                            {confirmPasswordVisible ? (
                                                <EyeOff className="w-5 h-5 text-gray-600" />
                                            ) : (
                                                <Eye className="w-5 h-5 text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex flex-col gap-2">
                            {isEditing ? (
                                <button
                                    onClick={() => handleSaveChanges()}
                                    className="w-full mt-2 bg-blue-950 text-white font-semibold py-2 rounded-lg hover:bg-blue-900"
                                >
                                    Save Changes
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-950 text-white font-medium py-2 rounded-lg hover:bg-blue-900"
                                >
                                    <Pencil className="w-4 h-4" /> Edit Profile
                                </button>
                            )}

                            <button
                                onClick={() => navigate("/contact")}
                                className="w-full bg-blue-950 text-white font-semibold py-2 rounded-lg hover:bg-blue-900 flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="w-4 h-4" /> Go to Chat
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
