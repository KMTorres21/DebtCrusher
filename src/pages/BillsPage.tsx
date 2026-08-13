const [search, setSearch] = useState("");
 
const filteredBills = bills.filter((bill) =>
  bill.name.toLowerCase().includes(search.toLowerCase())
);

<input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Search bills..."
  className="w-full rounded-xl border p-3 mb-4"
/>

return (
  <div className="space-y-4">
    {bills.map((bill) => (
      <BillCard
        key={bill.id}
        bill={bill}
        onTogglePaid={togglePaid}
        onEdit={handleEdit}
        onDelete={deleteBill}
      />
    ))}
  </div>
);
