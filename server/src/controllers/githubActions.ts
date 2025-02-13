import { PLUGIN_ID } from '../../../admin/src/pluginId';

const githubActionsController = {
  async history(ctx: any) {
    const response = await strapi.plugin(PLUGIN_ID).service('githubActions').history();
    ctx.send(response.data);
  },
  async trigger(ctx: any) {
    const response = await strapi.plugin(PLUGIN_ID).service('githubActions').trigger();
    if (response.status === 422 && response.statusText == 'Unprocessable Entity') {
      return ctx.unprocessableEntity('Unprocessable Entity');
    }
    ctx.send(response.data);
  },
};

export default githubActionsController;
