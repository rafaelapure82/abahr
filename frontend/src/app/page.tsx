import { redirect } from 'next/navigation';

export default function Home() {
  // Redirección automática a la página de login
  redirect('/auth/login');
}
