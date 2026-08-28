import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Satellite,
  LogOut,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Radio,
  Globe,
} from "lucide-react";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [satFilter, setSatFilter] = useState<string>("");
  const [stationFilter, setStationFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState("all");

  const passes = useQuery(api.satellitePasses.list, {
    satelliteName: satFilter || undefined,
    groundStation: stationFilter || undefined,
    status: statusFilter || undefined,
  });

  const satellites = useQuery(api.satellitePasses.getUniqueSatellites);
  const stations = useQuery(api.satellitePasses.getUniqueStations);
  const seedAll = useMutation(api.satellitePasses.seedAll);

  // Auto-seed on first load
  useEffect(() => {
    seedAll();
  }, [seedAll]);

  // Tab-based status filtering
  const displayPasses = useMemo(() => {
    if (!passes) return [];
    if (activeTab === "all") return passes;
    return passes.filter((p) => p.status === activeTab);
  }, [passes, activeTab]);

  const scheduledCount = useMemo(
    () => passes?.filter((p) => p.status === "scheduled").length ?? 0,
    [passes]
  );
  const completedCount = useMemo(
    () => passes?.filter((p) => p.status === "completed").length ?? 0,
    [passes]
  );
  const missedCount = useMemo(
    () => passes?.filter((p) => p.status === "missed").length ?? 0,
    [passes]
  );

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const timeUntil = (ts: number) => {
    const diff = ts - Date.now();
    if (diff < 0) return "Passed";
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `in ${days}d ${hours % 24}h`;
    }
    return `in ${hours}h ${mins}m`;
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="size-3" />;
      case "completed":
        return <CheckCircle2 className="size-3" />;
      case "missed":
        return <XCircle className="size-3" />;
      default:
        return null;
    }
  };

  const statusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "scheduled":
        return "default";
      case "completed":
        return "secondary";
      case "missed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const priorityDot = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-400";
      case "medium":
        return "bg-amber-400";
      case "low":
        return "bg-emerald-400";
      default:
        return "bg-muted-foreground";
    }
  };

  return (
    <main className="min-h-screen bg-background bg-grid">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Satellite className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">
                satQuery
              </h1>
              <p className="text-[11px] text-muted-foreground">
                Mission Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
              Live
            </div>
            <div className="text-right">
              <p className="text-xs font-medium">{user?.name ?? "Operator"}</p>
              <p className="text-[11px] text-muted-foreground">
                {user?.email ?? ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total Passes"
            value={passes?.length ?? "—"}
            icon={<Globe className="size-4" />}
          />
          <StatCard
            label="Scheduled"
            value={scheduledCount}
            icon={<Clock className="size-4" />}
            accent="text-emerald-400"
          />
          <StatCard
            label="Completed"
            value={completedCount}
            icon={<CheckCircle2 className="size-4" />}
            accent="text-sky-400"
          />
          <StatCard
            label="Missed"
            value={missedCount}
            icon={<XCircle className="size-4" />}
            accent="text-red-400"
          />
        </div>

        {/* Pass Table Card */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Radio className="size-4 text-primary" />
                Satellite Passes
              </CardTitle>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Filter className="size-3" />
                  Filters
                </div>

                <Select
                  value={satFilter}
                  onValueChange={(v) => setSatFilter(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="h-8 w-auto text-xs" size="sm">
                    <SelectValue placeholder="Satellite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Satellites</SelectItem>
                    {satellites?.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={stationFilter}
                  onValueChange={(v) => setStationFilter(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="h-8 w-auto text-xs" size="sm">
                    <SelectValue placeholder="Station" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stations</SelectItem>
                    {stations?.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="h-8 w-auto text-xs" size="sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="px-6"
            >
              <TabsList className="mb-0 h-9">
                <TabsTrigger value="all" className="text-xs">
                  All
                  <span className="ml-1 text-muted-foreground">
                    {passes?.length ?? 0}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="scheduled" className="text-xs">
                  Scheduled
                  <span className="ml-1 text-muted-foreground">
                    {scheduledCount}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-xs">
                  Completed
                  <span className="ml-1 text-muted-foreground">
                    {completedCount}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="missed" className="text-xs">
                  Missed
                  <span className="ml-1 text-muted-foreground">
                    {missedCount}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mt-2 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Priority
                    </TableHead>
                    <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Satellite
                    </TableHead>
                    <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      NORAD ID
                    </TableHead>
                    <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Ground Station
                    </TableHead>
                    <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Pass Time
                    </TableHead>
                    <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      ETA
                    </TableHead>
                    <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Duration
                    </TableHead>
                    <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Max Elev.
                    </TableHead>
                    <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Azimuth
                    </TableHead>
                    <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!passes ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="h-32 text-center text-muted-foreground"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <AlertTriangle className="size-4 animate-pulse" />
                          Loading passes…
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : displayPasses.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="h-32 text-center text-muted-foreground"
                      >
                        No passes match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayPasses.map((pass) => (
                      <TableRow
                        key={pass._id}
                        className="border-border/30 transition-colors hover:bg-muted/30"
                      >
                        <TableCell>
                          <span
                            className={`inline-block size-2 rounded-full ${priorityDot(pass.priority)}`}
                            title={`${pass.priority} priority`}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-foreground/90">
                          {pass.satelliteName}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {pass.noradId}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {pass.groundStation}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatTime(pass.passTime)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {timeUntil(pass.passTime)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {pass.durationMin} min
                        </TableCell>
                        <TableCell className="text-xs">
                          {pass.maxElevation}°
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {pass.azimuth}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusVariant(pass.status)}
                            className="gap-1 text-[11px] capitalize"
                          >
                            {statusIcon(pass.status)}
                            {pass.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/60 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className={accent ?? ""}>{icon}</span>
        <span className="text-[11px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${accent ?? ""}`}>
        {value}
      </p>
    </div>
  );
}
