import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const onChangeForm = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();

    const result = await login(formData);

    if (!result.success) {
      alert(result.message);
      return;
    }

    navigate("/api-list");
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>로그인</h1>

        <form onSubmit={onSubmitForm}>
          <div className="form-row">
            <label>이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChangeForm}
              placeholder="admin@test.com"
            />
          </div>

          <div className="form-row">
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={onChangeForm}
              placeholder="비밀번호 입력"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="auth-link">
          계정이 없나요? <Link to="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  );
}