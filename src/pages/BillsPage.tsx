import { useBills } from "../hooks/useBills";

export default function BillsPage() {
  const { bills } = useBills();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Bills</h1>

      {bills.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">
            No bills yet
          </h2>

          <p className="text-gray-500">
            Add your first bill to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="bg-white rounded-xl shadow p-4"
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="font-semibold">
                    {bill.name}
                  </h2>

                  <p className="text-gray-500">
                    Due {bill.dueDate}
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-bold">
                    ${bill.amount.toFixed(2)}
                  </div>

                  <div
                    className={
                      bill.paid
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {bill.paid ? "Paid" : "Unpaid"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}