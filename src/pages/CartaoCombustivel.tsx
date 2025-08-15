import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { BenefitCalculator } from "@/components/benefit/BenefitCalculator";

const ValeCombustivel = () => {
  const [initialBalance, setInitialBalance] = useState(500.00);

<<<<<<< HEAD
export default function CartaoCombustivel() {
  return <div>Cartão Combustível</div>;
}
=======
  return (
    <Layout>
      <div className="p-6">
        <BenefitCalculator
          title="Cartão Combustível"
          month="Janeiro 2024"
          initialBalance={initialBalance}
          onInitialBalanceChange={setInitialBalance}
          editable={true}
        />
      </div>
    </Layout>
  );
};

export default ValeCombustivel;
>>>>>>> 34cea0240ca3ba598c03146761b4feac6cb3d355
