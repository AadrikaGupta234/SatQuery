import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.svg";
import { Home } from "lucide-react";
import { useNavigate } from "react-router";

export function LogoDropdown() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          aria-label="Open SatQuery menu"
        >
          <img
            src={logo}
            alt="SatQuery"
            width={32}
            height={32}
            className="rounded-lg"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem
          onClick={handleGoHome}
          className="cursor-pointer"
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
