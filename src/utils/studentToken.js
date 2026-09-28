const STUDENT_TOKEN_KEY = "setulearn_student_token";

export function getStudentToken() {
  try {
    return (
      localStorage.getItem(STUDENT_TOKEN_KEY) ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      null
    );
  } catch {
    return null;
  }
}

export { STUDENT_TOKEN_KEY };
