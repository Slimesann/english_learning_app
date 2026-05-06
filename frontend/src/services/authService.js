import api from "./api";

export const loginService = async (credentials) => {
    const res = await api.post("/auth/login", credentials);

    const { token, user } = res.data;

    if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    return { token, user };
};

export const registerService = (data) => api.post("/auth/register", data);

export const logoutService = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
};

export const getProfileService = async () => {
    const res = await api.get("/users/me");
    return res.data;
};
