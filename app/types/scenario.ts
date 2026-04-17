export type Branch = {
  id: string;
  text: string;
  consequence: string;
  nextStepId: string | null;
};

export type Step = {
  id: string;
  stepNumber: number;
  situation: string;
  clues: string[];
  hingeClue: string;
  distractor: string;
  branches: Branch[];
};

export type Scenario = {
  id: string;
  profession: string;
  title: string;
  steps: Step[];
};

export type UserChoice = {
  stepId: string;
  stepNumber: number;
  situation: string;
  chosenBranch: Branch;
};

export type EvaluationRequest = {
  scenario: Scenario;
  choices: UserChoice[];
  profession: string;
};
