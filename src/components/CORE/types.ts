export interface Stage {
  id: number;
  label: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

export interface NavigationState {
  currentStage: number;
  completedStages: number[];
}

export interface CosmosConfig {
  particleCount: number;
  nodeCount: number;
  connectionDistance: number;
}
