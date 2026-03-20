import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    role: "tester",
    tenantId: "",
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

    if (!formData.email || !formData.password || !formData.name) {
      alert("필수값을 입력해주세요.");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      alert("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    const payload = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      role: formData.role,
      tenantId: formData.tenantId,
    };

    const result = await signup(payload);

    if (!result.success) {
      alert(result.message);
      return;
    }

    alert("회원가입이 완료되었습니다.");
    navigate("/login");
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>회원가입</h1>

        <form onSubmit={onSubmitForm}>
          <div className="form-row">
            <label>이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChangeForm}
              placeholder="이름 입력"
            />
          </div>

          <div className="form-row">
            <label>이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChangeForm}
              placeholder="user@test.com"
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

          <div className="form-row">
            <label>비밀번호 확인</label>
            <input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={onChangeForm}
              placeholder="비밀번호 다시 입력"
            />
          </div>

          <div className="form-row">
            <label>권한</label>
            <select
              name="role"
              value={formData.role}
              onChange={onChangeForm}
            >
              <option value="tester">tester</option>
              <option value="viewer">viewer</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <div className="form-row">
            <label>tenantId</label>
            <input
              type="text"
              name="tenantId"
              value={formData.tenantId}
              onChange={onChangeForm}
              placeholder="예: ark-safe"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="auth-link">
          이미 계정이 있나요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}