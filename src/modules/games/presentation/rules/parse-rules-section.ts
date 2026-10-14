export type RulesSectionId = "basis" | "classic" | "time_attack" | "multiplayer";

export function parseRulesSection(value: string | undefined): RulesSectionId {
  if (
    value === "basis" ||
    value === "classic" ||
    value === "time_attack" ||
    value === "multiplayer"
  ) {
    return value;
  }
  return "basis";
}
