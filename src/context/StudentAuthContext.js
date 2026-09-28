import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import studentService from "../api/studentService";
import { getStudentToken, STUDENT_TOKEN_KEY } from "../utils/studentToken";

const STUDENT_PROFILE_KEY = "setulearn_student_profile";

const StudentAuthContext = createContext(null);

function readCachedStudent() {
  try {
    const raw = localStorage.getItem(STUDENT_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function StudentAuthProvider({ children }) {
  const [student, setStudent] = useState(() => readCachedStudent());
  const [token, setToken] = useState(() => getStudentToken());
  const [loading, setLoading] = useState(!!getStudentToken());

  const applySession = useCallback((accessToken, studentData) => {
    localStorage.setItem(STUDENT_TOKEN_KEY, accessToken);
    localStorage.setItem("token", accessToken);
    if (studentData) {
      localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(studentData));
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    setToken(accessToken);
    setStudent(studentData || null);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STUDENT_TOKEN_KEY);
    localStorage.removeItem(STUDENT_PROFILE_KEY);
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setStudent(null);
  }, []);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    studentService
      .getProfile()
      .then((profile) => {
        if (cancelled) return;
        setStudent(profile);
        localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(profile));
      })
      .catch(() => {
        if (cancelled) return;
        clearSession();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, clearSession]);

  const signup = useCallback(
    async ({ name, email, phone, password }) => {
      const data = await studentService.signup({ name, email, phone, password });
      applySession(data.accessToken, data.student);
      return data.student;
    },
    [applySession]
  );

  const login = useCallback(
    async ({ email, password }) => {
      const data = await studentService.login({ email, password });
      applySession(data.accessToken, data.student);
      return data.student;
    },
    [applySession]
  );

  const googleLogin = useCallback(
    async ({ idToken, phone, name }) => {
      const data = await studentService.googleAuth({ idToken, phone, name });
      applySession(data.accessToken, data.student);
      return data.student;
    },
    [applySession]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const updateProfile = useCallback(async (payload) => {
    const updated = await studentService.updateProfile(payload);
    setStudent(updated);
    localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(updated));
    return updated;
  }, []);

  return (
    <StudentAuthContext.Provider
      value={{
        student,
        token,
        loading,
        isAuthenticated: !!token && !!student,
        signup,
        login,
        googleLogin,
        logout,
        updateProfile,
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error("useStudentAuth must be used within StudentAuthProvider");
  }
  return context;
}

export { getStudentToken };
