export const steps = {
    runMode: {
        label: 'Application Type',
        question: 'Select the application type:',
        options: [
            { label: 'Telegram Bot', value: 'telegram' },
            { label: 'HTTP Server', value: 'http-server' },
        ],
        nextStep: (config) => config.runMode === 'telegram'
            ? 'token'
            : 'environment',
        progress: 0.1,
    },
    token: {
        label: 'Bot Configuration',
        question: 'Enter your Telegram Bot Token:',
        placeholder: 'e.g., 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',
        nextStep: 'environment',
        progress: 0.3,
    },
    environment: {
        label: 'Environment Selection',
        question: 'Choose where your chatbot will run:',
        options: [
            {
                label: '🚀 Production - For live deployment',
                value: 'production',
            },
            { label: '🔧 Staging - For testing', value: 'staging' },
        ],
        nextStep: 'generateChatbotSpecs',
        progress: 0.5,
    },
    generateChatbotSpecs: {
        label: "Let's Create Your Chatbot",
        question: 'Generating the specs for your chatbot...',
        nextStep: 'generateChatbot',
        progress: 0.7,
    },
    generateChatbot: {
        label: 'Building Your Chatbot',
        question: 'Generating your chatbot...',
        nextStep: 'successGeneration',
        progress: 0.9,
    },
    successGeneration: {
        label: 'Deployment Complete',
        question: 'Chatbot created successfully!',
        nextStep: 'successGeneration',
        progress: 1,
    },
};
//# sourceMappingURL=steps.js.map