import { APP_BUILD_HANDLERS } from "./tools.js";
import type { AppBuildToolName } from "./tools.js";

export const isAppBuildToolName = (name: string): name is AppBuildToolName => {
  return name in APP_BUILD_HANDLERS;
};
