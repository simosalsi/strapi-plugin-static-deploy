export default {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/history',
      handler: 'githubActions.history',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
        ],
      },
    },
    {
      method: 'POST',
      path: '/trigger',
      handler: 'githubActions.trigger',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
        ],
      },
    },
  ],
};

