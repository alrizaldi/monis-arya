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
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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

// Define Room type
type Room = {
  id: string;
  roomNumber: string;
  bedNumber: number;
  roomClass: string;
  createdAt: Date;
  updatedAt: Date;
};

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    roomNumber: '',
    roomClass: '',
    bedNumber: ''
  });
  
  // Temporary filter values for input fields
  const [tempFilters, setTempFilters] = useState({
    roomNumber: '',
    roomClass: '',
    bedNumber: ''
  });
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
  });

  // Load rooms from API with pagination and filters
  useEffect(() => {
    const loadRooms = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });
        
        if (filters.roomNumber) {
          queryParams.append('roomNumber', filters.roomNumber);
        }
        if (filters.roomClass) {
          queryParams.append('roomClass', filters.roomClass);
        }
        if (filters.bedNumber) {
          queryParams.append('bedNumber', filters.bedNumber);
        }

        const response = await fetch(`/api/rooms?${queryParams}`);
        if (!response.ok) {
          throw new Error('Failed to fetch rooms');
        }
        const result: PaginatedResult<Room> = await response.json();
        
        setRooms(result.data);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: result.limit
        });
      } catch (error) {
        console.error("Error loading rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [pagination.page, filters]);

  const onSubmit = async (data: RoomFormValues) => {
    try {
      console.log("Saving room:", data);
      let response;
      
      if (editingRoom) {
        // Update existing room
        response = await fetch(`/api/rooms/${editingRoom.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomNumber: data.roomNumber,
            bedNumber: data.bedNumber,
            roomClass: data.roomClass
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update room');
        }
        
        // Refresh the room list after update
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });
        
        if (filters.roomNumber) {
          queryParams.append('roomNumber', filters.roomNumber);
        }
        if (filters.roomClass) {
          queryParams.append('roomClass', filters.roomClass);
        }
        if (filters.bedNumber) {
          queryParams.append('bedNumber', filters.bedNumber);
        }

        const refreshResponse = await fetch(`/api/rooms?${queryParams}`);
        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh rooms');
        }
        const result: PaginatedResult<Room> = await refreshResponse.json();
        
        setRooms(result.data);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: result.limit
        });
      } else {
        // Add new room
        response = await fetch('/api/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomNumber: data.roomNumber,
            bedNumber: data.bedNumber,
            roomClass: data.roomClass
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create room');
        }
        
        // Refresh the room list after adding
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });
        
        if (filters.roomNumber) {
          queryParams.append('roomNumber', filters.roomNumber);
        }
        if (filters.roomClass) {
          queryParams.append('roomClass', filters.roomClass);
        }
        if (filters.bedNumber) {
          queryParams.append('bedNumber', filters.bedNumber);
        }

        const refreshResponse = await fetch(`/api/rooms?${queryParams}`);
        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh rooms');
        }
        const result: PaginatedResult<Room> = await refreshResponse.json();
        
        setRooms(result.data);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: result.limit
        });
      }

      reset();
      setIsDialogOpen(false);
      setEditingRoom(null);
    } catch (error) {
      console.error("Error saving room:", error);
      alert(
        error instanceof Error
          ? error.message
          : "An error occurred while saving the room",
      );
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setValue('roomNumber', room.roomNumber);
    setValue('bedNumber', room.bedNumber);
    setValue('roomClass', room.roomClass);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        const response = await fetch(`/api/rooms/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete room');
        }
        
        // Refresh the room list after deletion
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });
        
        if (filters.roomNumber) {
          queryParams.append('roomNumber', filters.roomNumber);
        }
        if (filters.roomClass) {
          queryParams.append('roomClass', filters.roomClass);
        }
        if (filters.bedNumber) {
          queryParams.append('bedNumber', filters.bedNumber);
        }

        const refreshResponse = await fetch(`/api/rooms?${queryParams}`);
        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh rooms');
        }
        const result: PaginatedResult<Room> = await refreshResponse.json();
        
        setRooms(result.data);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: result.limit
        });
      } catch (error) {
        console.error("Error deleting room:", error);
        alert("An error occurred while deleting the room");
      }
    }
  };

  const handleFilterChange = (field: keyof typeof tempFilters, value: string) => {
    setTempFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    // Apply temporary filters to actual filters
    setFilters(tempFilters);
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handleClearFilters = () => {
    // Clear all filters
    setTempFilters({
      roomNumber: '',
      roomClass: '',
      bedNumber: ''
    });
    setFilters({
      roomNumber: '',
      roomClass: '',
      bedNumber: ''
    });
    // Reset to first page
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-screen">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Rooms</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingRoom(null);
                  reset();
                }}
                className="w-full sm:w-auto"
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
      </div>

      {/* Filters - with button approach */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="filter-room-number">Room Number</Label>
            <div className="relative mt-1">
              <Input
                id="filter-room-number"
                placeholder="Filter by Room Number"
                value={tempFilters.roomNumber}
                onChange={(e) => handleFilterChange('roomNumber', e.target.value)}
                className="pl-10 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="filter-room-class">Room Class</Label>
            <select
              id="filter-room-class"
              value={tempFilters.roomClass}
              onChange={(e) => handleFilterChange('roomClass', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Classes</option>
              <option value="Regular">Regular</option>
              <option value="VIP">VIP</option>
              <option value="ICU">ICU</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="filter-bed-number">Bed Number</Label>
            <Input
              id="filter-bed-number"
              type="number"
              placeholder="Filter by Bed Number"
              value={tempFilters.bedNumber}
              onChange={(e) => handleFilterChange('bedNumber', e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-2 mt-4">
          <Button 
            type="button" 
            onClick={handleApplyFilters}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Search className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </div>
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
            {rooms.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-gray-500"
                >
                  No rooms found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-medium">{pagination.total}</span> results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                let pageNum;
                
                if (pagination.totalPages <= 5) {
                  // Show all pages if total pages is 5 or less
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  // Show first 5 pages if current page is near the beginning
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  // Show last 5 pages if current page is near the end
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  // Show 2 pages before and after current page
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={pagination.page === pageNum ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}