import { PLUGIN_ID } from './pluginId';

const pluginPermissions = {
  access: [
    {
      action: `plugin::${PLUGIN_ID}.access`,
      subject: null,
    },
  ],
  trigger: [
    {
      action: `plugin::${PLUGIN_ID}.trigger`,
      subject: null,
    },
  ],
  notifications: [
    {
      action: `plugin::${PLUGIN_ID}.notifications`,
      subject: null,
    },
  ],
};

export default pluginPermissions;
