const [search, setSearch] = useState("");
const filteredBills = bills.filter((bill) =>
  bill.name.toLowerCase().includes(search.toLowerCase())
);

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