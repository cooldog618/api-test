import { create } from "zustand";
import axios from "axios";
import api from "../api/axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
  loading: false,
  initialized: false,

  signup: async (payload) => {
    set({ loading: true });

    try {
      const res = await api.post("/auth/signup", payload);
      return { success: true, data: res.data };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message || "회원가입 중 오류가 발생했습니다.",
      };
    } finally {
      set({ loading: false });
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true });

    try {
      const res = await api.post("/auth/login", { email, password });

      const { accessToken, refreshToken, user } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message || "로그인 중 오류가 발생했습니다.",
      };
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (accessToken) {
        await api.post("/auth/logout");
      }
    } catch (error) {
      console.error("logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        initialized: true,
      });
    }
  },

  fetchMe: async () => {
    try {
      const res = await api.get("/auth/me");

      set({
        user: res.data.user,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message || "사용자 정보 조회에 실패했습니다.",
      };
    }
  },

  refreshAccessToken: async () => {
    try {
      const savedRefreshToken = localStorage.getItem("refreshToken");

      if (!savedRefreshToken) {
        throw new Error("리프레시 토큰 없음");
      }

      const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: savedRefreshToken,
      });

      const newAccessToken = res.data.accessToken;

      localStorage.setItem("accessToken", newAccessToken);

      set({
        accessToken: newAccessToken,
        isAuthenticated: true,
      });

      return { success: true, accessToken: newAccessToken };
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });

      return {
        success: false,
        message:
          error?.response?.data?.message || "토큰 재발급에 실패했습니다.",
      };
    }
  },

  initializeAuth: async () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken && !refreshToken) {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        initialized: true,
      });
      return;
    }

    const meResult = await get().fetchMe();

    if (meResult.success) {
      set({ initialized: true });
      return;
    }

    const refreshResult = await get().refreshAccessToken();

    if (!refreshResult.success) {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        initialized: true,
      });
      return;
    }

    const secondMeResult = await get().fetchMe();

    set({
      initialized: true,
      isAuthenticated: secondMeResult.success,
    });
  },
}));

export default useAuthStore;