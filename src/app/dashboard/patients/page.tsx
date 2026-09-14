import { clinicService } from "@/services/clinicService";
import { patientService } from "@/services/patientService";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";
import { buildDoctorNameLookup, todayIsoDate } from "@/lib/dashboardOverview";
import { buildDoctorSwatchLookup } from "@/lib/patientDirectory";
import { PatientsWorkspace } from "@/components/dashboard/patients/PatientsWorkspace";

/**
 * Reads the live patient directory — must never be a build-time
 * snapshot, the same reasoning as the dashboard overview page.
 */
export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const [{ doctors }, patients] = await Promise.all([
    clinicService.getClinicContent(DEFAULT_CLINIC_ID),
    patientService.listByClinic(DEFAULT_CLINIC_ID),
  ]);

  return (
    <PatientsWorkspace
      patients={patients}
      doctorNameById={buildDoctorNameLookup(doctors)}
      doctorSwatchById={buildDoctorSwatchLookup(doctors)}
      todayIso={todayIsoDate(new Date())}
    />
  );
}
