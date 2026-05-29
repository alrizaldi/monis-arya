'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema for payer form validation
const payerSchema = z.object({
  payerName: z.string().min(1, 'Payer Name is required'),
});

type PayerFormValues = z.infer<typeof payerSchema>;

// Mock data for demonstration
const mockPayers = [
  { id: '1', payerName: 'BPJS Kesehatan' },
  { id: '2', payerName: 'Asuransi Swasta A' },
  { id: '3', payerName: 'Asuransi Swasta B' },
];

export default function PayersPage() {
  const [payers, setPayers] = useState(mockPayers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayer, setEditingPayer] = useState<any>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PayerFormValues>({
    resolver: zodResolver(payerSchema),
  });

  const onSubmit = (data: PayerFormValues) => {
    if (editingPayer) {
      // Update existing payer
      setPayers(payers.map(p => 
        p.id === editingPayer.id ? { ...p, ...data } : p
      ));
    } else {
      // Add new payer
      const newPayer = {
        id: (payers.length + 1).toString(),
        ...data
      };
      setPayers([...payers, newPayer]);
    }
    
    reset();
    setIsDialogOpen(false);
    setEditingPayer(null);
  };

  const handleEdit = (payer: any) => {
    setEditingPayer(payer);
    reset(payer);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPayers(payers.filter(p => p.id !== id));
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payers</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingPayer(null);
                reset();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingPayer ? 'Edit Payer' : 'Add New Payer'}</DialogTitle>
              <DialogDescription>
                {editingPayer 
                  ? 'Update payer information' 
                  : 'Enter payer information to add a new payer'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="payerName" className="text-right">
                    Payer Name
                  </Label>
                  <Input
                    id="payerName"
                    className="col-span-3"
                    {...register('payerName')}
                  />
                  {errors.payerName && (
                    <p className="col-start-2 col-span-3 text-red-500 text-sm">
                      {errors.payerName.message}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingPayer ? 'Update Payer' : 'Add Payer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payer Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payers.map((payer) => (
              <TableRow key={payer.id}>
                <TableCell className="font-medium">{payer.payerName}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(payer)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(payer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}