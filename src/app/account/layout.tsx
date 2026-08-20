import { AccountNav } from "./account-nav";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <AccountNav />
      {children}
    </div>
  );
}
