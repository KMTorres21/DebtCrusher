import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PageContainer({ children }: Props) {
  return (
    <div className="space-y-6 px-5 py-6 pb-32">
      {children}
    </div>
  );
}