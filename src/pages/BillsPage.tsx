export default function BillsPage() {
  const { bills, addBill, deleteBill, togglePaid } = useBills();
 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
 
  return (
    <>
      <BillList
        bills={bills}
        onTogglePaid={togglePaid}
        onDelete={deleteBill}
        onEdit={(bill) => {
          // We'll implement this later
        }}
      />
 
      <FloatingActionButton
        onClick={() => setIsAddModalOpen(true)}
      />
 
      <AddBillModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addBill}
      />
    </>
  );
}
