export default {
    'staging-status': {
        schema: {
            kind: 'singleType',
            collectionName: 'staging_status',
            info: {
                name: 'StagingStatus',
                singularName: 'staging-status',
                pluralName: 'staging-statuses',
                displayName: 'Staging Status',
                tableName: 'staging_status',
                description: 'Shows if user is allowed to deploy to production, that is, if no updates have been published since last deploy to staging',
            },
            options: {
                draftAndPublish: false,
            },
            pluginOptions: {
              'content-manager': {
                visible: false,
              },
              'content-type-builder': {
                visible: false,
              },
            },
            attributes: {
              unstagedUpdates: {
                type: 'boolean',
                required: true,
                default: true,
              },
            },
        }
    }
};
