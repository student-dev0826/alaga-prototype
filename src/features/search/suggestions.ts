// Labels preserved from the Figma prototype; these are examples, not service records.
export const suggestions = ['Dialysis', 'Vaccination', 'General Consultation', 'Dental Checkup', 'Blood Pressure Check', 'Maternal Care', 'Child Health', 'Blood Sugar Check', 'Health Counseling'];
export const suggestionQueries: Record<string, string> = {
  'Dialysis': 'I want to get dialysis', 'Vaccination': 'I need vaccination',
  'General Consultation': 'I need a general checkup', 'Dental Checkup': 'I need a dental checkup',
  'Blood Pressure Check': 'I want to check my blood pressure', 'Maternal Care': 'I need maternal care',
  'Child Health': 'I need a child checkup', 'Blood Sugar Check': 'I need a blood sugar check',
  'Health Counseling': 'I need health counseling',
};
export function getSuggestions(query: string) {
  const normalized = query.trim().toLocaleLowerCase('en');
  if (!normalized) return [];
  return suggestions.filter(s => s.toLocaleLowerCase('en').includes(normalized)).slice(0, 4);
}
