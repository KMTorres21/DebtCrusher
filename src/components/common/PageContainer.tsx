import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export default function PageContainer({
  children,
}: PageContainerProps) {
  return (
    <div className="space-y-6 px-5 py-6 pb-32">
      {children}
    </div>
  );
}