import ContactsScreen from '../../../screens/ContactsScreen';
import { useCrm } from '@/store';

export default function Contacts() {
  const { contacts } = useCrm();
  return <ContactsScreen contacts={contacts} />;
}
