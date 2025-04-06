const setLocalStorage = (token, user) => {
    localStorage.setItem("jwt_token", token);
}

const removeLocalStorage = () => {
    localStorage.removeItem("jwt_token");
    localStorage.clear();
}

const getLocalStorage = () => {
    return {
        token: localStorage.getItem("jwt_token") ? localStorage.getItem("jwt_token") : null,
    };
};


export { setLocalStorage, removeLocalStorage, getLocalStorage }