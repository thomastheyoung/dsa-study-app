export interface UseCase {
  title: string;
  description: string;
  code: string;
  complexity: string;
}

export interface Topic {
  id: string;
  title: string;
  category: 'data-structures' | 'algorithms' | 'techniques';
  description: string;
  complexity?: {
    access?: string;
    search?: string;
    insert?: string;
    delete?: string;
    average?: string;
    worst?: string;
  };
  invariant?: string;
  theory: string;
  keyPoints: string[];
  visualization?: string;
  useCases: UseCase[];
}

export interface CategoryGroup {
  label: string;
  category: Topic['category'];
  topics: Topic[];
}

export interface FlashCard {
  id: number;
  category: 'big-o' | 'data-structures' | 'algorithms' | 'techniques';
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
}
