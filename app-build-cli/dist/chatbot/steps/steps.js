export const steps = {
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
    },
    generateChatbotSpecs: {
        label: "Let's Create Your Chatbot",
        question: 'Generating the specs for your chatbot...',
        nextStep: 'generateChatbot',
    },
    generateChatbot: {
        label: 'Building Your Chatbot',
        question: 'Generating your chatbot...',
        nextStep: 'successGeneration',
    },
    successGeneration: {
        label: 'Deployment Complete',
        question: 'Chatbot created successfully!',
        nextStep: 'successGeneration',
    },
};
//# sourceMappingURL=steps.js.map