import checkBearerToken from './checkBearerToken';
import checkWorkflowEndEvent from './checkWorkflowEndEvent';

export default {
  hasValidBearerToken: checkBearerToken,
  isValidWorkflowEndNotificationEvent: checkWorkflowEndEvent,
};
