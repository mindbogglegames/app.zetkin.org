import { z } from 'zod';

import IApiClient from 'core/api/client/IApiClient';
import { makeRPCDef } from 'core/rpc/types';
import { ZetkinEvent } from 'utils/types/zetkin';

const paramsSchema = z.object({
  events: z.array(
    z.object({
      activity_id: z.union([z.optional(z.number()), z.null()]),
      campaign_id: z.optional(z.number()),
      cancelled: z.union([z.optional(z.string()), z.null()]),
      contact_id: z.union([z.optional(z.number()), z.null()]),
      cover_file_id: z.union([z.optional(z.number()), z.null()]),
      end_time: z.optional(z.string()),
      info_text: z.optional(z.string()),
      location_id: z.union([z.optional(z.number()), z.null()]),
      num_participants_available: z.optional(z.number()),
      num_participants_required: z.optional(z.number()),
      organization_id: z.optional(z.number()),
      published: z.union([z.optional(z.string()), z.null()]),
      start_time: z.optional(z.string()),
      title: z.optional(z.string().or(z.null())),
      url: z.optional(z.string()),
    })
  ),
  orgId: z.number(),
});

type Params = z.input<typeof paramsSchema>;
type Result = ZetkinEvent[];

export const createEventsDef = {
  handler: handle,
  name: 'createEvents',
  schema: paramsSchema,
};

export default makeRPCDef<Params, Result>(createEventsDef.name);

async function handle(params: Params, apiClient: IApiClient): Promise<Result> {
  const { events, orgId } = params;

  return Promise.all(
    events.map((event) => {
      const { campaign_id, ...data } = event;
      return apiClient.post<ZetkinEvent>(
        `/api/orgs/${orgId}/${
          campaign_id ? `campaigns/${campaign_id}/` : ''
        }actions`,
        data
      );
    })
  );
}
