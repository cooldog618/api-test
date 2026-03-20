export const API_SERVERS = [
  {
    label: "Local Test Server",
    value: "http://localhost:3001",
  },
];

export const API_GROUPS = [
  {
    key: "system",
    title: "System",
    description: "기본 상태 확인 API",
    operations: [
      {
        id: "getHealth",
        method: "GET",
        path: "/api/test/health",
        summary: "서버 상태 확인",
        requiresAuth: true,
        pathParams: [],
        requestFields: [],
      },
    ],
  },
  {
    key: "users",
    title: "Users",
    description: "샘플 사용자 조회 API",
    operations: [
      {
        id: "getUsers",
        method: "GET",
        path: "/api/test/users",
        summary: "사용자 목록 조회",
        requiresAuth: true,
        pathParams: [],
        requestFields: [],
      },
      {
        id: "getUserDetail",
        method: "GET",
        path: "/api/test/users/{userId}",
        summary: "사용자 상세 조회",
        requiresAuth: true,
        pathParams: [
          {
            name: "userId",
            defaultValue: "1",
          },
        ],
        requestFields: [],
      },
    ],
  },
  {
    key: "tools",
    title: "Tools",
    description: "POST body 테스트 API",
    operations: [
      {
        id: "postEcho",
        method: "POST",
        path: "/api/test/echo",
        summary: "요청 body 그대로 반환",
        requiresAuth: true,
        pathParams: [],
        requestFields: [
          {
            name: "title",
            label: "title",
            type: "text",
            defaultValue: "hello",
          },
          {
            name: "message",
            label: "message",
            type: "text",
            defaultValue: "테스트 메시지",
          },
          {
            name: "tags",
            label: "tags (comma separated)",
            type: "text",
            defaultValue: "jwt,api,echo",
            transform: "commaArray",
          },
        ],
      },
      {
        id: "postCalculate",
        method: "POST",
        path: "/api/test/calculate",
        summary: "숫자 계산 API",
        requiresAuth: true,
        pathParams: [],
        requestFields: [
          {
            name: "a",
            label: "a",
            type: "number",
            defaultValue: 10,
          },
          {
            name: "b",
            label: "b",
            type: "number",
            defaultValue: 5,
          },
          {
            name: "operator",
            label: "operator",
            type: "select",
            defaultValue: "multiply",
            options: [
              { label: "add", value: "add" },
              { label: "subtract", value: "subtract" },
              { label: "multiply", value: "multiply" },
              { label: "divide", value: "divide" },
            ],
          },
        ],
      },
      {
        id: "postProfileAnalyze",
        method: "POST",
        path: "/api/test/profile/analyze",
        summary: "프로필 분석 API",
        requiresAuth: true,
        pathParams: [],
        requestFields: [
          {
            name: "name",
            label: "name",
            type: "text",
            defaultValue: "Jason",
          },
          {
            name: "age",
            label: "age",
            type: "number",
            defaultValue: 33,
          },
          {
            name: "score",
            label: "score",
            type: "number",
            defaultValue: 88,
          },
          {
            name: "interests",
            label: "interests (comma separated)",
            type: "text",
            defaultValue: "React,Node.js,MySQL",
            transform: "commaArray",
          },
        ],
      },
    ],
  },
];