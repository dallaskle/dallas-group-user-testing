import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjectRegistry } from '../../store/projectRegistry.store'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@radix-ui/react-icons'
import { RegistryDialog } from './RegistryDialog'

export const RegistryList = () => {
  const { registries, isLoading, selectedRegistry, fetchRegistries, selectRegistry } = useProjectRegistry()

  useEffect(() => {
    fetchRegistries()
  }, [fetchRegistries])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="cursor-pointer">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Registries</h2>
        <RegistryDialog
          mode="create"
          trigger={
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Registry
            </Button>
          }
        />
      </div>

      <div className="grid gap-4">
        {registries.map((registry) => (
          <Card 
            key={registry.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedRegistry?.id === registry.id ? 'border-primary' : ''
            }`}
            onClick={() => selectRegistry(registry)}
          >
            <CardHeader>
              <CardTitle>{registry.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {registry.description}
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {registry.features.length} Features
                </Badge>
                <Badge variant="secondary">
                  {registry.projectCount} Projects
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {registries.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No project registries found. Create one to get started.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 