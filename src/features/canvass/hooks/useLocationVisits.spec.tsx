import { describe, expect, it, jest } from '@jest/globals';
import { act, render } from '@testing-library/react';
import { FC, Suspense } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import createStore from 'core/store';
import mockApiClient from 'utils/testing/mocks/mockApiClient';
import mockLocationVisit from 'utils/testing/mocks/mockLocationVisit';
import IApiClient from 'core/api/client/IApiClient';
import useLocationVisits from './useLocationVisits';
import Environment from 'core/env/Environment';
import { EnvProvider } from 'core/env/EnvContext';
import { UserProvider } from 'core/env/UserContext';
import { PromiseCacheProvider } from 'core/caching/PromiseCache';

describe('useLocationVisits', () => {
  it('loads visits for each location separately', async () => {
    const orgId = 1;
    const assignmentId = 2;

    const apiClient = mockApiClient({
      get: jest
        .fn<IApiClient['get']>()
        .mockImplementation(async <DataType,>(path: string) => {
          const locationId = parseInt(path.split('/locations/')[1]);
          return [
            mockLocationVisit({
              assignment_id: assignmentId,
              id: locationId * 10,
              location_id: locationId,
            }),
          ] as DataType;
        }),
    });
    const store = createStore();
    const env = new Environment(apiClient);

    const TestComponent: FC<{ locationId: number }> = ({ locationId }) => {
      const visits = useLocationVisits(orgId, assignmentId, locationId);
      return (
        <ul>
          {visits.map((visit) => (
            <li key={visit.id}>visit {visit.id}</li>
          ))}
        </ul>
      );
    };

    const renderLocation = (locationId: number) => (
      <ReduxProvider store={store}>
        <EnvProvider env={env}>
          <PromiseCacheProvider>
            <UserProvider user={null}>
              <Suspense fallback={<p>loading</p>}>
                <TestComponent locationId={locationId} />
              </Suspense>
            </UserProvider>
          </PromiseCacheProvider>
        </EnvProvider>
      </ReduxProvider>
    );

    const { queryByText, rerender } = render(renderLocation(3));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(queryByText('visit 30')).not.toBeNull();

    rerender(renderLocation(4));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      `/api2/orgs/${orgId}/area_assignments/${assignmentId}/locations/4/visits?size=100&page=1`
    );
    expect(queryByText('visit 40')).not.toBeNull();
    expect(queryByText('visit 30')).toBeNull();
  });
});
