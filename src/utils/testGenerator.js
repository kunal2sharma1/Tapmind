import { generateAssessment } from "./learningEngine";

export default function generateTestQuestions(levels, currentLevel) {
  return generateAssessment(levels, currentLevel);
}
