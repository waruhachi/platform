export const steps = {
  runMode: {
    label: 'Application Type',
    question: 'Select the application type:',
    options: [
      { label: 'Telegram Bot', value: 'telegram' as const },
      { label: 'HTTP Server', value: 'http-server' as const },
    ],
    nextStep: (config: ChatBotConfig) =>
      config.runMode === 'telegram'
        ? ('token' as const)
        : ('environment' as const),
    progress: 0.1,
  },
  token: {
    label: 'Bot Configuration',
    question: 'Enter your Telegram Bot Token:',
    placeholder: 'e.g., 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',
    nextStep: 'environment' as const,
    progress: 0.3,
  },
  environment: {
    label: 'Environment Selection',
    question: 'Choose where your chatbot will run:',
    options: [
      {
        label: '🚀 Production - For live deployment',
        value: 'production' as const,
      },
      { label: '🔧 Staging - For testing', value: 'staging' as const },
    ],
    nextStep: 'generateChatbotSpecs' as const,
    progress: 0.5,
  },
  generateChatbotSpecs: {
    label: "Let's Create Your Chatbot",
    question: 'Generating the specs for your chatbot...',
    nextStep: 'generateChatbot' as const,
    progress: 0.7,
  },
  generateChatbot: {
    label: 'Building Your Chatbot',
    question: 'Generating your chatbot...',
    nextStep: 'successGeneration' as const,
    progress: 0.9,
  },
  successGeneration: {
    label: 'Deployment Complete',
    question: 'Chatbot created successfully!',
    nextStep: 'successGeneration' as const,
    progress: 1,
  },
};

export type ChatBotConfig = {
  telegramBotToken: string;
  useStaging: boolean;
  runMode: 'telegram' | 'http-server';
  prompt: string;
};

export type StepType = keyof typeof steps;
