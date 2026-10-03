/* eslint-disable no-console -- CLI output */
import {
  captureError,
  flushMonitoring,
  initMonitoring,
  monitoringEnabled,
} from "../src/lib/monitoring.js";

/**
 * Sends one deliberate test error to Sentry: `npm run sentry:test`. Use it
 * after setting SENTRY_DSN on a new environment, then check that the error
 * shows up in Sentry and that the alert reaches its channel (PRD-04 §3.3).
 */
if (!monitoringEnabled) {
  console.error("SENTRY_DSN isn't set — nothing to test.");
  process.exit(1);
}

initMonitoring();
captureError(new Error(`PrepSuccess Sentry test error (${new Date().toISOString()})`));
await flushMonitoring(5000);
console.log("Test error sent. It should appear in Sentry within a minute.");
