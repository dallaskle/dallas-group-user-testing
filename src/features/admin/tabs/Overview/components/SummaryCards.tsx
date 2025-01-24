import { Card } from "@/components/ui/card"

interface SummaryCardsProps {
  projectRegistriesCount: number
  totalProjectsCount: number
  pendingValidationsCount: number
  pendingTestsCount: number
  totalTestersCount: number
}

export const SummaryCards = ({
  projectRegistriesCount,
  totalProjectsCount,
  pendingValidationsCount,
  pendingTestsCount,
  totalTestersCount
}: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card className="p-4">
        <h3 className="font-semibold text-sm text-muted-foreground">Project Registries</h3>
        <div className="text-2xl font-bold mt-2">{projectRegistriesCount}</div>
      </Card>
      
      <Card className="p-4">
        <h3 className="font-semibold text-sm text-muted-foreground">Total Projects</h3>
        <div className="text-2xl font-bold mt-2">{totalProjectsCount}</div>
      </Card>
      
      <Card className="p-4">
        <h3 className="font-semibold text-sm text-muted-foreground">Pending Validations</h3>
        <div className="text-2xl font-bold mt-2">{pendingValidationsCount}</div>
      </Card>
      
      <Card className="p-4">
        <h3 className="font-semibold text-sm text-muted-foreground">Pending Tests</h3>
        <div className="text-2xl font-bold mt-2">{pendingTestsCount}</div>
      </Card>
      
      <Card className="p-4">
        <h3 className="font-semibold text-sm text-muted-foreground">Total Testers</h3>
        <div className="text-2xl font-bold mt-2">{totalTestersCount}</div>
      </Card>
    </div>
  )
} 