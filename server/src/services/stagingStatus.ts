import { Core } from '@strapi/strapi';
import { PLUGIN_ID } from '../../../admin/src/pluginId';
import StagingStatus from '../../../types/StagingStatus';

const stagingStatusService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async get() {
    try {
      const unstagedUpdates = await strapi
        .documents(`plugin::${PLUGIN_ID}.staging-status`)
        .findMany({
          sort: 'createdAt:desc', // Most recent first
        });

      const currDocument =
        unstagedUpdates.length < 1 // No documents yet, create one
          ? await strapi.documents(`plugin::${PLUGIN_ID}.staging-status`).create({
              data: {
                unstagedUpdates: true,
              },
            })
          : unstagedUpdates[0];

      if (unstagedUpdates.length > 1) {
        // More than one document, delete all but the latest one
        unstagedUpdates.forEach(async (doc, idx) => {
          if (idx !== 0) {
            await strapi
              .documents(`plugin::${PLUGIN_ID}.staging-status`)
              .delete({ documentId: doc.documentId });
          }
        });
      }

      return currDocument;
    } catch (err: any) {
      return err.response;
    }
  },
  async set(newDocumentData: StagingStatus) {
    try {
      const unstagedUpdates = await strapi
        .documents(`plugin::${PLUGIN_ID}.staging-status`)
        .findMany({
          sort: 'updatedAt:desc', // Most recent first
        });

        // Delete all documents before creating a new one (cleaner than updating)
        unstagedUpdates.forEach(async (doc, idx) => {
          if (idx !== 0) {
            await strapi
              .documents(`plugin::${PLUGIN_ID}.staging-status`)
              .delete({ documentId: doc.documentId });
          }
        });

        // Create new document
        await strapi.documents(`plugin::${PLUGIN_ID}.staging-status`).create({ data: newDocumentData });
        return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.response };
    }
  }
});

export default stagingStatusService;
