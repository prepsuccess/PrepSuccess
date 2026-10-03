// Imported first by server.ts so Sentry is set up before anything else loads.
import { initMonitoring } from "./lib/monitoring.js";

initMonitoring();
