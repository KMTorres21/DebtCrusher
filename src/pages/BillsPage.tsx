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
