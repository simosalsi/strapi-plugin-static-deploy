import { PLUGIN_ID } from "../../../admin/src/pluginId";
import Config from "../../../types/Config";

export default (policyContext, config, { strapi }) => {
  const notifications: Config['notifications'] = strapi.plugin(PLUGIN_ID).config('notifications');
  if (!notifications || !notifications.enabled) {
    return false;
  }

  const authHeader = policyContext.request.header.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '');
  if (token !== notifications.bearerToken) {
    return false;
  }

  return true;
};