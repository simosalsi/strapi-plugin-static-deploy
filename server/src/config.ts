import Config from '../../types/Config';

type Validator = Partial<Config>;

export default {
  default: {},
  validator({ owner, repo, branch, workflowID, githubToken, environment, staging, notifications }: Validator) {
    // Check if required keys are present
    if (!(owner && repo && branch && workflowID && githubToken)) {
      throw new Error('`owner`, `repo`, `branch`, `workflowID` and `githubToken` keys in your plugin config are required');
    }
    if (staging && !staging.workflowID) {
      throw new Error('`staging.workflowID` key in your plugin config is missing, either set it to a string or remove the whole staging object');
    }
    if (notifications && notifications.enabled === undefined) {
      throw new Error('`notifications.enabled` key in your plugin config is missing, either set it to a string or remove the whole notifications object');
    }
    if (notifications && !notifications.bearerToken) {
      throw new Error('`notifications.bearerToken` key in your plugin config is missing, either set it to a string or remove the whole notifications object');
    }

    // Check if base config is valid
    if (owner && typeof owner !== 'string') {
      throw new Error('`owner` key in your plugin config has to be a string');
    }
    if (repo && typeof repo !== 'string') {
      throw new Error('`repo` key in your plugin config has to be a string');
    }
    if (branch && typeof branch !== 'string') {
      throw new Error('`branch` key in your plugin config has to be a string');
    }
    if (workflowID && typeof workflowID !== 'string') {
      throw new Error('`workflowID` key in your plugin workflowID has to be an string');
    }
    if (githubToken && typeof githubToken !== 'string') {
      throw new Error('`githubToken` key in your plugin config has to be a string');
    }
    if (environment && typeof environment !== 'string') {
      throw new Error('`environment` key in your plugin config has to be a string');
    }

    // Check if staging config is valid
    if (staging && typeof staging.workflowID !== 'string') {
      throw new Error('`staging.workflowID` key in your plugin config has to be a string');
    }
    if (staging && staging.branch && typeof staging.branch !== 'string') {
      throw new Error('`staging.githubToken` key in your plugin config has to be a string');
    }

    // Check if notifications config is valid
    if (notifications && typeof notifications.enabled !== 'boolean') {
      throw new Error('`notifications.enabled` key in your plugin config has to be a boolean');
    }
    if (notifications && typeof notifications.bearerToken !== 'string') {
      throw new Error('`notifications.bearerToken` key in your plugin config has to be a string');
    }
  },
};
