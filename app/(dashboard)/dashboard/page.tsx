import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const metrics = [
  { label: "MRR", value: "$8,420", change: "+12.5%" },
  { label: "Users", value: "1,284", change: "+8.2%" },
  { label: "Active subs", value: "342", change: "+4.1%" },
  { label: "Churn", value: "2.3%", change: "-0.4%" },
];

const activity = [
  { user: "Jane Cooper", action: "Upgraded to Pro", time: "2 min ago", status: "success" },
  { user: "Robert Fox", action: "Invited team member", time: "15 min ago", status: "default" },
  { user: "Esther Howard", action: "Cancelled subscription", time: "1 hr ago", status: "warning" },
  { user: "Cameron Williamson", action: "Updated billing info", time: "3 hr ago", status: "default" },
  { user: "Brooklyn Simmons", action: "Signed up", time: "5 hr ago", status: "success" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Your organization at a glance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {metric.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">{metric.change}</span> vs last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Monthly recurring revenue trend</CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Latest events across your organization</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                  <th className="px-6 py-3 font-medium">Time</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((row) => (
                  <tr key={`${row.user}-${row.time}`} className="border-b border-border last:border-0">
                    <td className="px-6 py-3 font-medium">{row.user}</td>
                    <td className="px-6 py-3 text-muted-foreground">{row.action}</td>
                    <td className="px-6 py-3 text-muted-foreground">{row.time}</td>
                    <td className="px-6 py-3">
                      <Badge
                        variant={
                          row.status === "success"
                            ? "success"
                            : row.status === "warning"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
