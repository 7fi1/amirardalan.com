import Nav from '@/components/ui/Navigation';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  return (
    <footer className="flex flex-row py-6 text-sm text-zinc-500 lg:py-8 dark:text-zinc-400">
      <div className="mr-6 flex flex-row items-center">
        <span className="mr-4">&copy;{new Date().getFullYear()}</span>
        <Logo size={20} /> <span className="ml-4">Amir Ardalan</span>
      </div>
      <span>•</span>
      <div className="ml-6">
        <Nav />
      </div>
    </footer>
  );
}
