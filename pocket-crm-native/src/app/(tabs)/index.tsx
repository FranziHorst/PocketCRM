import { ScrollView } from 'react-native';
import { DashboardView } from '@/components/DashboardView';

export default function Dashboard() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <DashboardView />
    </ScrollView>
  );
}
