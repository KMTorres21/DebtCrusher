import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PageContainer({ children }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {children}
    </div>
  );
}