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

// Define schema for room form validation
const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room Number is required'),
  bedNumber: z.number().min(1, 'Bed Number is required'),
  roomClass: z.string().min(1, 'Room Class is required'),
});

type RoomFormValues = z.infer<typeof roomSchema>;

// Mock data for demonstration
const mockRooms = [
  { id: '1', roomNumber: '101', bedNumber: 1, roomClass: 'VIP' },
  { id: '2', roomNumber: '102', bedNumber: 2, roomClass: 'Regular' },
  { id: '3', roomNumber: '201', bedNumber: 1, roomClass: 'ICU' },
];

export default function RoomsPage() {
  const [rooms, setRooms] = useState(mockRooms);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
  });

  const onSubmit = (data: RoomFormValues) => {
    if (editingRoom) {
      // Update existing room
      setRooms(rooms.map(r => 
        r.id === editingRoom.id ? { ...r, ...data } : r
      ));
    } else {
      // Add new room
      const newRoom = {
        id: (rooms.length + 1).toString(),
        ...data
      };
      setRooms([...rooms, newRoom]);
    }
    
    reset();
    setIsDialogOpen(false);
    setEditingRoom(null);
  };

  const handleEdit = (room: any) => {
    setEditingRoom(room);
    // Need to convert bedNumber to number for the form
    setValue('roomNumber', room.roomNumber);
    setValue('bedNumber', room.bedNumber);
    setValue('roomClass', room.roomClass);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setRooms(rooms.filter(r => r.id !== id));
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rooms</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingRoom(null);
                reset();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
              <DialogDescription>
                {editingRoom 
                  ? 'Update room information' 
                  : 'Enter room information to add a new room'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="roomNumber" className="text-right">
                    Room Number
                  </Label>
                  <Input
                    id="roomNumber"
                    className="col-span-3"
                    {...register('roomNumber')}
                  />
                  {errors.roomNumber && (
                    <p className="col-start-2 col-span-3 text-red-500 text-sm">
                      {errors.roomNumber.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bedNumber" className="text-right">
                    Bed Number
                  </Label>
                  <Input
                    id="bedNumber"
                    type="number"
                    className="col-span-3"
                    {...register('bedNumber', { valueAsNumber: true })}
                  />
                  {errors.bedNumber && (
                    <p className="col-start-2 col-span-3 text-red-500 text-sm">
                      {errors.bedNumber.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="roomClass" className="text-right">
                    Room Class
                  </Label>
                  <select
                    id="roomClass"
                    className="col-span-3 border rounded-md px-3 py-2"
                    {...register('roomClass')}
                  >
                    <option value="">Select Room Class</option>
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                    <option value="ICU">ICU</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                  {errors.roomClass && (
                    <p className="col-start-2 col-span-3 text-red-500 text-sm">
                      {errors.roomClass.message}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingRoom ? 'Update Room' : 'Add Room'}
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
              <TableHead>Room Number</TableHead>
              <TableHead>Bed Number</TableHead>
              <TableHead>Room Class</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-medium">{room.roomNumber}</TableCell>
                <TableCell>{room.bedNumber}</TableCell>
                <TableCell>{room.roomClass}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(room)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(room.id)}
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