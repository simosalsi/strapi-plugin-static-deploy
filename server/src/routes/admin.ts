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
    {
      method: 'GET',
      path: '/emails-for-notifications',
      handler: 'notifications.getEmails',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/emails-for-notifications',
      handler: 'notifications.addEmail',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'DELETE',
      path: '/emails-for-notifications',
      handler: 'notifications.deleteEmail',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/notify',
      handler: 'notifications.send',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
  ],
};
