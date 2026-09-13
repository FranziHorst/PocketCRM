import { ProfileView } from '@/components/ProfileView';
import { Screen } from '@/components/ui';
import { useCrm } from '@/store';

export default function Profile() {
  const { userProfile } = useCrm();
  return (
    <Screen>
      <ProfileView key={userProfile.id} />
    </Screen>
  );
}
