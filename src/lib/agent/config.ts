import "server-only";

export type AgentMode = "live" | "mock";

export type AgentConfig = {
  mode: AgentMode;
  /** Model id in live mode, or a label in mock mode. Safe to show publicly. */
  model: string;
};

const DEFAULT_MODEL = "gemini-2.5-flash";

/**
 * Live mode needs a Gemini key in the server environment. Without one the
 * app runs in a clearly labelled mock mode instead of failing, so reviewers
 * can still exercise every flow. The key itself never leaves this module.
 */
export function getAgentConfig(): AgentConfig {
  const forceMock = process.env.AGENT_MODE === "mock";
  const hasKey = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim());
  if (forceMock || !hasKey) return { mode: "mock", model: "deterministic intent router" };
  return { mode: "live", model: process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL };
}
