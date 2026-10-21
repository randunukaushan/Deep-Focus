import { Redirect, useLocalSearchParams } from 'expo-router';

export default function AnalyticsSessionAlias() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  return <Redirect href={{ pathname: '/progress/history/[sessionId]', params: { sessionId } }} />;
}
