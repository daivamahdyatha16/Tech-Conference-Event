import axios from "axios";
import toast from "react-hot-toast";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isHandling401 = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl: string = error.config?.url ?? "";
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");
    const hadStoredToken = !!localStorage.getItem("token");

    if (error.response?.status === 401 && hadStoredToken && !isAuthEndpoint) {
      if (!isHandling401) {
        isHandling401 = true;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Sesi kamu telah berakhir. Silakan login kembali.", {
          id: "session-expired-toast",
        });

        setTimeout(() => {
          isHandling401 = false;
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }, 1000);
      }
    }

    return Promise.reject(error);
  },
);