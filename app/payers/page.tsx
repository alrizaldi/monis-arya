"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as XLSX from "xlsx";

// Define schema for payer form validation
const payerSchema = z.object({
  payerName: z.string().min(1, "Payer Name is required"),
});

type PayerFormValues = z.infer<typeof payerSchema>;

// Define Payer type
type Payer = {
  id: string;
  payerName: string;
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

export default function PayersPage() {
  const [payers, setPayers] = useState<Payer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayer, setEditingPayer] = useState<Payer | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });

  // Filter states
  const [filters, setFilters] = useState({
    payerName: "",
  });

  // Temporary filter values for input fields
  const [tempFilters, setTempFilters] = useState({
    payerName: "",
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PayerFormValues>({
    resolver: zodResolver(payerSchema),
  });

  // Load payers from API with pagination and filters
  useEffect(() => {
    const loadPayers = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });

        if (filters.payerName) {
          queryParams.append("payerName", filters.payerName);
        }

        const response = await fetch(`/api/payers?${queryParams}`, {
          credentials: "include", // Include credentials (cookies) in the request
        });
        if (!response.ok) {
          throw new Error("Failed to fetch payers");
        }
        const result: PaginatedResult<Payer> = await response.json();

        setPayers(result.data);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: result.limit,
        });
      } catch (error) {
        console.error("Error loading payers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPayers();
  }, [pagination.page, filters]);

  const onSubmit = async (data: PayerFormValues) => {
    try {
      console.log("Saving payer:", data);
      let response;

      if (editingPayer) {
        // Update existing payer
        response = await fetch(`/api/payers/${editingPayer.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include credentials (cookies) in the request
          body: JSON.stringify({
            payerName: data.payerName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update payer");
        }

        // Refresh the payer list after update
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });

        if (filters.payerName) {
          queryParams.append("payerName", filters.payerName);
        }

        const refreshResponse = await fetch(`/api/payers?${queryParams}`, {
          credentials: "include", // Include credentials (cookies) in the request
        });
        if (!refreshResponse.ok) {
          throw new Error("Failed to refresh payers");
        }
        const result: PaginatedResult<Payer> = await refreshResponse.json();

        setPayers(result.data);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: result.limit,
        });
      } else {
        // Add new payer
        response = await fetch("/api/payers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include credentials (cookies) in the request
          body: JSON.stringify({
            payerName: data.payerName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create payer");
        }

        // Refresh the payer list after adding
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });

        if (filters.payerName) {
          queryParams.append("payerName", filters.payerName);
        }

        const refreshResponse = await fetch(`/api/payers?${queryParams}`, {
          credentials: "include", // Include credentials (cookies) in the request
        });
        if (!refreshResponse.ok) {
          throw new Error("Failed to refresh payers");
        }
        const result: PaginatedResult<Payer> = await refreshResponse.json();

        setPayers(result.data);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: result.limit,
        });
      }

      reset();
      setIsDialogOpen(false);
      setEditingPayer(null);
    } catch (error) {
      console.error("Error saving payer:", error);
      alert(
        error instanceof Error
          ? error.message
          : "An error occurred while saving the payer",
      );
    }
  };

  const handleEdit = (payer: Payer) => {
    setEditingPayer(payer);
    setValue("payerName", payer.payerName);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this payer?")) {
      try {
        const response = await fetch(`/api/payers/${id}`, {
          method: "DELETE",
          credentials: "include", // Include credentials (cookies) in the request
        });

        if (!response.ok) {
          throw new Error("Failed to delete payer");
        }

        // Refresh the payer list after deletion
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });

        if (filters.payerName) {
          queryParams.append("payerName", filters.payerName);
        }

        const refreshResponse = await fetch(`/api/payers?${queryParams}`, {
          credentials: "include", // Include credentials (cookies) in the request
        });
        if (!refreshResponse.ok) {
          throw new Error("Failed to refresh payers");
        }
        const result: PaginatedResult<Payer> = await refreshResponse.json();

        setPayers(result.data);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: result.limit,
        });
      } catch (error) {
        console.error("Error deleting payer:", error);
        alert("An error occurred while deleting the payer");
      }
    }
  };

  const handleFilterChange = (
    field: keyof typeof tempFilters,
    value: string,
  ) => {
    setTempFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    // Apply temporary filters to actual filters
    setFilters(tempFilters);
    // Reset to first page when filters change
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    // Clear all filters
    setTempFilters({
      payerName: "",
    });
    setFilters({
      payerName: "",
    });
    // Reset to first page
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({
        ...prev,
        page: newPage,
      }));
    }
  };

  // Function to export payers to Excel
  const handleExportExcel = async () => {
    try {
      // Fetch payers with the same filters that are currently applied
      const queryParams = new URLSearchParams({
        limit: '10000', // Using a high limit to get all matching records
      });
      
      // Add active filters to the query params
      if (filters.payerName) {
        queryParams.append('payerName', filters.payerName);
      }

      const response = await fetch(`/api/payers?${queryParams}`, {
        credentials: 'include' // Include credentials (cookies) in the request
      });
      if (!response.ok) {
        throw new Error("Failed to fetch payers for export");
      }

      const allPayers = await response.json();

      // Format data for Excel export
      const formattedData = allPayers.data.map((payer: any) => ({
        'ID': payer.id,
        'Payer Name': payer.payerName,
        'Created At': new Date(payer.createdAt).toLocaleDateString(),
        'Updated At': new Date(payer.updatedAt).toLocaleDateString(),
      }));

      // Create worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payers");

      // Generate and download Excel file with timestamp
      XLSX.writeFile(
        workbook,
        `payers_export_${new Date().toISOString().split("T")[0]}_${Date.now()}.xlsx`,
      );
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export payers to Excel. Please try again.");
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
        <h1 className="text-3xl font-bold text-gray-900">Payers</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingPayer(null);
                  reset();
                }}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPayer ? "Edit Payer" : "Add New Payer"}
                </DialogTitle>
                <DialogDescription>
                  {editingPayer
                    ? "Update payer information"
                    : "Enter payer information to add a new payer"}
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
                      {...register("payerName")}
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
                    {editingPayer ? "Update Payer" : "Add Payer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button onClick={handleExportExcel} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Filters - with button approach */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="filter-payer-name">Payer Name</Label>
            <div className="relative mt-1">
              <Input
                id="filter-payer-name"
                placeholder="Filter by Payer Name"
                value={tempFilters.payerName}
                onChange={(e) =>
                  handleFilterChange("payerName", e.target.value)
                }
                className="pl-10 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
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
          <Button type="button" variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
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
            {payers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center py-8 text-gray-500"
                >
                  No payers found
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
            Showing{" "}
            <span className="font-medium">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
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
                    variant={
                      pagination.page === pageNum ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={
                      pagination.page === pageNum
                        ? "bg-blue-600 hover:bg-blue-700"
                        : ""
                    }
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
