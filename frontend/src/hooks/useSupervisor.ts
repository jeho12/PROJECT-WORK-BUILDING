import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supervisorService } from '@/services/supervisor.service';
import toast from 'react-hot-toast';

export function useSupervisor(supervisorId?: string) {
  const queryClient = useQueryClient();

  const useStudentsQuery = (supId: string) => useQuery({
    queryKey: ['supervisor_students', supId],
    queryFn: () => supervisorService.getStudents(supId),
    enabled: !!supId
  });

  const useStudentDetailQuery = (studentId: string) => useQuery({
    queryKey: ['supervisor_student_detail', studentId],
    queryFn: () => supervisorService.getStudentDetail(studentId),
    enabled: !!studentId
  });

  const reviewWeekMutation = useMutation({
    mutationFn: (data: { weekId: string; status: 'approved' | 'rejected'; comment: string; signature: string; rank: string }) =>
      supervisorService.reviewWeek(data.weekId, {
        status: data.status,
        comment: data.comment,
        signature: data.signature,
        rank: data.rank
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['logbook_week', data.id] });
      queryClient.invalidateQueries({ queryKey: ['logbook_weeks', data.studentId] });
      queryClient.invalidateQueries({ queryKey: ['supervisor_students', supervisorId] });
      queryClient.invalidateQueries({ queryKey: ['supervisor_student_detail', data.studentId] });
      toast.success(`Logbook Week ${data.weekNumber} successfully ${data.status}!`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit logbook review');
    }
  });

  return {
    useStudentsQuery,
    useStudentDetailQuery,
    reviewWeek: reviewWeekMutation.mutateAsync,
    isReviewing: reviewWeekMutation.isPending
  };
}
