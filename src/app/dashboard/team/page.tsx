import { teamService } from "@/services/teamService";
import { clinicService } from "@/services/clinicService";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";
import { TeamPage } from "@/components/dashboard/team/TeamPage";

export default async function DashboardTeamPage() {
  const [members, { clinic }] = await Promise.all([
    teamService.listByClinic(DEFAULT_CLINIC_ID),
    clinicService.getClinicContent(DEFAULT_CLINIC_ID),
  ]);
  return <TeamPage members={members} clinicShortName={clinic.shortName} />;
}
