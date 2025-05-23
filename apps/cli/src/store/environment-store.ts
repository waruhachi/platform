import { create } from 'zustand';

type Environment = 'staging' | 'production';

interface EnvironmentStore {
  environment: Environment;
  setEnvironment: (env: Environment) => void;
}

export const useEnvironmentStore = create<EnvironmentStore>((set) => ({
  environment: 'production',
  setEnvironment: (environment) => set({ environment }),
}));
