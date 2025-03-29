import { ReactNode } from 'react';

type UsesItemGridProps = {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
};

const UsesItemGrid = ({
  children,
  columns = 1,
  className = '',
}: UsesItemGridProps) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={`grid gap-6 ${gridCols[columns]} ${className}`}>
      {children}
    </div>
  );
};

export default UsesItemGrid;
