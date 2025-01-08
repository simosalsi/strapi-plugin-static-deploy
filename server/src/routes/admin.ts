export default {
  type: 'admin',
  routes: [
    {
      method: 'POST',
      path: '/trigger',
      handler: 'githubActions.trigger',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          // TODO: Add policy to make sure admin user has permissions
        ],
      },
    },
  ],
};

