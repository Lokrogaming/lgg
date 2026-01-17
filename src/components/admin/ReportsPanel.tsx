import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  useAllReports, 
  useDeleteReport, 
  useUnblockServer, 
  useClearServerReports,
  ServerReport 
} from "@/hooks/useServers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Flag, 
  MoreHorizontal, 
  Trash2, 
  Unlock, 
  Eye, 
  Ban, 
  AlertTriangle,
  Loader2,
  XCircle
} from "lucide-react";
import { format } from "date-fns";

export function ReportsPanel() {
  const { data: reports = [], isLoading } = useAllReports();
  const deleteReport = useDeleteReport();
  const unblockServer = useUnblockServer();
  const clearServerReports = useClearServerReports();
  
  const [deleteConfirm, setDeleteConfirm] = useState<ServerReport | null>(null);
  const [clearConfirm, setClearConfirm] = useState<string | null>(null);

  // Group reports by server
  const reportsByServer = reports.reduce((acc, report) => {
    const serverId = report.server_id;
    if (!acc[serverId]) {
      acc[serverId] = {
        server: report.server,
        reports: [],
        isBlocked: report.server?.is_blocked || false,
      };
    }
    acc[serverId].reports.push(report);
    return acc;
  }, {} as Record<string, { server: ServerReport["server"]; reports: ServerReport[]; isBlocked: boolean }>);

  const serverGroups = Object.values(reportsByServer).sort((a, b) => {
    // Sort blocked servers first, then by report count
    if (a.isBlocked && !b.isBlocked) return -1;
    if (!a.isBlocked && b.isBlocked) return 1;
    return b.reports.length - a.reports.length;
  });

  const totalReports = reports.length;
  const blockedServers = serverGroups.filter(g => g.isBlocked).length;
  const serversWithReports = serverGroups.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="gaming-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/20">
              <Flag className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Reports</p>
              <p className="text-2xl font-bold">{totalReports}</p>
            </div>
          </div>
        </div>
        <div className="gaming-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Servers with Reports</p>
              <p className="text-2xl font-bold">{serversWithReports}</p>
            </div>
          </div>
        </div>
        <div className="gaming-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/20">
              <Ban className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Blocked Servers</p>
              <p className="text-2xl font-bold">{blockedServers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="gaming-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Server</TableHead>
              <TableHead>Reports</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Latest Report</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serverGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <Flag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No reports yet
                </TableCell>
              </TableRow>
            ) : (
              serverGroups.map(({ server, reports: serverReports, isBlocked }) => (
                <TableRow key={server?.id || serverReports[0]?.server_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={server?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {server?.name?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{server?.name || "Unknown Server"}</p>
                        <p className="text-xs text-muted-foreground">
                          {server?.member_count?.toLocaleString() || 0} members
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={serverReports.length >= 5 ? "destructive" : serverReports.length >= 3 ? "default" : "secondary"}
                    >
                      {serverReports.length} report{serverReports.length !== 1 ? "s" : ""}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isBlocked ? (
                      <Badge variant="destructive">
                        <Ban className="h-3 w-3 mr-1" />
                        Blocked
                      </Badge>
                    ) : (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm truncate">
                        {serverReports[0]?.reason || "No reason provided"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {serverReports[0]?.created_at 
                          ? format(new Date(serverReports[0].created_at), "MMM d, yyyy HH:mm")
                          : "Unknown date"
                        }
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/server/${server?.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Server
                          </Link>
                        </DropdownMenuItem>
                        {isBlocked && (
                          <DropdownMenuItem 
                            onClick={() => server?.id && unblockServer.mutate(server.id)}
                          >
                            <Unlock className="mr-2 h-4 w-4" />
                            Unblock Server
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => server?.id && setClearConfirm(server.id)}
                          className="text-warning"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Clear All Reports
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Individual Reports Detail */}
      {serverGroups.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">All Reports</h3>
          <div className="gaming-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Server</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <span className="font-medium">{report.server?.name || "Unknown"}</span>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-md truncate text-sm">
                        {report.reason || "No reason provided"}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(report.created_at), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(report)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Delete Report Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this report. If the server was blocked due to reports, it may need to be manually unblocked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteConfirm) {
                  deleteReport.mutate(deleteConfirm.id);
                  setDeleteConfirm(null);
                }
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Reports Confirmation */}
      <AlertDialog open={!!clearConfirm} onOpenChange={() => setClearConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Reports?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all reports for this server and unblock it if it was blocked. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (clearConfirm) {
                  clearServerReports.mutate(clearConfirm);
                  setClearConfirm(null);
                }
              }}
              className="bg-warning text-warning-foreground"
            >
              Clear Reports
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}