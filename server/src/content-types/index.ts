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
    },
    'email-for-notifications': {
        schema: {
            kind: 'collectionType',
            collectionName: 'email_for_notifications',
            info: {
              name: 'EmailForNotifications',
              singularName: 'email-for-notifications',
              pluralName: 'emails-for-notifications',
              displayName: 'Email For Notifications',
              tableName: 'email_for_notifications',
              description: 'Stores a list of email addresses that should receive notifications upon predetermined events such as workflow launch or workflow completion',
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
              email: {
                type: 'email',
                required: true,
                unique: true,
              },
            },
        }
    }
};
