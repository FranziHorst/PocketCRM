import TodayScreen from '../../../screens/TodayScreen';
import { useCrm } from '@/store';

export default function Today() {
  const { userProfile, tasks } = useCrm();
  return <TodayScreen userProfile={userProfile} tasks={tasks} />;
}
