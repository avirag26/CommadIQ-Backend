import { OrganizationRole } from '@prisma/client';

export interface AddMemberData {
  organizationId: string;
  userId: string;
  role: OrganizationRole;
}
