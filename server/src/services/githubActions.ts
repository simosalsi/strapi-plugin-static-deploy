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
    },
    async history() {
      try {
        const owner = strapi.plugin(PLUGIN_ID).config('owner');
        const repo = strapi.plugin(PLUGIN_ID).config('repo');
        const workflowID = strapi.plugin(PLUGIN_ID).config('workflowID');
        const branch = strapi.plugin(PLUGIN_ID).config('branch');
        const githubToken = strapi.plugin(PLUGIN_ID).config('githubToken');
        const environment = strapi.plugin(PLUGIN_ID).config('environment'); // TODO: Generalize this to inputs to be able to add any input

        const history = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowID}/runs?branch=${branch}&per_page=100&page=1`,
          {
            headers: {
              Accept: 'application/vnd.github+json',
              Authorization: `token ${githubToken}`,
            },
          }
        );

        // The following is an array of bools that maps whether or not each workflow belongs to the current environment
        const environmentHistory: ReadonlyArray<boolean> = await Promise.all(
          history.data.workflow_runs.map(
            async (workflow: { readonly jobs_url: string }) => {
              const jobs = await axios.get(workflow.jobs_url, {
                headers: {
                  Accept: 'application/vnd.github+json',
                  Authorization: `token ${githubToken}`,
                },
              });

              return (
                jobs.data.jobs.find((job: { readonly name: string }) =>
                  job.name.includes(environment as string)
                ) !== undefined
              );
            }
          )
        );

        return {
          data: {
            workflow_runs: history.data.workflow_runs.filter(
              (_: object, index: number) => environmentHistory[index]
            ),
          },
        };
      } catch (err: any) {
        return err.response;
      }
    }
})

export default githubActionsService;
