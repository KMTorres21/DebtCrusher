interface StatCardProps {
  title: string;
  value: string | number;
}
 
export default function StatCard({ title, value }: StatCardProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
        flex: 1,
        minWidth: "160px",
      }}
    >
      <div
        style={{
          fontSize: "0.9rem",
          color: "#666",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>
 
      <div
        style={{
          fontSize: "1.6rem",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}
