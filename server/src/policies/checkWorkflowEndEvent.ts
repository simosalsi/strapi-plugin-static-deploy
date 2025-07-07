export default (policyContext, config, { strapi }) => {
  const { event } = policyContext.request.body;
  if (!event || !['staging-end', 'prod-end', 'end'].includes(event)) {
    return false;
  }

  return true;
};