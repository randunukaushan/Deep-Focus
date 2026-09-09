import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { RoutePlaceholder } from '@/components/route-placeholder';
import { loadActiveSession } from '@/features/focus/session-storage';

export default function SessionRecoveryRoute() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    loadActiveSession().then((session) => {
      if (session) router.replace({ pathname: '/focus/session', params: { durationMinutes: String(session.plannedDurationSeconds / 60), taskName: session.taskName ?? '' } });
      else setChecked(true);
    });
  }, [router]);
  if (!checked) return <RoutePlaceholder title="Checking for an interrupted session" description="Restoring your latest focus session safely." />;
  return <RoutePlaceholder title="No interrupted session" description="There is no active focus session waiting to be recovered." actions={[{ label: 'Start a New Session', href: '/focus/setup' }, { label: 'Return Home', href: '/(tabs)/home', variant: 'secondary' }]} />;
}
