
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Calendar, Instagram } from "lucide-react";

interface DashboardFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (value: string) => void;
  accountFilter: string;
  onAccountChange: (value: string) => void;
  accounts: Array<{ id: string; name: string }>;
  isInMVPMode: boolean;
}

const DashboardFilters = ({
  searchTerm,
  onSearchChange,
  dateFilter,
  onDateChange,
  accountFilter,
  onAccountChange,
  accounts,
  isInMVPMode,
}: DashboardFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filtros</CardTitle>
        <CardDescription>
          {isInMVPMode 
            ? "Filtre suas automações de teste por nome ou data"
            : "Filtre suas automações por conta, nome ou data"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search by name */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome da automação..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Account filter (only in normal mode) */}
          {!isInMVPMode && (
            <div className="sm:w-48">
              <Select value={accountFilter} onValueChange={onAccountChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as contas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as contas</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date filter */}
          <div className="sm:w-48">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => onDateChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardFilters;
