import ProfileView from './ProfileView';
import './profile.css';

export const metadata = {
  title: 'Profile | NETZ',
  description: 'Your streak, gems, medals and today\'s tasks in NETZ.',
};

export default function ProfilePage() {
  return <ProfileView />;
}
