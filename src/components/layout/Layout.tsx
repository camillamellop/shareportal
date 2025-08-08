import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { RightSidebar } from "./RightSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 min-h-0 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}