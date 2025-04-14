import { PLUGIN_ID } from '../../../admin/src/pluginId';

const configController = {
  get(ctx: any) {
    ctx.send(strapi.plugin(PLUGIN_ID).service('config').get());
  },
};

export default configController;
