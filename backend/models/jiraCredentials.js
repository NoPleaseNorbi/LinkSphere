const pool = require("../db");

const JiraCredentials = {
  async get() {
    const result = await pool.query("SELECT email, api_token, domain FROM jira_credentials WHERE id = 1");
    return result.rows[0] || null;
  },

  async save(email, apiToken, domain) {
    const result = await pool.query(
      `INSERT INTO jira_credentials (id, email, api_token, domain)
       VALUES (1, $1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         api_token = EXCLUDED.api_token,
         domain = EXCLUDED.domain,
         updated_at = CURRENT_TIMESTAMP
       RETURNING email, api_token, domain`,
      [email, apiToken, domain]
    );
    return result.rows[0];
  },
};

module.exports = JiraCredentials;