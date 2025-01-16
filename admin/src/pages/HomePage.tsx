import { Main, Typography, Button, Flex, Box } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { getTranslation } from '../utils/getTranslation';
import { Play } from '@strapi/icons';
import { useState } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../pluginId';

const HomePage = () => {
  const { formatMessage } = useIntl();
  const { post } = useFetchClient();
  const [loadingTriggerButton, setLoadingTriggerButton] = useState(false);

  async function triggerGithubActions() {
    try {
      setLoadingTriggerButton(true);
      await post(`/${PLUGIN_ID}/trigger`);
      window.alert('Successfully started workflow!'); // TODO: Implement toasts
    } catch (error: any) {
      console.error(error);
      const { status, name } = error.response.data.error;

      if (status === 422 && name === 'UnprocessableEntityError') {
        window.alert('Unprocessable Entity!'); // TODO: Implement toasts
        return;
      }

      if (status === 403 && name === 'PolicyError') {
        window.alert('Permission Denied!'); // TODO: Implement toasts
        return;
      }

      window.alert('Unknown Error!'); // TODO: Implement toasts
    } finally {
      setLoadingTriggerButton(false);
    }
  }

  // TODO: Wrap in <CheckPagePermissions />
  return (
    <Main
      style={{
        padding: '3.2rem 5.4rem',
      }}
    >
      <Flex direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant='alpha'>{formatMessage({ id: getTranslation('plugin.name') })}</Typography>

        <Button onClick={triggerGithubActions} loading={loadingTriggerButton} style={{ height: '4.2rem' }} variant='default' startIcon={<Play/>}>
          <Typography fontSize="1.6rem">{formatMessage({ id: getTranslation('trigger-button.label') })}</Typography>
        </Button>
      </Flex>
    </Main>
  );
};

export { HomePage };
