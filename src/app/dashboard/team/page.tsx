import { teamService } from "@/services/teamService";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";
import { TeamPage } from "@/components/dashboard/team/TeamPage";

export default async function DashboardTeamPage() {
  const members = await teamService.listByClinic(DEFAULT_CLINIC_ID);
  return <TeamPage members={members} />;
}
