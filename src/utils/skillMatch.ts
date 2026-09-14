const normalize = (skill: string) => skill.trim().toLowerCase();

/** Which of a job's skills the candidate lists on their profile (case-insensitive). */
export function getSkillMatch(jobSkills: string[], profileSkills: string[]) {
  const owned = new Set(profileSkills.map(normalize));
  const matched = jobSkills.filter((skill) => owned.has(normalize(skill)));
  const percent = jobSkills.length ? Math.round((matched.length / jobSkills.length) * 100) : 0;

  return { matched: new Set(matched), matchedCount: matched.length, total: jobSkills.length, percent };
}
