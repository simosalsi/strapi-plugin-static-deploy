import { PLUGIN_ID } from '../../../admin/src/pluginId';

const stagingStatusController = {
  async get(ctx: any) {
    const serviceResult = await strapi.plugin(PLUGIN_ID).service('stagingStatus').get();
    ctx.send(serviceResult);
  },
  async set(ctx: any) {
    const newDocumentData = ctx.request.body;

    if (typeof newDocumentData === 'object' && typeof newDocumentData.unstagedUpdates === 'boolean') {
      const serviceResult = await strapi.plugin(PLUGIN_ID).service('stagingStatus').set(newDocumentData);
      ctx.send(serviceResult);
      return;
    }

    ctx.send({ success: false, error: 'Invalid data' });                               
  }
};

export default stagingStatusController;
