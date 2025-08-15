import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { BenefitCalculator } from "@/components/benefit/BenefitCalculator";

const ValeCombustivel = () => {
  const [initialBalance, setInitialBalance] = useState(500.00);

  return (
    <Layout>
      <div className="p-6">
        <BenefitCalculator
          title="Cartão Combustível"
          month="2025"
          initialBalance={initialBalance}
          onInitialBalanceChange={setInitialBalance}
          editable={true}
        />
      </div>
    </Layout>
  );
};

export default ValeCombustivel;