import { cn } from '@/lib/utils';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section';
};

export function Container({ children, className, as: Tag = 'div' }: ContainerProps) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full max-w-[var(--container-max)] px-4 sm:px-6 lg:px-10 xl:px-12',
        className
      )}
    >
      {children}
    </Tag>
  );
}
