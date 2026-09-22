import { notFound } from "next/navigation";
import { clinicService } from "@/services/clinicService";
import { patientService } from "@/services/patientService";
import { appointmentService } from "@/services/appointmentService";
import { bookingService } from "@/services/bookingService";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";
import { buildDoctorNameLookup, buildServiceNameLookup } from "@/lib/dashboardOverview";
import { buildDoctorSwatchLookup } from "@/lib/patientDirectory";
import { findPatientAppointments, findPatientBookingRequests } from "@/lib/patientRecord";
import { todayIsoDate } from "@/lib/appointments";
import { PatientRecordWorkspace } from "@/components/dashboard/patients/PatientRecordWorkspace";

export const dynamic = "force-dynamic";

interface PatientRecordPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientRecordPage({ params }: PatientRecordPageProps) {
  const { id } = await params;

  const [{ doctors, services }, patient, appointments, bookings] = await Promise.all([
    clinicService.getClinicContent(DEFAULT_CLINIC_ID),
    patientService.getById(id),
    appointmentService.listByClinic(DEFAULT_CLINIC_ID),
    bookingService.listByClinic(DEFAULT_CLINIC_ID),
  ]);

  if (!patient) notFound();

  const doctorNameById = buildDoctorNameLookup(doctors);
  const doctorSwatchById = buildDoctorSwatchLookup(doctors);

  return (
    <PatientRecordWorkspace
      patient={patient}
      doctorName={doctorNameById[patient.primaryDoctorId] ?? "Unassigned"}
      doctorSwatch={doctorSwatchById[patient.primaryDoctorId] ?? "ink"}
      appointments={findPatientAppointments(appointments, patient)}
      bookings={findPatientBookingRequests(bookings, patient)}
      serviceNameById={buildServiceNameLookup(services)}
      todayIso={todayIsoDate()}
    />
  );
}
