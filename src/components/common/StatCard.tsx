import Card from "./Card";

interface StatCardProps {
  title: string;
  value: string | number;
  valueClassName?: string;
}

export default function StatCard({
  title,
  value,
  valueClassName = "",
}: StatCardProps) {
  return (
    <Card>
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className={`mt-2 text-2xl font-bold ${valueClassName}`}>
        {value}
      </p>
    </Card>
  );
}