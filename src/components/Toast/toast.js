import { toast } from "react-toastify";

const showSuccess = (mesg) => {
    toast.success(mesg);
};

const showError = (msg) => {
    toast.error(msg);
};

export default { showSuccess, showError }