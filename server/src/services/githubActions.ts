import { type Core } from '@strapi/strapi';
import { PLUGIN_ID } from '../../../admin/src/pluginId';
import axios from 'axios';
import Config from '../../../types/Config';
import Workflow from '../../../types/Workflow';

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
  async triggerStaging() {
    try {
      const owner = strapi.plugin(PLUGIN_ID).config('owner');
      const repo = strapi.plugin(PLUGIN_ID).config('repo');
      const branch = strapi.plugin(PLUGIN_ID).config('branch');
      const githubToken = strapi.plugin(PLUGIN_ID).config('githubToken');
      const environment = strapi.plugin(PLUGIN_ID).config('environment'); // TODO: Generalize this to inputs to be able to add any input
      const staging: Config['staging'] | undefined = strapi.plugin(PLUGIN_ID).config('staging');

      if (!staging) {
        return {
          data: {
            error: 'No staging configuration!',
          },
        };
      }

      return await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${staging.workflowID}/dispatches`,
        {
          inputs: { environment }, // TODO: Handle case in which "environment" isn't inserted --> Add inputs conditionally
          ref: staging.branch ?? branch,
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
      const staging: Config['staging'] = strapi.plugin(PLUGIN_ID).config('staging');

      const prodHistory = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowID}/runs?branch=${branch}&per_page=100&page=1`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `token ${githubToken}`,
          },
        }
      );

      const stagingHistory = staging
        ? await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${staging.workflowID}/runs?branch=${staging.branch ?? branch}&per_page=100&page=1`,
            {
              headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `token ${githubToken}`,
              },
            }
          )
        : {
            data: {
              workflow_runs: [],
            },
          };

      const history = [
        ...prodHistory.data.workflow_runs,
        ...stagingHistory.data.workflow_runs,
      ].sort((a: Workflow, b: Workflow) => {
        const a_creationDate = new Date(a.created_at);
        const b_creationDate = new Date(b.created_at);

        return b_creationDate.getTime() - a_creationDate.getTime();
      });

      // The following is an array of bools that maps whether or not each workflow belongs to the current environment
      const environmentHistory: ReadonlyArray<boolean> = await Promise.all(
        history.map(async (workflow: { readonly jobs_url: string }) => {
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
        })
      );

      return {
        data: {
          workflow_runs: history.filter((_: object, index: number) => environmentHistory[index]),
        },
      };
    } catch (err: any) {
      return err.response;
    }
  },
});

export default githubActionsService;
