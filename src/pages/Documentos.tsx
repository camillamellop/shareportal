import { Layout } from "@/components/layout/Layout";
import { DocumentManager } from "@/components/documents/DocumentManager";

export default function Documentos() {
  return (
    <Layout>
      <div className="p-6">
        <DocumentManager />
      </div>
    </Layout>
  );
}