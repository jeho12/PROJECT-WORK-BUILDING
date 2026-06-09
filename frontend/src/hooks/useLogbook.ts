import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logbookService } from '@/services/logbook.service';
import { WeeklyReport } from '@/types/logbook.types';
import toast from 'react-hot-toast';

export function useLogbook(studentId?: string) {
  const queryClient = useQueryClient();

  const useWeeksQuery = (sId: string) => useQuery({
    queryKey: ['logbook_weeks', sId],
    queryFn: () => logbookService.getWeeks(sId),
    enabled: !!sId
  });

  const useWeekQuery = (weekId: string) => useQuery({
    queryKey: ['logbook_week', weekId],
    queryFn: () => logbookService.getWeek(weekId),
    enabled: !!weekId
  });

  const useRecentActivitiesQuery = (sId: string) => useQuery({
    queryKey: ['logbook_recent_activities', sId],
    queryFn: () => logbookService.getRecentActivities(sId),
    enabled: !!sId
  });

  const createWeekMutation = useMutation({
    mutationFn: (data: { startDate: string; endDate: string }) => 
      logbookService.createWeek(studentId || '', data.startDate, data.endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logbook_weeks', studentId] });
      toast.success('Logbook week initialized successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create logbook week');
    }
  });

  const submitDayMutation = useMutation({
    mutationFn: (data: { dayId: string; timeIn: string; timeOut: string; activity: string; evidenceUrl?: string }) =>
      logbookService.submitDay(data.dayId, {
        timeIn: data.timeIn,
        timeOut: data.timeOut,
        activity: data.activity,
        evidenceUrl: data.evidenceUrl
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['logbook_week', data.weekId] });
      queryClient.invalidateQueries({ queryKey: ['logbook_recent_activities', studentId] });
      toast.success(`${data.dayName} entry locked and submitted!`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit log entry');
    }
  });

  const submitWeeklyReportMutation = useMutation({
    mutationFn: (data: { weekId: string; report: WeeklyReport }) =>
      logbookService.submitWeeklyReport(data.weekId, data.report),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['logbook_week', data.id] });
      queryClient.invalidateQueries({ queryKey: ['logbook_weeks', studentId] });
      toast.success('Weekly report submitted to supervisor for review!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit weekly report');
    }
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: (data: { weekId: string; file: File }) =>
      logbookService.uploadAttachment(data.weekId, data.file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['logbook_week', variables.weekId] });
      toast.success('File uploaded successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'File upload failed');
    }
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: (data: { weekId: string; attachmentId: string }) =>
      logbookService.deleteAttachment(data.weekId, data.attachmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['logbook_week', variables.weekId] });
      toast.success('File deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete file');
    }
  });

  return {
    useWeeksQuery,
    useWeekQuery,
    useRecentActivitiesQuery,
    createWeek: createWeekMutation.mutateAsync,
    isCreatingWeek: createWeekMutation.isPending,
    submitDay: submitDayMutation.mutateAsync,
    isSubmittingDay: submitDayMutation.isPending,
    submitWeeklyReport: submitWeeklyReportMutation.mutateAsync,
    isSubmittingReport: submitWeeklyReportMutation.isPending,
    uploadAttachment: uploadAttachmentMutation.mutateAsync,
    isUploadingAttachment: uploadAttachmentMutation.isPending,
    deleteAttachment: deleteAttachmentMutation.mutateAsync,
    isDeletingAttachment: deleteAttachmentMutation.isPending
  };
}
