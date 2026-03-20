module.exports = `
  MERGE (i:Issue {key: $key})
  SET i.issueId = $issueId,
      i.summary = $summary,
      i.description = $description,
      i.status = $status,
      i.priority = $priority,
      i.issueType = $issueType,
      i.created = $created,
      i.updated = $updated,
      i.projectKey = $projectKey,
      i.assignee = $assignee,
      i.assigneeAvatar = $assigneeAvatar,
      i.assigneeEmail = $assigneeEmail,
      i.reporter = $reporter,
      i.reporterAvatar = $reporterAvatar,
      i.reporterEmail = $reporterEmail,
      i.updatedAt = datetime()
  RETURN i
`;