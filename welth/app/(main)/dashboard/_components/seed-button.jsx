"use client";

import { Button } from "@/components/ui/button";
import { seedTransactions } from "@/actions/seed";
import { useFetch } from "@/hooks/use-fetch";
import { toast } from "sonner";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function SeedButton() {
  const { loading, fn: seedFn, data, error } = useFetch(seedTransactions);

  useEffect(() => {
    if (data?.success) {
      toast.success(data.message);
      window.location.reload();
    }
  }, [data]);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={seedFn}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Seeding...
        </>
      ) : (
        "Seed Test Data"
      )}
    </Button>
  );
}