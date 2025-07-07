import { PLUGIN_ID } from '../../../admin/src/pluginId';

const notificationsController = {
  async send(ctx: any) {
    const { event } = ctx.request.body;
    const serviceResult = await strapi.plugin(PLUGIN_ID).service('notifications').send(event);
    ctx.send(serviceResult);
  },
  async getEmails(ctx: any) {
    const serviceResult = await strapi.plugin(PLUGIN_ID).service('notifications').getEmails();
    ctx.send(serviceResult);
  },
  async addEmail(ctx: any) {
    const { newEmail } = ctx.request.body;
    const serviceResult = await strapi.plugin(PLUGIN_ID).service('notifications').addEmail(newEmail);
    ctx.send(serviceResult);
  },
  async deleteEmail(ctx: any) {
    const reqURL = new URL(ctx.request.url, 'http://localhost:1337');
    if (reqURL.searchParams.has('email')) {
      const serviceResult = await strapi.plugin(PLUGIN_ID).service('notifications').deleteEmail(reqURL.searchParams.get('email'));
      ctx.send(serviceResult);
    } else {
      ctx.send({ success: false, err: 'Missing email parameter' });
    }
  },
};

export default notificationsController;