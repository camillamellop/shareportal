import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { BenefitCalculator } from "@/components/benefit/BenefitCalculator";

const ValeAlimentacao = () => {
  const [initialBalance, setInitialBalance] = useState(500.00);

  return (
    <Layout>
      <div className="p-6">
        <BenefitCalculator
          title="Vale Alimentação"
          month="Janeiro 2024"
          initialBalance={initialBalance}
          onInitialBalanceChange={setInitialBalance}
          editable={true}
        />
      </div>
    </Layout>
  );
};

export default ValeAlimentacao;