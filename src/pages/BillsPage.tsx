import { useState } from "react";
import { Plus } from "lucide-react";

function BillsPage() {
  const [search, setSearch] = useState("");

  const filteredBills = bills.filter((bill) =>
    bill.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search bills..."
        className="w-full rounded-xl border p-3 mb-4"
      />

      <div className="space-y-4">
        {filteredBills.map((bill) => (
          <BillCard
            key={bill.id}
            bill={bill}
            onTogglePaid={togglePaid}
            onEdit={handleEdit}
            onDelete={deleteBill}
          />
        ))}
      </div>

      <Button className="fixed bottom-24 right-6 rounded-full w-16 h-16">
        <Plus size={32} />
      </Button>
    </>
  );
}

export default BillsPage;
