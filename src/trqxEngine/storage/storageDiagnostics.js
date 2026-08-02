import {
  getStorageDiagnostics,
} from "./storageService";

export function runStorageDiagnostics() {
  const report =
    getStorageDiagnostics();

  return {
    ...report,
    passed:
      report.status !== "critical",
    message:
      report.status === "healthy"
        ? "Storage usage is healthy."
        : report.status === "warning"
          ? "Storage usage is elevated."
          : "Storage usage is critical.",
  };
}

export default runStorageDiagnostics;
