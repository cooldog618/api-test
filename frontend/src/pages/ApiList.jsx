import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
//import { importPKCS8, SignJWT } from "jose";
import api from "../api/axios";
import { API_GROUPS, API_SERVERS } from "../data/apiSpecs";

const METHOD_CLASS_MAP = {
  GET: "get",
  POST: "post",
  PUT: "put",
  DELETE: "delete",
  PATCH: "patch",
};

const buildInitialGroupOpen = () => {
  const result = {};
  API_GROUPS.forEach((group) => {
    result[group.key] = true;
  });
  return result;
};

const buildInitialOperationOpen = () => {
  const result = {};
  API_GROUPS.forEach((group) => {
    group.operations.forEach((operation) => {
      result[operation.id] = false;
    });
  });
  return result;
};

const buildInitialTryMode = () => {
  const result = {};
  API_GROUPS.forEach((group) => {
    group.operations.forEach((operation) => {
      result[operation.id] = false;
    });
  });
  return result;
};

const buildInitialPathParams = () => {
  const result = {};
  API_GROUPS.forEach((group) => {
    group.operations.forEach((operation) => {
      result[operation.id] = {};
      (operation.pathParams || []).forEach((param) => {
        result[operation.id][param.name] = param.defaultValue || "";
      });
    });
  });
  return result;
};

const buildInitialRequestInputs = () => {
  const result = {};

  API_GROUPS.forEach((group) => {
    group.operations.forEach((operation) => {
      result[operation.id] = {};

      (operation.requestFields || []).forEach((field) => {
        result[operation.id][field.name] = field.defaultValue ?? "";
      });
    });
  });

  return result;
};

const prettyJson = (value) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
};

const buildRequestBody = (operation, requestInputValues) => {
  const body = {};

  (operation.requestFields || []).forEach((field) => {
    let value = requestInputValues?.[operation.id]?.[field.name];

    if (field.type === "number") {
      value = value === "" || value === null ? null : Number(value);
    }

    if (field.transform === "commaArray") {
      value = String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (field.transform === "boolean") {
      value = value === "true" || value === true;
    }

    body[field.name] = value;
  });

  return body;
};

export default function ApiList() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [selectedServer, setSelectedServer] = useState(
    API_SERVERS[0]?.value || ""
  );

  const [groupOpen, setGroupOpen] = useState(buildInitialGroupOpen);
  const [operationOpen, setOperationOpen] = useState(buildInitialOperationOpen);
  const [tryMode, setTryMode] = useState(buildInitialTryMode);
  const [pathParamValues, setPathParamValues] = useState(buildInitialPathParams);
  const [requestInputValues, setRequestInputValues] = useState(
    buildInitialRequestInputs
  );
  const [responses, setResponses] = useState({});
  const [isAuthorizeOpen, setIsAuthorizeOpen] = useState(false);

  const [authForm, setAuthForm] = useState({
    userID: "",
    role: "",
    tenantID: "",
    scope: "",
    expiresIn: "2h",
  });

  const [privateKeyPem, setPrivateKeyPem] = useState("");
  const [privateKeyFileName, setPrivateKeyFileName] = useState("");
  const [generatedJwt, setGeneratedJwt] = useState("");
  const [jwtLoading, setJwtLoading] = useState(false);

  const toggleGroup = (groupKey) => {
    setGroupOpen((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const toggleOperation = (operationId) => {
    setOperationOpen((prev) => ({
      ...prev,
      [operationId]: !prev[operationId],
    }));
  };

  const toggleTryMode = (operationId) => {
    setTryMode((prev) => ({
      ...prev,
      [operationId]: !prev[operationId],
    }));
  };

  const onChangePathParam = (operationId, paramName, value) => {
    setPathParamValues((prev) => ({
      ...prev,
      [operationId]: {
        ...(prev[operationId] || {}),
        [paramName]: value,
      },
    }));
  };

  const onChangeRequestInput = (operationId, fieldName, value) => {
    setRequestInputValues((prev) => ({
      ...prev,
      [operationId]: {
        ...(prev[operationId] || {}),
        [fieldName]: value,
      },
    }));
  };

  const onChangeAuthForm = (e) => {
    const { name, value } = e.target;
    setAuthForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onChangePrivateKey = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPrivateKeyFileName(file.name);

    const text = await file.text();

    const normalizedPem = text
      .replace(/^\uFEFF/, "")   // BOM 제거
      .replace(/\r\n/g, "\n")   // 줄바꿈 통일
      .trim();

    console.log("private key first line:", normalizedPem.split("\n")[0]);
    console.log("private key last line:", normalizedPem.split("\n").slice(-1)[0]);
    console.log("private key length:", normalizedPem.length);

    setPrivateKeyPem(normalizedPem);
  };

  /*const handleGenerateJwt = async () => {
    try {
      if (!privateKeyPem) {
        alert("Private Key 파일을 먼저 업로드해주세요.");
        return;
      }

      if (!authForm.userID || !authForm.role || !authForm.tenantID) {
        alert("userID, role, tenantID는 필수입니다.");
        return;
      }

      setJwtLoading(true);

      console.log("pem first line before import:", privateKeyPem.split("\n")[0]);

      const privateKey = await importPKCS8(privateKeyPem, "RS256");

      const token = await new SignJWT({
        userID: authForm.userID,
        role: authForm.role,
        tenantID: authForm.tenantID,
        scope: authForm.scope,
      })
        .setProtectedHeader({
          alg: "RS256",
          typ: "JWT",
        })
        .setIssuedAt()
        .setExpirationTime(authForm.expiresIn || "2h")
        .sign(privateKey);

      setGeneratedJwt(token);
      alert("JWT가 생성되었습니다.");
    } catch (error) {
      console.error("JWT generate error:", error);
      alert(`JWT 생성 실패: ${error?.message || "unknown error"}`);
    } finally {
      setJwtLoading(false);
    }
  };*/

  const handleGenerateJwt = async () => {
    try {
      if (!privateKeyPem) {
        alert("Private Key 파일을 먼저 업로드해주세요.");
        return;
      }

      if (!authForm.userID || !authForm.role || !authForm.tenantID) {
        alert("userID, role, tenantID는 필수입니다.");
        return;
      }

      setJwtLoading(true);

      const formData = new FormData();
      formData.append(
        "privateKeyFile",
        new Blob([privateKeyPem], { type: "text/plain" }),
        privateKeyFileName || "private_pkcs8.pem"
      );

      formData.append("userID", authForm.userID);
      formData.append("role", authForm.role);
      formData.append("tenantID", authForm.tenantID);
      formData.append("scope", authForm.scope || "");
      formData.append("expiresIn", authForm.expiresIn || "2h");
      formData.append("typ", "JWT");
      formData.append("alg", "RS256");

      const response = await api.post("/auth/generate-jwt", formData);

      const result = response.data;

      if (!result?.success) {
        throw new Error(result?.message || "JWT 생성 실패");
      }

      setGeneratedJwt(result.token || "");
      alert("JWT가 생성되었습니다.");
    } catch (error) {
      console.error("JWT generate error:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "JWT 생성 실패"
      );
    } finally {
      setJwtLoading(false);
    }
  };

  const resolvePath = (operation) => {
    let resolvedPath = operation.path;

    (operation.pathParams || []).forEach((param) => {
      const value = pathParamValues?.[operation.id]?.[param.name] || "";
      resolvedPath = resolvedPath.replace(
        `{${param.name}}`,
        encodeURIComponent(value)
      );
    });

    return resolvedPath;
  };

  const executeOperation = async (operation) => {
    try {
      if (!generatedJwt) {
        alert("먼저 Authorize에서 JWT를 생성해주세요.");
        return;
      }

      const resolvedPath = resolvePath(operation);

      if (resolvedPath.includes("{") || resolvedPath.includes("}")) {
        alert("Path parameter 값을 모두 입력해주세요.");
        return;
      }

      const url = `${selectedServer}${resolvedPath}`;
      const headers = {
        Authorization: `Bearer ${generatedJwt}`,
      };

      let body;

      if (operation.method !== "GET" && operation.method !== "DELETE") {
        body = buildRequestBody(operation, requestInputValues);
        headers["Content-Type"] = "application/json";
      }

      setResponses((prev) => ({
        ...prev,
        [operation.id]: {
          loading: true,
          requestedUrl: url,
          requestHeaders: headers,
          requestBody: body ?? null,
          status: null,
          data: null,
          headers: null,
          error: null,
        },
      }));

      const response = await fetch(url, {
        method: operation.method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const text = await response.text();
      let parsedData = null;

      try {
        parsedData = text ? JSON.parse(text) : null;
      } catch (error) {
        parsedData = text;
      }

      const responseHeaders = Object.fromEntries(response.headers.entries());

      setResponses((prev) => ({
        ...prev,
        [operation.id]: {
          loading: false,
          requestedUrl: url,
          requestHeaders: headers,
          requestBody: body ?? null,
          status: response.status,
          ok: response.ok,
          data: parsedData,
          headers: responseHeaders,
          error: null,
        },
      }));
    } catch (error) {
      setResponses((prev) => ({
        ...prev,
        [operation.id]: {
          loading: false,
          requestedUrl: `${selectedServer}${resolvePath(operation)}`,
          requestHeaders: {
            Authorization: generatedJwt ? `Bearer ${generatedJwt}` : "(not set)",
          },
          requestBody:
            operation.method !== "GET" && operation.method !== "DELETE"
              ? buildRequestBody(operation, requestInputValues)
              : null,
          status: null,
          data: null,
          headers: null,
          error:
            error?.message ||
            "요청 중 오류가 발생했습니다. 서버 상태나 CORS 설정을 확인해주세요.",
        },
      }));
    }
  };

  const onClickLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="swagger-page">
      <div className="swagger-topbar">
        <div className="swagger-brand">
          <h1>TEST API</h1>
          <div className="swagger-badges">
            <span className="badge gray">V0.0.01</span>
          </div>
          <p>/api/test</p>
          <span>API Test Platform - for TexKim</span>
        </div>

        <div className="swagger-user-box">
          <div className="swagger-user-meta">
            <p>{user?.name}</p>
            <span>{user?.email}</span>
          </div>

          <div className="swagger-top-actions">
            <button
              className={`authorize-btn ${generatedJwt ? "active" : ""}`}
              onClick={() => setIsAuthorizeOpen(true)}
            >
              {generatedJwt ? "Authorized" : "Authorize"}
            </button>

            <button className="logout-btn" onClick={onClickLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="swagger-content">
        <div className="server-row">
          <div className="server-box">
            <label>Servers</label>
            <select
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
            >
              {API_SERVERS.map((server) => (
                <option key={server.value} value={server.value}>
                  {server.label}
                </option>
              ))}
            </select>
          </div>

          <div className="server-note">
            테스트 API 실행은 생성된 JWT를 Authorization 헤더로 전송합니다.
          </div>
        </div>

        {API_GROUPS.map((group) => (
          <div className="api-group" key={group.key}>
            <button
              type="button"
              className="api-group-header"
              onClick={() => toggleGroup(group.key)}
            >
              <div className="api-group-title-wrap">
                <h2>{group.title}</h2>
                <span>{group.description}</span>
              </div>
              <span className="api-group-arrow">
                {groupOpen[group.key] ? "⌃" : "⌄"}
              </span>
            </button>

            {groupOpen[group.key] && (
              <div className="api-group-body">
                {group.operations.map((operation) => {
                  const responseItem = responses[operation.id];
                  const isOpen = operationOpen[operation.id];
                  const isTryMode = tryMode[operation.id];
                  const resolvedPath = resolvePath(operation);
                  const previewBody =
                    operation.method !== "GET" && operation.method !== "DELETE"
                      ? buildRequestBody(operation, requestInputValues)
                      : null;

                  return (
                    <div className="api-operation" key={operation.id}>
                      <button
                        type="button"
                        className="api-operation-summary"
                        onClick={() => toggleOperation(operation.id)}
                      >
                        <div className="api-operation-left">
                          <span
                            className={`method-badge ${
                              METHOD_CLASS_MAP[operation.method] || "get"
                            }`}
                          >
                            {operation.method}
                          </span>

                          <span className="api-path">{operation.path}</span>
                          <span className="api-summary-text">
                            {operation.summary}
                          </span>
                        </div>

                        <div className="api-operation-right">
                          {operation.requiresAuth && (
                            <span className="lock-badge">🔒</span>
                          )}
                          <span>{isOpen ? "⌃" : "⌄"}</span>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="api-operation-detail">
                          <div className="api-detail-top">
                            <div className="api-detail-url">
                              <strong>Request URL</strong>
                              <span>{`${selectedServer}${resolvedPath}`}</span>
                            </div>

                            <div className="api-detail-actions">
                              <button
                                type="button"
                                className="try-btn"
                                onClick={() => toggleTryMode(operation.id)}
                              >
                                {isTryMode ? "Cancel" : "Try it out"}
                              </button>

                              <button
                                type="button"
                                className="execute-btn"
                                onClick={() => executeOperation(operation)}
                              >
                                Execute
                              </button>
                            </div>
                          </div>

                          {!!(operation.pathParams || []).length && (
                            <div className="input-block">
                              <h4>Path Params</h4>
                              <div className="path-param-grid">
                                {operation.pathParams.map((param) => (
                                  <div className="form-field" key={param.name}>
                                    <label>{param.name}</label>
                                    <input
                                      type="text"
                                      value={
                                        pathParamValues?.[operation.id]?.[
                                          param.name
                                        ] || ""
                                      }
                                      onChange={(e) =>
                                        onChangePathParam(
                                          operation.id,
                                          param.name,
                                          e.target.value
                                        )
                                      }
                                      disabled={!isTryMode}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="input-block">
                            <h4>Headers</h4>
                            <pre className="code-block">
{prettyJson({
  Authorization: generatedJwt ? `Bearer ${generatedJwt}` : "(not set)",
})}
                            </pre>
                          </div>

                          {operation.method !== "GET" &&
                            operation.method !== "DELETE" && (
                              <div className="input-block">
                                <h4>Request Body</h4>

                                <div className="jwt-form-grid">
                                  {(operation.requestFields || []).map(
                                    (field) => (
                                      <div
                                        className="form-field"
                                        key={field.name}
                                      >
                                        <label>{field.label || field.name}</label>

                                        {field.type === "select" ? (
                                          <select
                                            value={
                                              requestInputValues?.[
                                                operation.id
                                              ]?.[field.name] ?? ""
                                            }
                                            onChange={(e) =>
                                              onChangeRequestInput(
                                                operation.id,
                                                field.name,
                                                e.target.value
                                              )
                                            }
                                            disabled={!isTryMode}
                                          >
                                            {(field.options || []).map(
                                              (option) => (
                                                <option
                                                  key={option.value}
                                                  value={option.value}
                                                >
                                                  {option.label}
                                                </option>
                                              )
                                            )}
                                          </select>
                                        ) : (
                                          <input
                                            type={
                                              field.type === "number"
                                                ? "number"
                                                : "text"
                                            }
                                            value={
                                              requestInputValues?.[
                                                operation.id
                                              ]?.[field.name] ?? ""
                                            }
                                            onChange={(e) =>
                                              onChangeRequestInput(
                                                operation.id,
                                                field.name,
                                                e.target.value
                                              )
                                            }
                                            disabled={!isTryMode}
                                          />
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>

                                <div style={{ marginTop: "12px" }}>
                                  <h4>Preview JSON</h4>
                                  <pre className="code-block">
{prettyJson(previewBody)}
                                  </pre>
                                </div>
                              </div>
                            )}

                          <div className="input-block">
                            <h4>Response</h4>

                            {responseItem?.loading ? (
                              <div className="response-status">요청 중...</div>
                            ) : responseItem ? (
                              <>
                                <div className="response-meta">
                                  <span>
                                    Status:{" "}
                                    {responseItem.status ?? "Network Error"}
                                  </span>
                                  <span>
                                    URL:{" "}
                                    {responseItem.requestedUrl || "(not set)"}
                                  </span>
                                </div>

                                {responseItem.error ? (
                                  <pre className="code-block error">
{responseItem.error}
                                  </pre>
                                ) : (
                                  <pre className="code-block">
{prettyJson(responseItem.data)}
                                  </pre>
                                )}
                              </>
                            ) : (
                              <div className="response-status">
                                아직 실행된 응답이 없습니다.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {isAuthorizeOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsAuthorizeOpen(false)}
        >
          <div
            className="authorize-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Creating JWT</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsAuthorizeOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-field upload-field">
                <label>Private Key 업로드</label>
                <input
                  type="file"
                  accept=".pem,.key,.txt"
                  onChange={onChangePrivateKey}
                />
                {privateKeyFileName && (
                  <span className="file-name">{privateKeyFileName}</span>
                )}
              </div>

              <div className="jwt-preview-block">
                <h4>Header</h4>
                <pre className="code-block">
{`{
  "alg": "RS256",
  "typ": "JWT"
}`}
                </pre>
              </div>

              <div className="jwt-form-grid">
                <div className="form-field">
                  <label>userID</label>
                  <input
                    type="text"
                    name="userID"
                    value={authForm.userID}
                    onChange={onChangeAuthForm}
                    placeholder="user@test.com"
                  />
                </div>

                <div className="form-field">
                  <label>role</label>
                  <input
                    type="text"
                    name="role"
                    value={authForm.role}
                    onChange={onChangeAuthForm}
                    placeholder="admin"
                  />
                </div>

                <div className="form-field">
                  <label>tenantID</label>
                  <input
                    type="text"
                    name="tenantID"
                    value={authForm.tenantID}
                    onChange={onChangeAuthForm}
                    placeholder="test-tenant"
                  />
                </div>

                <div className="form-field">
                  <label>scope</label>
                  <input
                    type="text"
                    name="scope"
                    value={authForm.scope}
                    onChange={onChangeAuthForm}
                    placeholder="read write"
                  />
                </div>

                <div className="form-field">
                  <label>expiresIn</label>
                  <input
                    type="text"
                    name="expiresIn"
                    value={authForm.expiresIn}
                    onChange={onChangeAuthForm}
                    placeholder="2h"
                  />
                </div>
              </div>

              <div className="jwt-actions">
                <button
                  type="button"
                  className="create-jwt-btn"
                  onClick={handleGenerateJwt}
                  disabled={jwtLoading}
                >
                  {jwtLoading ? "Creating..." : "Create"}
                </button>
              </div>

              <div className="jwt-preview-block">
                <h4>JWT</h4>
                <textarea
                  className="jwt-result"
                  value={generatedJwt}
                  readOnly
                  placeholder="생성된 JWT가 여기에 표시됩니다."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}