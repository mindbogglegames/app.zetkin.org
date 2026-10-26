import { useApiClient, useAppSelector } from 'core/hooks';
import { visitsError, visitsLoad, visitsLoaded } from '../store';
import useRemoteList from 'core/hooks/useRemoteList';
import { ZetkinLocationVisit } from '../types';
import { fetchAllPaginated } from 'utils/fetchAllPaginated';
import { serializeError } from 'utils/storeUtils/serializeError';

export default function useLocationVisits(
  orgId: number,
  assignmentId: number,
  locationId: number
) {
  const apiClient = useApiClient();
  const visitList = useAppSelector(
    (state) =>
      state.canvass.locationVisitsByAssignmentAndLocationId[assignmentId]?.[
        locationId
      ]
  );

  return useRemoteList(visitList, {
    actionOnError: (err) =>
      visitsError([assignmentId, locationId, serializeError(err)]),
    actionOnLoad: () => visitsLoad([assignmentId, locationId]),
    actionOnSuccess: (items) => visitsLoaded([assignmentId, locationId, items]),
    cacheKey: `loadLocationVisits-${assignmentId}-${locationId}`,
    loader: () =>
      fetchAllPaginated<ZetkinLocationVisit>((page) =>
        apiClient.get(
          `/api2/orgs/${orgId}/area_assignments/${assignmentId}/locations/${locationId}/visits?size=100&page=${page}`
        )
      ),
  });
}
