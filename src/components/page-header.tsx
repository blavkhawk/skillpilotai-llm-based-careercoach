import { UserMenu } from './user-menu';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl text-primary text-glow">
          {title}
        </h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <UserMenu />
    </div>
  );
}
