import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendance.service';
import toast from 'react-hot-toast';

export function useAttendance(studentId?: string) {
  const queryClient = useQueryClient();

  const useHistoryQuery = (sId: string) => useQuery({
    queryKey: ['attendance_history', sId],
    queryFn: () => attendanceService.getAttendanceHistory(sId),
    enabled: !!sId
  });

  const useStatusQuery = (sId: string) => useQuery({
    queryKey: ['attendance_today_status', sId],
    queryFn: () => attendanceService.getTodayStatus(sId),
    enabled: !!sId
  });

  const checkInMutation = useMutation({
    mutationFn: (data: { lat: number; lng: number; address: string }) =>
      attendanceService.checkIn(studentId || '', data.lat, data.lng, data.address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_history', studentId] });
      queryClient.invalidateQueries({ queryKey: ['attendance_today_status', studentId] });
      toast.success('Successfully checked in for today!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Check-in failed');
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: (data: { lat: number; lng: number; address: string }) =>
      attendanceService.checkOut(studentId || '', data.lat, data.lng, data.address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_history', studentId] });
      queryClient.invalidateQueries({ queryKey: ['attendance_today_status', studentId] });
      toast.success('Successfully checked out for today. Have a good evening!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Check-out failed');
    }
  });

  return {
    useHistoryQuery,
    useStatusQuery,
    checkIn: checkInMutation.mutateAsync,
    isCheckingIn: checkInMutation.isPending,
    checkOut: checkOutMutation.mutateAsync,
    isCheckingOut: checkOutMutation.isPending
  };
}
