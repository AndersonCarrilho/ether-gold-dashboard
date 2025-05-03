
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  Wallet,
  Send,
  Download,
  Activity,
  CreditCard,
  Settings,
  Home,
  ArrowUpRight,
  AreaChart,
  Coins,
  HardDrive,
  FileText,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Send",
    href: "/send",
    icon: ArrowUpRight,
  },
  {
    title: "Receive",
    href: "/receive",
    icon: Download,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: AreaChart,
  },
  {
    title: "Tokens",
    href: "/tokens",
    icon: Coins,
  },
  {
    title: "FIN MT Messages",
    href: "/fin-mt",
    icon: FileText,
  },
  {
    title: "Hardhat Sim",
    href: "/hardhat",
    icon: HardDrive,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <ShadcnSidebar className="border-r border-border/50 bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center justify-center border-b border-border/50">
          <SidebarTrigger className="h-6 w-6 text-gold" />
          <h1 className="font-bold text-xl ml-3 gold-gradient">EtherGold</h1>
        </div>

        <SidebarContent className="py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="px-6 text-gold-light">
              Dashboard
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.href)}
                      className={`${
                        location.pathname === item.href
                          ? "bg-gold/10 text-gold"
                          : "hover:bg-secondary/50 hover:text-gold-light"
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-2" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </ShadcnSidebar>
    </>
  );
};

export default Sidebar;
