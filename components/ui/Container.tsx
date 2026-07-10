import { cn } from '@/lib/utils';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section';
};

export function Container({ children, className, as: Tag = 'div' }: ContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full max-w-[var(--container-max)] px-5 md:px-8', className)}>
      {children}
    </Tag>
  );
}
