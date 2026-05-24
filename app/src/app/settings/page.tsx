import { SettingsClient } from "./settings-client";

export default function SettingsPage() {
  const claudeDetected = Boolean(process.env.ANTHROPIC_API_KEY);
  return <SettingsClient claudeDetected={claudeDetected} />;
}
