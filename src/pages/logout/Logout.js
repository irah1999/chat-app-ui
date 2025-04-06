import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { removeLocalStorage } from "../../utils/LocalStorage";
import { persistor } from "../../redux/store";
import Toast from "../../components/Toast/toast";
import { axios } from "../../lib/axios";

const Logout = () => {
    const navigate = useNavigate();
    const hasMore = useRef(false);

    useEffect(() => {
        if (hasMore.current) return;
        hasMore.current = true;

        const logout = async () => {
            try {
                const response = await axios.post("auth/logout");
                if (response.status === 200) {
                    removeLocalStorage();
                    persistor.purge();
                    Toast.showSuccess("Logout successfully");
                } else {
                    Toast.showError("Logout failed. Please try again.");
                }
                navigate("/login");
            } catch (err) {
                Toast.showError("Logout failed. Please try again.");
            }
        };

        logout();
    }, [navigate]);

    return null;
};

export default Logout;
