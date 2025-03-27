import { useState, useEffect } from 'react';
import { checkBotDeploymentStatus } from './chatbot.js';
const POLL_INTERVAL = 5_000;
export function useCheckChatbotStatus(chatbotId) {
    const [status, setStatus] = useState({ isDeployed: false });
    useEffect(() => {
        let isActive = true;
        const checkDeployment = async () => {
            if (!isActive || !chatbotId)
                return;
            try {
                const status = await checkBotDeploymentStatus(chatbotId);
                console.log('Deployment status:', status);
                setStatus(status);
            }
            catch (error) {
                console.error('Failed to check deployment status:', error);
            }
        };
        // Initial check
        checkDeployment();
        // Set up polling interval
        const interval = setInterval(checkDeployment, POLL_INTERVAL);
        // Cleanup
        return () => {
            isActive = false;
            clearInterval(interval);
        };
    }, [chatbotId]);
    return status;
}
//# sourceMappingURL=useChatbot.js.map