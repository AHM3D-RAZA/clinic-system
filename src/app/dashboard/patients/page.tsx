import { clinicService } from "@/services/clinicService";
import { patientService } from "@/services/patientService";
import { appointmentService } from "@/services/appointmentService";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";
import { buildDoctorNameLookup, todayIsoDate } from "@/lib/dashboardOverview";
import { buildDoctorSwatchLookup } from "@/lib/patientDirectory";
import { withDerivedSchedule } from "@/lib/patientRecord";
import { PatientsWorkspace } from "@/components/dashboard/patients/PatientsWorkspace";

/**
 * Reads the live patient directory — must never be a build-time
 * snapshot, the same reasoning as the dashboard overview page.
 */
export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const [{ doctors }, patients, appointments] = await Promise.all([
    clinicService.getClinicContent(DEFAULT_CLINIC_ID),
    patientService.listByClinic(DEFAULT_CLINIC_ID),
    appointmentService.listByClinic(DEFAULT_CLINIC_ID),
  ]);
  const todayIso = todayIsoDate(new Date());

  return (
    <PatientsWorkspace
      patients={patients.map((p) => withDerivedSchedule(p, appointments, todayIso))}
      doctorNameById={buildDoctorNameLookup(doctors)}
      doctorSwatchById={buildDoctorSwatchLookup(doctors)}
      todayIso={todayIso}
    />
  );
}
