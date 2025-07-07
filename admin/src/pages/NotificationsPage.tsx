import { Main } from '@strapi/design-system';
import { Page, ConfirmDialog, useFetchClient, useNotification } from '@strapi/strapi/admin';
import pluginPermissions from '../permissions';
import { Flex } from '@strapi/design-system';
import { Typography } from '@strapi/design-system';
import { Dialog } from '@strapi/design-system';
import { useEffect, useState } from 'react';
import { Button } from '@strapi/design-system';
import { Plus, Trash } from '@strapi/icons';
import { getTranslation } from '../utils/getTranslation';
import { useIntl } from 'react-intl';
import { TextInput } from '@strapi/design-system';
import { Table } from '@strapi/design-system';
import { Thead } from '@strapi/design-system';
import { Tr } from '@strapi/design-system';
import { Th } from '@strapi/design-system';
import { Tbody } from '@strapi/design-system';
import { PLUGIN_ID } from '../pluginId';
import { Td } from '@strapi/design-system';
import { Tooltip } from '@strapi/design-system';
import { IconButton } from '@strapi/design-system';
import { VisuallyHidden } from '@strapi/design-system';

const NotificationsPage = () => {
  const { formatMessage } = useIntl();
  const { get, post, del } = useFetchClient();
  const [showAddEmailPopup, setShowAddEmailPopup] = useState(false);
  const [showConfirmEmailDeletionPopup, setShowConfirmEmailDeletionPopup] = useState(false);
  const [emailsForNotifications, setEmailsForNotifications] = useState([]);
  const [newEmail, setNewEmail] = useState<string | undefined>();
  const [emailToDelete, setEmailToDelete] = useState<string | undefined>();
  const { toggleNotification } = useNotification();

  function validateNewEmail(email: string) {
    if (email === '') {
        setNewEmail(undefined);
        return;
    }

    if (email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
        setNewEmail(email);
        return;
    }

    setNewEmail(undefined);
  }

  async function getEmailsForNotifications() {
    try {
      const { data } = await get(`/${PLUGIN_ID}/emails-for-notifications`);
      if (data.success) {
        setEmailsForNotifications(data.emails);
      } else {
        console.error(data.err);
        setEmailsForNotifications([]);
      }
    } catch (error: any) {
      console.error(error);
      setEmailsForNotifications([]);
    }
  }

  async function addNewEmail() {
    try {
        const { data } = await post(`/${PLUGIN_ID}/emails-for-notifications`, { newEmail });
        if (data.success) {
            setNewEmail(undefined);
            getEmailsForNotifications();
            toggleNotification({
                type: 'success',
                title: 'Email added successfully!',
                timeout: 5000,
            });
        } else {
            console.error(data.err);
            toggleNotification({
                type: 'danger',
                title: 'Failed to add email',
                message: 'Please try again',
                timeout: 5000,
            });
        }
    } catch (error: any) {
        console.error(error);
        toggleNotification({
            type: 'danger',
            title: 'Failed to add email',
            message: 'Please try again',
            timeout: 5000,
        });
    }
  }

  async function deleteEmail() {
    try {
        const { data } = await del(`/${PLUGIN_ID}/emails-for-notifications`, { params: { email: emailToDelete } });
        if (data.success) {
            getEmailsForNotifications();
            toggleNotification({
                type: 'success',
                title: 'Email removed successfully!',
                timeout: 5000,
            });
        } else {
            console.error(data.err);
            toggleNotification({
                type: 'danger',
                title: 'Failed to add email',
                message: 'Please try again',
                timeout: 5000,
            });
        }
    } catch (error: any) {
        console.error(error);
        toggleNotification({
            type: 'danger',
            title: 'Failed to remove email',
            message: 'Please try again',
            timeout: 5000,
        });
    } finally {
        setEmailToDelete(undefined);
    }
  }

  useEffect(() => {
    getEmailsForNotifications();
  }, []);

  useEffect(() => {
    if (emailToDelete && !showConfirmEmailDeletionPopup) {
        setShowConfirmEmailDeletionPopup(true);
    }
  }, [emailToDelete]);

  return (
    <Page.Protect permissions={pluginPermissions.notifications}>
      <Main
        style={{
          padding: '0 5.4rem 3.2rem 5.4rem',
        }}
      >
        <Flex
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          marginBottom="4rem"
        >
          <Typography variant="alpha">Email Notifications</Typography>

          <Flex direction="row" alignItems="center" gap="1rem">
            <Dialog.Root open={showAddEmailPopup} onOpenChange={setShowAddEmailPopup}>
              <Dialog.Trigger>
                <Button style={{ height: '4.2rem' }} variant="default" startIcon={<Plus />}>
                  <Typography fontSize="1.6rem">
                    {formatMessage({ id: getTranslation('add-email-button.label') })}
                  </Typography>
                </Button>
              </Dialog.Trigger>

              <Dialog.Content>
                <Dialog.Header>Add Email Address</Dialog.Header>
                <Dialog.Body>
                  <Flex direction="column" alignItems="stretch" gap="1rem" width="100%">
                    <Typography>This address will receive email notifications</Typography>
                    <TextInput type="email" placeholder="Email Address" onChange={(e: any) => validateNewEmail(e.target.value)}/>
                  </Flex>
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.Cancel>
                    <Button fullWidth variant="tertiary">
                      Cancel
                    </Button>
                  </Dialog.Cancel>
                  <Dialog.Action>
                    <Button fullWidth variant="success-light" disabled={!newEmail} onClick={addNewEmail}>
                      Confirm
                    </Button>
                  </Dialog.Action>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Root>
          </Flex>
        </Flex>

        <Table colCount={2}>
          <Thead>
            <Tr>
              <Th key={'email'}>
                <Typography variant="sigma">Email Address</Typography>
              </Th>
              <Th key={'actions'}></Th>
            </Tr>
          </Thead>
          <Tbody>
            {emailsForNotifications.length <= 0 && (
              <Tr key="empty">
                <Td>
                  <Typography variant="sigma">No Emails</Typography>
                </Td>
                <Td />
              </Tr>
            )}

            {emailsForNotifications.map((email: string) => (
              <Tr key={email}>
                <Td>
                  <Typography variant="sigma">{email}</Typography>
                </Td>
                <Td>
                    <Tooltip description="Remove Email">
                        <IconButton aria-label="Remove Email" marginLeft='auto' onClick={() => setEmailToDelete(email)}>
                            <Trash />
                        </IconButton>
                    </Tooltip>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <Dialog.Root open={showConfirmEmailDeletionPopup} onOpenChange={setShowConfirmEmailDeletionPopup}>
            <ConfirmDialog
                variant="default"
                icon={null}
                onConfirm={deleteEmail}
                // @ts-ignore
                onCancel={() => setEmailToDelete(undefined)}
                title="Confirm Email Deletion?"
            >
                <Typography fontSize="1.4rem">The address [{emailToDelete}] will stop receiving all email notifications</Typography>
            </ConfirmDialog>
        </Dialog.Root>
      </Main>
    </Page.Protect>
  );
};

export { NotificationsPage };
