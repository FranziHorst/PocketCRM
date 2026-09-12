import ProfileScreen from '../../../screens/ProfileScreen';
import { useCrm } from '@/store';

export default function Profile() {
  const { userProfile } = useCrm();
  return <ProfileScreen userProfile={userProfile} />;
}
