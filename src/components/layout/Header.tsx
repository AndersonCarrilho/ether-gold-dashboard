
import { useEffect, useState } from "react";
import { useEthereum } from "@/hooks/use-ethereum";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { walletState, connectWallet, disconnectWallet, formatAddress, formatEth } = useEthereum();
  const { connected, accounts, balance } = walletState;

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getAccountAvatar = () => {
    if (accounts.length > 0) {
      return accounts[0].substring(2, 4).toUpperCase();
    }
    return "ET";
  };

  return (
    <header className="border-b border-border/50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {currentTime.toLocaleDateString()}{" "}
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {connected && (
            <span className="hidden md:inline-flex items-center gap-1 text-xs text-gold animate-pulse-gold">
              <span className="h-2 w-2 rounded-full bg-gold"></span>
              Connected to Ethereum Mainnet
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {connected ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium gold-gradient">
                  {formatEth(balance)} ETH
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatAddress(accounts[0])}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border border-gold/20">
                      <AvatarFallback className="bg-secondary text-gold">
                        {getAccountAvatar()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <Avatar className="h-8 w-8 border border-gold/20">
                      <AvatarFallback className="bg-secondary text-gold">
                        {getAccountAvatar()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {formatAddress(accounts[0])}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {formatEth(balance)} ETH
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={disconnectWallet}>
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button onClick={connectWallet} className="bg-gold hover:bg-gold-dark text-black">
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
