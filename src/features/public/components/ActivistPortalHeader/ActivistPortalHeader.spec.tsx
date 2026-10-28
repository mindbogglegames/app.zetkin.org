import { describe, expect, it, jest } from '@jest/globals';

import ActivistPortalHeader from 'features/public/components/ActivistPortalHeader';
import { render } from 'utils/testing';
import { ZetkinMembership } from 'utils/types/zetkin';

const mockMemberships: ZetkinMembership[] = [];

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('core/hooks/useUser', () => ({
  __esModule: true,
  default: () => ({ first_name: 'Clara', id: 1, last_name: 'Zetkin' }),
}));

jest.mock('features/public/hooks/useUserMemberships', () => ({
  __esModule: true,
  default: () => mockMemberships,
}));

function setMemberships(orgId: number, role: string | null) {
  mockMemberships.splice(0, mockMemberships.length, {
    organization: { id: orgId, title: 'Org' },
    profile: { id: 1, name: 'Clara Zetkin' },
    role,
  });
}

const organizeLink = {
  href: '/organize/1/projects/2/events/3',
  orgId: 1,
};

describe('ActivistPortalHeader', () => {
  it('links to the organizer page when the user is an official of its org', () => {
    setMemberships(1, 'organizer');
    const { getByRole } = render(
      <ActivistPortalHeader organizeLink={organizeLink} />,
      { theme: 'zui' }
    );
    expect(getByRole('link').getAttribute('href')).toBe(organizeLink.href);
  });

  it('links to /organize when the user is an official of another org', () => {
    setMemberships(4, 'admin');
    const { getByRole } = render(
      <ActivistPortalHeader organizeLink={organizeLink} />,
      { theme: 'zui' }
    );
    expect(getByRole('link').getAttribute('href')).toBe('/organize');
  });

  it('links to /organize when there is no organizer page', () => {
    setMemberships(1, 'admin');
    const { getByRole } = render(<ActivistPortalHeader />, { theme: 'zui' });
    expect(getByRole('link').getAttribute('href')).toBe('/organize');
  });

  it('hides the button when the user is not an official', () => {
    setMemberships(1, null);
    const { queryByRole } = render(
      <ActivistPortalHeader organizeLink={organizeLink} />,
      { theme: 'zui' }
    );
    expect(queryByRole('link')).toBeNull();
  });
});
