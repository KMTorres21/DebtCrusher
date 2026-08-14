import Card from "./Card";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

export default function EmptyState({
  icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <Card className="p-10 text-center">

      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
        {icon}
      </div>

      <h2 className="mt-5 text-2xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-slate-500">
        {description}
      </p>

    </Card>
  );
}
