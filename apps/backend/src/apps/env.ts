import { PROD_AGENT_API_URL, STAGING_AGENT_API_URL } from './constants';
import { isDev } from '../env';
export function getAgentHost(overrideEnvironment?: 'staging' | 'production') {
  if (overrideEnvironment) {
    return overrideEnvironment === 'staging'
      ? STAGING_AGENT_API_URL
      : PROD_AGENT_API_URL;
  }

  if (isDev) {
    return STAGING_AGENT_API_URL;
  }
  return PROD_AGENT_API_URL;
}
