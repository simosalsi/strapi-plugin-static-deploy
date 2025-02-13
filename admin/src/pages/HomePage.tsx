import { Main, Typography, Button, Flex, Badge, Table, Thead, Tbody, Tr, Th, Td } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { getTranslation } from '../utils/getTranslation';
import { Play, ArrowClockwise } from '@strapi/icons';
import { useEffect, useState } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../pluginId';
import { differenceInMilliseconds, formatRelative } from 'date-fns';

const HomePage = () => {
  const { formatMessage } = useIntl();
  const { get, post } = useFetchClient();
  const [loadingTriggerButton, setLoadingTriggerButton] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState<'loading' | 'planned' | 'none'>('none');

  async function fetchHistory() {
    setLoadingHistory('loading');

    try {
      const { data } = await get(`/${PLUGIN_ID}/history`);
      setHistory(data.workflow_runs.slice(0, 10));
    } catch (error: any) {
      console.error(error);
      window.alert('Failed to fetch workflow history!'); // TODO: Implement toasts
    } finally {
      setLoadingHistory('none');
    }
  }

  async function triggerGithubActions() {
    try {
      setLoadingTriggerButton(true);
      await post(`/${PLUGIN_ID}/trigger`);
      window.alert('Successfully started workflow!\n\nHistory will be refetched in 5 seconds'); // TODO: Implement toasts
      setLoadingHistory('planned');
      setTimeout(fetchHistory, 5000);
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

  useEffect(() => {
    fetchHistory();
  }, []);

  // TODO: Wrap in <CheckPagePermissions />
  return (
    <Main
      style={{
        padding: '3.2rem 5.4rem',
      }}
    >
      <Flex direction="row" alignItems="center" justifyContent="space-between" marginBottom='4rem'>
        <Typography variant='alpha'>{formatMessage({ id: getTranslation('plugin.name') })}</Typography>

        <Flex direction="row" alignItems="center" gap='1rem'>
          <Button onClick={fetchHistory} loading={loadingHistory !== 'none'} disabled={loadingTriggerButton} style={{ height: '4.2rem' }} variant='secondary' startIcon={<ArrowClockwise/>}>
            <Typography fontSize="1.6rem">{formatMessage({ id: getTranslation('reload-button.label') })}</Typography>
          </Button>
          <Button onClick={triggerGithubActions} loading={loadingTriggerButton} disabled={loadingHistory !== 'none'} style={{ height: '4.2rem' }} variant='default' startIcon={<Play/>}>
            <Typography fontSize="1.6rem">{formatMessage({ id: getTranslation('trigger-button.label') })}</Typography>
          </Button>
        </Flex>
      </Flex>

      <Table colCount={5} rowCount={11}>
        <Thead>
          <Tr>
            <Th key={'run-number'}><Typography variant='sigma'>{formatMessage({ id: getTranslation('history-table.run-number') })}</Typography></Th>
            <Th key={'workflow-name'}><Typography variant='sigma'>{formatMessage({ id: getTranslation('history-table.workflow-name') })}</Typography></Th>
            <Th key={'status'}><Typography variant='sigma'>{formatMessage({ id: getTranslation('history-table.status') })}</Typography></Th>
            <Th key={'creation-date'}><Typography variant='sigma'>{formatMessage({ id: getTranslation('history-table.creation-date') })}</Typography></Th>
            <Th key={'duration'}><Typography variant='sigma'>{formatMessage({ id: getTranslation('history-table.duration') })}</Typography></Th>
          </Tr>
        </Thead>
        <Tbody>
          {loadingHistory === 'loading' && (
            <Tr>
              <Td></Td>
              <Td></Td>
              <Td><Typography variant='sigma'>Loading history...</Typography></Td>
              <Td></Td>
              <Td></Td>
            </Tr>
          )}
          
          {loadingHistory === 'planned' && (
            <Tr>
              <Td></Td>
              <Td></Td>
              <Td><Typography variant='sigma'>Loading history in 5 seconds...</Typography></Td>
              <Td></Td>
              <Td></Td>
            </Tr>
          )}

          {loadingHistory === 'none' && (
            history.map((workflow: any) => {
              const msDuration = differenceInMilliseconds(new Date(workflow.updated_at), new Date(workflow.run_started_at));
              const secs = (msDuration / 1000) % 60;
              const mins = Math.floor(msDuration / 1000 / 60);
              const relativeDate = formatRelative(new Date(workflow.created_at), new Date());
              const year = relativeDate.includes('/') ? relativeDate.split('/')[2] : null;
              const month = relativeDate.includes('/') ? relativeDate.split('/')[0] : null;
              const day = relativeDate.includes('/') ? relativeDate.split('/')[1] : null;
              const ymdRelativeDate = relativeDate.includes('/') ? `${year}-${month}-${day}` : relativeDate;

              return (
              <Tr key={workflow.id}>
                <Td><Typography variant='sigma'>{workflow.run_number}</Typography></Td>
                <Td><Typography variant='sigma'>{workflow.name}</Typography></Td>
                <Td><Badge>{workflow.conclusion ?? workflow.status}</Badge></Td>
                <Td><Typography variant='sigma'>{ymdRelativeDate}</Typography></Td>
                <Td><Typography variant='sigma'>{workflow.conclusion ? `${mins}m ${secs}s` : 'in progress'}</Typography></Td>
              </Tr>
            )})
          )}
        </Tbody>
      </Table>
    </Main>
  );
};

export { HomePage };
