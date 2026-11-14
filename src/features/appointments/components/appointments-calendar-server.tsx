import React from 'react';
import { getCalendarAppointmentsApi } from '../apis/appointment.api';
import { AppointmentsCalendarView } from './appointments-calendar-view';
import { CalendarViewMode } from '../types/calendar';

interface AppointmentsCalendarServerProps {
  searchParams: Promise<{
    date?: string;
    doctorId?: string;
    view?: CalendarViewMode;
  }>;
}

export async function AppointmentsCalendarServer({
  searchParams,
}: AppointmentsCalendarServerProps) {
  const resolvedParams = await searchParams;
  const viewMode: CalendarViewMode = resolvedParams.view || 'week';
  const data = await getCalendarAppointmentsApi({
    date: resolvedParams.date,
    doctorId: resolvedParams.doctorId,
    view: viewMode,
  });

  return (
    <AppointmentsCalendarView
      data={data}
      initialView={viewMode}
      initialDate={resolvedParams.date}
      initialDoctorId={resolvedParams.doctorId}
    />
  );
}

