import { type Core } from '@strapi/strapi';
import { PLUGIN_ID } from '../../../admin/src/pluginId';

const configService = ({ strapi }: { strapi: Core.Strapi }) => ({
  get() {
    try {
      const owner = strapi.plugin(PLUGIN_ID).config('owner');
      const repo = strapi.plugin(PLUGIN_ID).config('repo');
      const workflowID = strapi.plugin(PLUGIN_ID).config('workflowID');
      const branch = strapi.plugin(PLUGIN_ID).config('branch');
      const githubToken = strapi.plugin(PLUGIN_ID).config('githubToken');
      const environment = strapi.plugin(PLUGIN_ID).config('environment'); // TODO: Generalize this to inputs to be able to add any input
      const hideGithubLink = strapi.plugin(PLUGIN_ID).config('hideGithubLink');

      return {
        owner,
        repo,
        workflowID,
        branch,
        githubToken,
        environment,
        hideGithubLink,
      };
    } catch (err: any) {
      return err.response;
    }
  },
});

export default configService;
