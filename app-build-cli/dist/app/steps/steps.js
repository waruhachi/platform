export const steps = {
    environment: {
        label: 'Environment Selection',
        question: 'Choose where your app will run:',
        options: [
            {
                label: '🚀 Production - For live deployment',
                value: 'production',
            },
            { label: '🔧 Staging - For testing', value: 'staging' },
        ],
        nextStep: 'generateAppSpecs',
    },
    generateAppSpecs: {
        label: "Let's Create Your App",
        question: 'Generating the specs for your app...',
        nextStep: 'generateApp',
    },
    generateApp: {
        label: 'Building Your App',
        question: 'Generating your application...',
        nextStep: 'successGeneration',
    },
    successGeneration: {
        label: 'Deployment Complete',
        question: 'App created successfully!',
        nextStep: 'successGeneration',
    },
};
//# sourceMappingURL=steps.js.map