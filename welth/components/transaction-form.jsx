"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { createTransaction, updateTransaction } from "@/actions/transactions";
import { useFetch } from "@/hooks/use-fetch";
import { ReceiptScanner } from "@/components/receipt-scanner";

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  date: z.date({ required_error: "Date is required" }),
  accountId: z.string().min(1, "Account is required"),
  category: z.string().min(1, "Category is required"),
  isRecurring: z.boolean().default(false),
  recurringInterval: z
    .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
    .optional(),
}).superRefine((data, ctx) => {
  if (data.isRecurring && !data.recurringInterval) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Recurring interval is required for recurring transactions",
      path: ["recurringInterval"],
    });
  }
});

export function TransactionForm({ accounts, categories, editMode = false, initialData = null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description || "",
            date: new Date(initialData.date),
            accountId: initialData.accountId,
            category: initialData.category,
            isRecurring: initialData.isRecurring,
            recurringInterval: initialData.recurringInterval || undefined,
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            date: new Date(),
            accountId: accounts.find((ac) => ac.isDefault)?.id || "",
            isRecurring: false,
          },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
    error,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  const filteredCategories = categories.filter((cat) => cat.type === type);

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode ? "Transaction updated successfully!" : "Transaction created successfully!"
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading]);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };
    if (editMode) {
      await transactionFn(editId, formData);
    } else {
      await transactionFn(formData);
    }
  };

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount?.toString() || "");
      setValue("date", new Date(scannedData.date) || new Date());
      if (scannedData.description) setValue("description", scannedData.description);
      if (scannedData.category) setValue("category", scannedData.category);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Receipt Scanner */}
      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      {/* Type Toggle */}
      <div className="flex rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setValue("type", "EXPENSE")}
          className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
            type === "EXPENSE"
              ? "bg-red-500 text-white"
              : "bg-muted text-muted-foreground"
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setValue("type", "INCOME")}
          className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
            type === "INCOME"
              ? "bg-green-500 text-white"
              : "bg-muted text-muted-foreground"
          }`}
        >
          Income
        </button>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Amount</label>
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register("amount")}
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      {/* Account */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Account</label>
        <Select
          onValueChange={(value) => setValue("accountId", value)}
          defaultValue={getValues("accountId")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name} (${account.balance.toFixed(2)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.accountId && (
          <p className="text-sm text-red-500">{errors.accountId.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          onValueChange={(value) => setValue("category", value)}
          defaultValue={getValues("category")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <span className="flex items-center gap-2">
                  {category.icon} {category.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setValue("date", date)}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description (Optional)</label>
        <Textarea placeholder="Enter description..." {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Recurring Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <label className="text-sm font-medium cursor-pointer">
            Recurring Transaction
          </label>
          <p className="text-sm text-muted-foreground">
            Set up automatic recurring transaction
          </p>
        </div>
        <Switch
          checked={isRecurring}
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
        />
      </div>

      {/* Recurring Interval */}
      {isRecurring && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Recurring Interval</label>
          <Select
            onValueChange={(value) => setValue("recurringInterval", value)}
            defaultValue={getValues("recurringInterval")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={transactionLoading}>
          {transactionLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  );
}