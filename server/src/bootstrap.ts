import type { Core } from '@strapi/strapi';
import { PLUGIN_ID } from '../../admin/src/pluginId';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  // Register permission actions
  const actions = [
    {
      section: 'plugins',
      subCategory: 'general',
      displayName: 'Access plugin page',
      uid: 'access',
      pluginName: PLUGIN_ID,
    },
    {
      section: 'plugins',
      subCategory: 'general',
      displayName: 'Manage Email Notifications',
      uid: 'notifications',
      pluginName: PLUGIN_ID,
    },
    {
      section: 'plugins',
      subCategory: 'actions',
      displayName: 'Trigger builds',
      uid: 'trigger',
      pluginName: PLUGIN_ID,
    },
  ];
  await strapi.admin.services.permission.actionProvider.registerMany(actions);
};

export default bootstrap;
