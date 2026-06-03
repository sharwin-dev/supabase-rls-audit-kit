export function formatFindings(findings, format = "text") {
  if (format === "json") {
    return JSON.stringify({ findings }, null, 2);
  }

  if (findings.length === 0) {
    return "No findings.";
  }

  return findings
    .map((finding) => [
      `${finding.severity}: ${finding.object}`,
      `  ${finding.message}`,
      `  Fix: ${finding.remediation}`
    ].join("\n"))
    .join("\n\n");
}
