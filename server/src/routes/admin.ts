export default {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/history',
      handler: 'githubActions.history',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/trigger',
      handler: 'githubActions.trigger',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/trigger-staging',
      handler: 'githubActions.triggerStaging',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'GET',
      path: '/config',
      handler: 'config.get',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'GET',
      path: '/staging-status',
      handler: 'stagingStatus.get',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/staging-status',
      handler: 'stagingStatus.set',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
  ],
};
