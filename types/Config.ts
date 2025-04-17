export default interface Config {
  owner: string;
  repo: string;
  workflowID: string;
  branch: string;
  githubToken: string;
  environment: string;
  hideGithubLink?: boolean;
}
