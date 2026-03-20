const db = require("../config/db");

const AuthModel = {
  findByEmail: async (email) => {
    const [rows] = await db.query(
      `
      SELECT 
        id,
        email,
        password_hash,
        name,
        role,
        tenant_id,
        status,
        refresh_token,
        created_at,
        updated_at
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );

    return rows[0] || null;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `
      SELECT
        id,
        email,
        name,
        role,
        tenant_id,
        status,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  createUser: async ({ email, passwordHash, name, role, tenantId }) => {
    const [result] = await db.query(
      `
      INSERT INTO users (
        email,
        password_hash,
        name,
        role,
        tenant_id
      ) VALUES (?, ?, ?, ?, ?)
      `,
      [email, passwordHash, name, role || "tester", tenantId || null]
    );

    return result.insertId;
  },

  saveRefreshToken: async (userId, refreshToken) => {
    await db.query(
      `
      UPDATE users
      SET refresh_token = ?
      WHERE id = ?
      `,
      [refreshToken, userId]
    );
  },

  clearRefreshToken: async (userId) => {
    await db.query(
      `
      UPDATE users
      SET refresh_token = NULL
      WHERE id = ?
      `,
      [userId]
    );
  },

  findByRefreshToken: async (refreshToken) => {
    const [rows] = await db.query(
      `
      SELECT 
        id,
        email,
        name,
        role,
        tenant_id,
        status,
        refresh_token
      FROM users
      WHERE refresh_token = ?
      LIMIT 1
      `,
      [refreshToken]
    );

    return rows[0] || null;
  },
};

module.exports = AuthModel;