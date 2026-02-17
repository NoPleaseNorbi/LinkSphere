module.exports = `
  MERGE (u:User {accountId: $accountId})
  SET u.displayName = $displayName,
      u.emailAddress = $emailAddress,
      u.avatarUrl = $avatarUrl,
      u.updatedAt = datetime()
  RETURN u
`;