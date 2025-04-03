const setLocalStorage = (token, user) => {
    localStorage.setItem("jwt_token", token);
    localStorage.setItem("email", user.email);
    localStorage.setItem("id", user.id);
    localStorage.setItem("name", user.name);
}

const removeLocalStorage = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    localStorage.removeItem("id");
    localStorage.removeItem("token");
}

const getLocalStorage = () => {
    return {
        token: localStorage.getItem("jwt_token") ? localStorage.getItem("jwt_token") : null,
        email: localStorage.getItem("email") ? localStorage.getItem("email") : null,
        name: localStorage.getItem("name") ? localStorage.getItem("name") : null,
        id: localStorage.getItem("id") ? localStorage.getItem("id") : null
    };
};


export { setLocalStorage, removeLocalStorage, getLocalStorage }