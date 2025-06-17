import {
  Main,
  Typography,
  Button,
  Flex,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { getTranslation } from '../utils/getTranslation';
import { Play, ArrowClockwise, ExternalLink, Expand } from '@strapi/icons';
import { useEffect, useState } from 'react';
import { ConfirmDialog, useFetchClient, useNotification, useRBAC } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../pluginId';
import { differenceInMilliseconds, formatRelative } from 'date-fns';
import pluginPermissions from '../permissions';
import { Dialog } from '@strapi/design-system';
import Workflow from '../../../types/workflow';
import Config from '../../../types/config';
import StagingStatus from '../../../types/StagingStatus';
import { Tooltip } from '@strapi/design-system';
import { IconButton } from '@strapi/design-system';

const HomePage = () => {
  const { formatMessage } = useIntl();
  const { get, post } = useFetchClient();
  const [loadingTriggerButton, setLoadingTriggerButton] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);
  const [unstagedUpdates, setUnstagedUpdates] = useState<boolean>(true);
  const [history, setHistory] = useState<Array<Workflow>>([]);
  const [loadingHistory, setLoadingHistory] = useState<'loading' | 'planned' | 'none'>('none');
  const [showTriggerConfirmationPopup, setShowTriggerConfirmationPopup] = useState(false);
  const {
    allowedActions: { canTrigger },
  } = useRBAC(pluginPermissions.trigger);
  const { toggleNotification } = useNotification();

  async function getConfig() {
    try {
      const { data } = await get<Config>(`/${PLUGIN_ID}/config`);
      setConfig(data);
    } catch (error: any) {
      console.error(error);
      setConfig(null);
    }
  }

  async function getStagingStatus(): Promise<StagingStatus | null> {
    try {
      const { data } = await get<StagingStatus>(`/${PLUGIN_ID}/staging-status`);
      return data;
    } catch (error: any) {
      console.error(error);
      setUnstagedUpdates(true);
      return null;
    }
  }

  async function setStagingStatus(newDocumentData: Omit<StagingStatus, 'createdAt'>) {
    try {
      await post(`/${PLUGIN_ID}/staging-status`, newDocumentData);
    } catch (error: any) {
      console.error(error);
      setUnstagedUpdates(true);
    }
  }

  async function verifyStagingStatus(data: { workflow_runs: Workflow[] }) {
    // Check last workflow's conclusion to determine whether to allow production trigger (aka setUnstagedUpdates)
    if (config?.staging) {
      const lastWorkflow: Workflow | undefined = data.workflow_runs[0];
      const currentStagingStatus = await getStagingStatus();

      // If no lastWorkflow --> Leave everything as is
      // If no currentStagingStatus --> There's been an issue --> Leave everything as is (which in this case will be the prod trigger being blocker)
      if (currentStagingStatus && lastWorkflow) {
        const lastWorkflowPathArray = lastWorkflow.path.split('/');
        const lastWorkflowFileName = lastWorkflowPathArray[lastWorkflowPathArray.length - 1];

        const lastWorkflowCreationDate = new Date(lastWorkflow.created_at);
        const lastUpdateDate = new Date(currentStagingStatus.createdAt);

        // If last updates where made after the last workflow was ran, ignore everything and just disable prod trigger
        if (currentStagingStatus.unstagedUpdates && lastUpdateDate > lastWorkflowCreationDate) {
          setUnstagedUpdates(true);
        } else {
          // Otherwise, check the last workflow's conclusion
          if (lastWorkflowFileName === config.staging.workflowID) {
            // Staging workflow --> Allow prod trigger only if it succeeded
            setUnstagedUpdates(lastWorkflow.conclusion !== 'success');
            // Use setStagingStatus to make sure DB data is consistent
            setStagingStatus({ unstagedUpdates: lastWorkflow.conclusion !== 'success' });
          } else {
            // Prod workflow
            if (currentStagingStatus.unstagedUpdates) {
              // This should not occur: if there are unstaged updates older than the last workflow, the latter should have been forced to be a staging deploy
              // If this does happen, it means two things:
              // 1. This case is an error and we should disable prod trigger to be safe
              // 2. We fetched history before the true last workflow run (a staging one) could be loaded
              // --> This means the last workflow run is actually a staging run that's ongoing, hence we should disable prod trigger
              setUnstagedUpdates(true);
            } else {
              if (lastWorkflow.conclusion === 'success') {
                // Successful last prod deploy and no unstaged updates --> Keep prod trigger enabled
                setUnstagedUpdates(false);
              } else {
                // Last prod deploy failed, if latest staging deploy failed as well (or if it doesn't exist), disable prod trigger
                const lastStagingWorkflow: Workflow | undefined = data.workflow_runs.filter(
                  (workflow) => {
                    const workflowPathArray = workflow.path.split('/');
                    const workflowFileName = workflowPathArray[workflowPathArray.length - 1];

                    return workflowFileName === config.staging!.workflowID;
                  }
                )[0];

                if (!lastStagingWorkflow) {
                  // If last staging workflow doesn't exist (or is too far back), disable prod to be sure
                  setUnstagedUpdates(true);
                  // Use setStagingStatus to also update the value in DB for consistency
                  setStagingStatus({ unstagedUpdates: true });
                } else {
                  // Not checking if there are any changes after last staging workflow because if we got here there are no unstaged changes

                  if (lastStagingWorkflow.conclusion === 'success') {
                    // No updates and last staging deploy was ok, keep prod enabled
                    setUnstagedUpdates(false);
                  } else {
                    // It should be impossible to have a prod deploy after a failed staging deploy
                    // Hence this is an error case --> reset to prod trigger being disabled
                    setUnstagedUpdates(true);
                    // Use setStagingStatus to make sure DB data is consistent
                    setStagingStatus({ unstagedUpdates: true });
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  async function fetchHistory() {
    setLoadingHistory('loading');

    try {
      const { data } = await get(`/${PLUGIN_ID}/history`);
      await verifyStagingStatus(data);
      setHistory(data.workflow_runs.slice(0, 10));
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User likely just changed page before fetch completed, do nothing
        return;
      } else {
        console.error(error);
        toggleNotification({
          type: 'danger',
          title: 'Failed to fetch workflow history!',
        });
      }
    } finally {
      setLoadingHistory('none');
    }
  }

  async function triggerGithubActions() {
    setLoadingTriggerButton(true);

    try {
      if (config?.staging && unstagedUpdates) {
        // Staging
        await post(`/${PLUGIN_ID}/trigger-staging`);
      } else {
        // Prod
        // Check for unstaged updates to prevent triggering if another editor published changes while the user was on this page
        const currentStagingStatus = await getStagingStatus();
        if (currentStagingStatus === null) {
          // Disable prod trigger and show error
          setUnstagedUpdates(true);
          toggleNotification({
            type: 'danger',
            title: 'Trigger was aborted!',
            message: 'Could not fetch current staging status',
            timeout: 5000,
          });
          return;
        }
        if (currentStagingStatus.unstagedUpdates === true) {
          // Disable prod trigger and show message
          setUnstagedUpdates(true);
          toggleNotification({
            type: 'danger',
            title: 'Trigger was aborted!',
            message: 'New unstaged updates found!',
            timeout: 5000,
          });
          return;
        }

        await post(`/${PLUGIN_ID}/trigger`);
      }

      toggleNotification({
        type: 'success',
        title: 'Successfully started workflow!',
        message: 'History will be refetched in 5 seconds',
        timeout: 5000,
      });
      setLoadingHistory('planned');
      setTimeout(fetchHistory, 5000);
    } catch (error: any) {
      console.error(error);
      const { status, name } = error.response.data.error;

      if (status === 422 && name === 'UnprocessableEntityError') {
        toggleNotification({
          type: 'danger',
          title: 'Error 422: Unprocessable Entity',
        });
        return;
      }

      if (status === 403 && name === 'PolicyError') {
        toggleNotification({
          type: 'danger',
          title: 'Error 403: Permission Denied',
        });
        return;
      }

      toggleNotification({
        type: 'danger',
        title: 'Failed to trigger workflow!',
        message: 'Unknown error occurred. Please check the console for more details.',
      });
    } finally {
      setLoadingTriggerButton(false);
    }
  }

  function getWorkflowName(): string {
    if (config?.staging && unstagedUpdates) {
      // Staging
      const stagingHistory = history.filter((workflow) => {
        const workflowPathArray = workflow.path.split('/');
        const workflowFileName = workflowPathArray[workflowPathArray.length - 1];

        return workflowFileName === config.staging!.workflowID;
      });
      return `"${stagingHistory[0]?.name ?? config.staging.workflowID}"`;
    } else {
      // Prod
      const prodHistory = history.filter((workflow) => {
        const workflowPathArray = workflow.path.split('/');
        const workflowFileName = workflowPathArray[workflowPathArray.length - 1];

        return workflowFileName === config?.workflowID;
      });
      return `"${prodHistory[0]?.name ?? config?.workflowID ?? ''}"`;
    }
  }

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    if (config) {
      fetchHistory();
    }
  }, [config]);

  return (
    <Main
      style={{
        padding: '3.2rem 5.4rem',
      }}
    >
      <Flex direction="row" alignItems="center" justifyContent="space-between" marginBottom="4rem">
        <Typography variant="alpha">
          {formatMessage({ id: getTranslation('plugin.name') })}
        </Typography>

        <Flex direction="row" alignItems="center" gap="1rem">
          <Button
            onClick={fetchHistory}
            loading={loadingHistory !== 'none'}
            disabled={loadingTriggerButton}
            style={{ height: '4.2rem' }}
            variant="secondary"
            startIcon={<ArrowClockwise />}
          >
            <Typography fontSize="1.6rem">
              {formatMessage({ id: getTranslation('reload-button.label') })}
            </Typography>
          </Button>

          <Dialog.Root
            open={showTriggerConfirmationPopup}
            onOpenChange={setShowTriggerConfirmationPopup}
          >
            <Dialog.Trigger>
              {config?.staging ? (
                <Flex>
                  <Button
                    loading={loadingTriggerButton}
                    disabled={loadingHistory !== 'none' || !canTrigger || !unstagedUpdates}
                    style={{
                      height: '4.2rem',
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    }}
                    variant="default"
                    startIcon={<Expand />}
                  >
                    <Typography fontSize="1.6rem">
                      {formatMessage({ id: getTranslation('staging-button.label') })}
                    </Typography>
                  </Button>
                  <Button
                    loading={loadingTriggerButton}
                    disabled={loadingHistory !== 'none' || !canTrigger || unstagedUpdates}
                    style={{ height: '4.2rem', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    variant="default"
                    startIcon={<Play />}
                    title="Trigger will unlock once staging has successfully completed"
                  >
                    <Typography fontSize="1.6rem">
                      {formatMessage({ id: getTranslation('trigger-button.label') })}
                    </Typography>
                  </Button>
                </Flex>
              ) : (
                <Button
                  loading={loadingTriggerButton}
                  disabled={loadingHistory !== 'none' || !canTrigger}
                  style={{ height: '4.2rem' }}
                  variant="default"
                  startIcon={<Play />}
                >
                  <Typography fontSize="1.6rem">
                    {formatMessage({ id: getTranslation('trigger-button.label') })}
                  </Typography>
                </Button>
              )}
            </Dialog.Trigger>

            <ConfirmDialog
              variant="default"
              icon={null}
              onConfirm={triggerGithubActions}
              title="Confirm Workflow Trigger"
            >
              <Typography fontSize="1.4rem">Triggering workflow {getWorkflowName()}</Typography>
              {config && (
                <Typography fontSize="1.2rem">
                  (Workflow ID:{' '}
                  {config.staging && unstagedUpdates
                    ? config.staging.workflowID
                    : config.workflowID}
                  )
                </Typography>
              )}
            </ConfirmDialog>
          </Dialog.Root>
        </Flex>
      </Flex>

      <Table colCount={5} rowCount={11}>
        <Thead>
          <Tr>
            <Th key={'run-number'}>
              <Typography variant="sigma">
                {formatMessage({ id: getTranslation('history-table.run-number') })}
              </Typography>
            </Th>
            <Th key={'workflow-name'}>
              <Typography variant="sigma">
                {formatMessage({ id: getTranslation('history-table.workflow-name') })}
              </Typography>
            </Th>
            <Th key={'status'}>
              <Typography variant="sigma">
                {formatMessage({ id: getTranslation('history-table.status') })}
              </Typography>
            </Th>
            <Th key={'creation-date'}>
              <Typography variant="sigma">
                {formatMessage({ id: getTranslation('history-table.creation-date') })}
              </Typography>
            </Th>
            <Th key={'duration'}>
              <Typography variant="sigma">
                {formatMessage({ id: getTranslation('history-table.duration') })}
              </Typography>
            </Th>
            {!config?.hideGithubLink && <Th key={'actions'}></Th>}
          </Tr>
        </Thead>
        <Tbody>
          {loadingHistory === 'loading' && (
            <Tr>
              <Td></Td>
              <Td></Td>
              <Td>
                <Typography variant="sigma">Loading history...</Typography>
              </Td>
              <Td></Td>
              <Td></Td>
              {!config?.hideGithubLink && <Td></Td>}
            </Tr>
          )}

          {loadingHistory === 'planned' && (
            <Tr>
              <Td></Td>
              <Td></Td>
              <Td>
                <Typography variant="sigma">Loading history in 5 seconds...</Typography>
              </Td>
              <Td></Td>
              <Td></Td>
              {!config?.hideGithubLink && <Td></Td>}
            </Tr>
          )}

          {loadingHistory === 'none' &&
            history.map((workflow: Workflow) => {
              const msDuration = differenceInMilliseconds(
                new Date(workflow.updated_at),
                new Date(workflow.run_started_at)
              );
              const secs = (msDuration / 1000) % 60;
              const mins = Math.floor(msDuration / 1000 / 60);
              const relativeDate = formatRelative(new Date(workflow.created_at), new Date());
              const year = relativeDate.includes('/') ? relativeDate.split('/')[2] : null;
              const month = relativeDate.includes('/') ? relativeDate.split('/')[0] : null;
              const day = relativeDate.includes('/') ? relativeDate.split('/')[1] : null;
              const ymdRelativeDate = relativeDate.includes('/')
                ? `${year}-${month}-${day}`
                : relativeDate;

              return (
                <Tr key={workflow.id}>
                  <Td>
                    <Typography variant="sigma">{workflow.run_number}</Typography>
                  </Td>
                  <Td>
                    <Typography variant="sigma">{workflow.name}</Typography>
                  </Td>
                  <Td>
                    <Badge>{workflow.conclusion ?? workflow.status}</Badge>
                  </Td>
                  <Td>
                    <Typography variant="sigma">{ymdRelativeDate}</Typography>
                  </Td>
                  <Td>
                    <Typography variant="sigma">
                      {workflow.conclusion ? `${mins}m ${secs}s` : 'in progress'}
                    </Typography>
                  </Td>
                  {!config?.hideGithubLink && (
                    <Td>
                      <Tooltip description="Show in Github">
                        <a href={workflow.html_url} target="_blank" rel="noreferrer">
                          <IconButton aria-label="Show in Github">
                            <ExternalLink />
                          </IconButton>
                        </a>
                      </Tooltip>
                    </Td>
                  )}
                </Tr>
              );
            })}
        </Tbody>
      </Table>
    </Main>
  );
};

export { HomePage };
