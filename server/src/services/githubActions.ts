import { type Core } from '@strapi/strapi';
import { PLUGIN_ID } from '../../../admin/src/pluginId';
import axios from 'axios';

const githubActionsService = ({ strapi }: { strapi: Core.Strapi }) => ({
    async trigger() {
      try {
        const owner = strapi.plugin(PLUGIN_ID).config('owner');
        const repo = strapi.plugin(PLUGIN_ID).config('repo');
        const workflowID = strapi.plugin(PLUGIN_ID).config('workflowID');
        const branch = strapi.plugin(PLUGIN_ID).config('branch');
        const githubToken = strapi.plugin(PLUGIN_ID).config('githubToken');
        const environment = strapi.plugin(PLUGIN_ID).config('environment'); // TODO: Generalize this to inputs to be able to add any input

        return await axios.post(
          `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowID}/dispatches`,
          {
            inputs: { environment }, // TODO: Handle case in which "environment" isn't inserted --> Add inputs conditionally
            ref: branch,
          },
          {
            headers: {
              Accept: 'application/vnd.github+json',
              Authorization: `token ${githubToken}`,
            },
          }
        );
      } catch (err: any) {
        return err.response;
      }
    }
})

export default githubActionsService;
