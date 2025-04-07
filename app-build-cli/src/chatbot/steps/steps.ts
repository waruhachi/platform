export const steps = {
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
  },
  generateChatbotSpecs: {
    label: "Let's Create Your Chatbot",
    question: 'Generating the specs for your chatbot...',
    nextStep: 'generateChatbot' as const,
  },
  generateChatbot: {
    label: 'Building Your Chatbot',
    question: 'Generating your chatbot...',
    nextStep: 'successGeneration' as const,
  },
  successGeneration: {
    label: 'Deployment Complete',
    question: 'Chatbot created successfully!',
    nextStep: 'successGeneration' as const,
  },
};

export type ChatBotConfig = {
  useStaging: boolean;
  prompt: string;
};

export type StepType = keyof typeof steps;
