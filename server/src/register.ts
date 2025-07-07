import type { Core } from '@strapi/strapi';
import { PLUGIN_ID } from '../../admin/src/pluginId';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  // Track any changes to published content
  strapi.documents.use(async (context, next) => {
    const isDraftAndPublish = context.contentType.options.draftAndPublish;
    const triggerActions = isDraftAndPublish
      ? ['delete', 'publish', 'unpublish']
      : ['delete', 'update', 'create'];

    // Deleting a draft-only document should not update the staging status
    // Check if document to delete was published (only if isDraftAndPublish)
    const publishedDocumentToDelete =
      context.action === 'delete' && isDraftAndPublish
        ? await strapi
            .documents(context.contentType.uid)
            .findOne({ documentId: context.params.documentId, status: 'published' })
        : null;

    const deletingDraftOnlyDocument =
      context.action === 'delete' && isDraftAndPublish && publishedDocumentToDelete === null;

    const result = await next();

    if (
      context.contentType.uid !== `plugin::${PLUGIN_ID}.staging-status` && // Prevent infinite loop
      context.contentType.uid !== `plugin::${PLUGIN_ID}.email-for-notifications` && // Managing this plugin's notifications should not affect the staging status
      triggerActions.includes(context.action) &&
      !deletingDraftOnlyDocument
    ) {
      await strapi.plugin(PLUGIN_ID).service('stagingStatus').set({ unstagedUpdates: true });
    }

    return result;
  });
};

export default register;
