import { useProjectRegistry } from '../../store/projectRegistry.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteConfirmation } from '../shared/DeleteConfirmation'
import { RegistryDialog } from './RegistryDialog'
import { FeatureDialog } from './FeatureDialog'

export const FeatureList = () => {
  const { selectedRegistry, deleteRegistry, deleteFeature } = useProjectRegistry()

  if (!selectedRegistry) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Select a project registry to view its features
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{selectedRegistry.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedRegistry.description}
              </p>
            </div>
            <div className="flex gap-2">
              <RegistryDialog
                mode="edit"
                registry={selectedRegistry}
                trigger={
                  <Button variant="outline" size="sm">
                    <Pencil1Icon className="h-4 w-4" />
                  </Button>
                }
              />
              <DeleteConfirmation
                title="Delete Project Registry"
                description={`Are you sure you want to delete "${selectedRegistry.name}"? This action cannot be undone and will remove all features associated with this registry.`}
                onConfirm={() => deleteRegistry(selectedRegistry.id)}
                trigger={
                  <Button variant="outline" size="sm">
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Features</h3>
        <FeatureDialog
          mode="create"
          registryId={selectedRegistry.id}
          trigger={
            <Button size="sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          }
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Required</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedRegistry.features.map((feature) => (
                <TableRow key={feature.id}>
                  <TableCell className="font-medium">
                    {feature.name}
                  </TableCell>
                  <TableCell>
                    {feature.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant={feature.is_required ? "default" : "secondary"}>
                      {feature.is_required ? "Required" : "Optional"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <FeatureDialog
                        mode="edit"
                        feature={feature}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <Pencil1Icon className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DeleteConfirmation
                        title="Delete Feature"
                        description={`Are you sure you want to delete "${feature.name}"? This action cannot be undone.`}
                        onConfirm={() => deleteFeature(feature.id)}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {selectedRegistry.features.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No features added yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 