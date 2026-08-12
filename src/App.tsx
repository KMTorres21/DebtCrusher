import BillForm from "./components/bills/BillForm";
import BillList from "./components/bills/BillList";
import { useBills } from "./hooks/useBills";

export default function App() {
  const {
    bills,
    addBill,
    deleteBill,
    togglePaid,
  } = useBills();

  const totalBills = bills.length;
  const unpaidBills = bills.filter((b) => !b.paid).length;
  const totalAmount = bills
    .filter((b) => !b.paid)
    .reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-xl mx-auto p-4">

        <h1 className="text-4xl font-bold text-center mb-2">
          💰 DebtCrusher
        </h1>

        <p className="text-center text-gray-600 mb-6">
          Crush debt. Take control.
        </p>

        {/* Dashboard */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Dashboard
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Bills</span>
              <strong>{totalBills}</strong>
            </div>

            <div className="flex justify-between">
              <span>Unpaid Bills</span>
              <strong>{unpaidBills}</strong>
            </div>

            <div className="flex justify-between">
              <span>Total Due</span>
              <strong>${totalAmount.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Add Bill */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Add Bill
          </h2>

          <BillForm onSave={addBill} />
        </div>

        {/* Bills */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-xl font-semibold mb-4">
            Bills
          </h2>

          <BillList
            bills={bills}
            onTogglePaid={togglePaid}
            onDelete={deleteBill}
          />
        </div>

      </div>
    </div>
  );
}