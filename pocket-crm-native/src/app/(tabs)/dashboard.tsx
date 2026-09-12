import DashboardScreen from '../../../screens/DashboardScreen';
import { useCrm } from '@/store';

export default function Dashboard() {
  const { userProfile, contacts, tasks, notifications } = useCrm();
  return (
    <DashboardScreen
      userProfile={userProfile}
      contacts={contacts}
      tasks={tasks}
      notifications={notifications}
    />
  );
}
