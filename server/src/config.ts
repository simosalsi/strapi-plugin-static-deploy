type Validator = Partial<{
  owner: string;
  repo: string;
  branch: string;
  workflowID: string;
  githubToken: string;
  environment: string;
}>;

export default {
  default: {},
  validator({ owner, repo, branch, workflowID, githubToken, environment }: Validator) {
    if (!(owner && repo && branch && workflowID && githubToken)) {
      return;
    }

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
  },
};
