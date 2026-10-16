import createEvents from '../rpc/createEvents';
import { eventsCreate, eventsCreated } from '../store';
import { ZetkinEventPostBody } from './useEventMutations';
import { useApiClient, useAppDispatch } from 'core/hooks';

export default function useCreateEvents(orgId: number) {
  const apiClient = useApiClient();
  const dispatch = useAppDispatch();

  return async (events: ZetkinEventPostBody[]) => {
    dispatch(eventsCreate());
    const createdEvents = await apiClient.rpc(createEvents, { events, orgId });
    dispatch(eventsCreated(createdEvents));

    return createdEvents;
  };
}
