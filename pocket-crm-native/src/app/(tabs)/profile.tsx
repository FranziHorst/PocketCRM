import { ScrollView } from 'react-native';
import { ProfileView } from '@/components/ProfileView';
import { useCrm } from '@/store';

export default function Profile() {
  const { userProfile } = useCrm();
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <ProfileView key={userProfile.id} />
    </ScrollView>
  );
}
