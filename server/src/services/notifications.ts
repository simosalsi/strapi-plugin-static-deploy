import { type Core,  } from '@strapi/strapi';
import { PLUGIN_ID } from '../../../admin/src/pluginId';
import Config from '../../../types/Config';

const notificationTitle: Record<'staging-trigger' | 'prod-trigger' | 'trigger' | 'staging-end' | 'prod-end' | 'end', string> = {
  'staging-trigger': 'Staging Workflow Triggered',
  'prod-trigger': 'Production Workflow Triggered',
  'trigger': 'Workflow Triggered',
  'staging-end': 'Staging Workflow Ended',
  'prod-end': 'Production Workflow Ended',
  'end': 'Workflow Ended'
}

const notificationBody = (workflowID: string, url: string): Record<'staging-trigger' | 'prod-trigger' | 'trigger' | 'staging-end' | 'prod-end' | 'end', string> => ({
  'staging-trigger': `A run of the staging workflow (ID: ${workflowID}) has been triggered!<br/>You can access the ${url === '' ? 'admin panel' : `<a href='${url}'>admin panel</a>`} to check and manage workflows.<br/><br/><small>This email was generated automatically</small>`,
  'prod-trigger': `A run of the production workflow (ID: ${workflowID}) has been triggered!<br/>You can access the ${url === '' ? 'admin panel' : `<a href='${url}'>admin panel</a>`} to check and manage workflows.<br/><br/><small>This email was generated automatically</small>`,
  'trigger': `A workflow run (ID: ${workflowID}) has been triggered!<br/>You can access the ${url === '' ? 'admin panel' : `<a href='${url}'>admin panel</a>`} to check and manage workflows.<br/><br/><small>This email was generated automatically</small>`,
  'staging-end': `A run of the staging workflow (ID: ${workflowID}) has completed!<br/>You can access the ${url === '' ? 'admin panel' : `<a href='${url}'>admin panel</a>`} to check its result.<br/><br/><small>This email was generated automatically</small>`,
  'prod-end': `A run of the production workflow (ID: ${workflowID}) has completed!<br/>You can access the ${url === '' ? 'admin panel' : `<a href='${url}'>admin panel</a>`} to check its result.<br/><br/><small>This email was generated automatically</small>`,
  'end': `A workflow run (ID: ${workflowID}) has completed!<br/>You can access the ${url === '' ? 'admin panel' : `<a href='${url}'>admin panel</a>`} to check its result.<br/><br/><small>This email was generated automatically</small>`
})

const notificationsService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async send(event: 'staging-trigger' | 'prod-trigger' | 'trigger' | 'staging-end' | 'prod-end' | 'end') {
    try {
      if (!['staging-trigger', 'prod-trigger', 'trigger', 'staging-end', 'prod-end', 'end'].includes(event)) {
        return { success: false, err: 'Invalid Event' };
      }

      const workflowID: Config['workflowID'] = strapi.plugin(PLUGIN_ID).config('workflowID');
      const staging: Config['staging'] = strapi.plugin(PLUGIN_ID).config('staging');
      const notifications: Config['notifications'] = strapi.plugin(PLUGIN_ID).config('notifications');
      const url: string = strapi.config.get('server.url');

      if (!notifications || !notifications.enabled) {
        return { enabled: false, success: true };
      }

      const emails = (await strapi.documents(`plugin::${PLUGIN_ID}.email-for-notifications`).findMany({ sort: 'email:asc' })).map(doc => doc.email);

      if (emails.length > 0) {
        await strapi.plugin('email').services.email.send({
            to: emails.join(','),
            subject: notificationTitle[event],
            html: notificationBody((event === 'staging-trigger' || event === 'staging-end') ? (staging?.workflowID ?? '') : workflowID, url)[event],
        });
      }
      
      return { enabled: true, success: true };
    } catch (err: any) {
      return { success: false, err };
    }
  },
  async getEmails() {
    try {
      const emails = (await strapi.documents(`plugin::${PLUGIN_ID}.email-for-notifications`).findMany({ sort: 'email:asc' })).map(doc => doc.email);
      return { success: true, emails };
    } catch (err: any) {
      return { success: false, err };
    }
  },
  async addEmail(newEmail: string) {
    try {
      await strapi.documents(`plugin::${PLUGIN_ID}.email-for-notifications`).create({ data: { email: newEmail.toLowerCase() } })
      return { success: true };
    } catch (err: any) {
      return { success: false, err };
    }
  },
  async deleteEmail(emailToDelete: string) {
    try {
      const docToDelete = await strapi.documents(`plugin::${PLUGIN_ID}.email-for-notifications`).findFirst({ filters: {
        email: {
          $eqi: emailToDelete
        }
      }});

      if (docToDelete) {
        await strapi.documents(`plugin::${PLUGIN_ID}.email-for-notifications`).delete({ documentId: docToDelete.documentId });
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, err };
    }
  }
});

export default notificationsService;