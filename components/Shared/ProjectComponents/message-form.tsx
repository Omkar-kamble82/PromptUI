"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useCreateMessages } from "@/modules/message/hooks";
import { toast } from "sonner";
import { useState } from "react";

const formSchema = z.object({
  content: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message is too long"),
});

const MessageForm = ({ projectId }: { projectId: string }) => {
  const [isFocused, setIsFocused] = useState(false);
  const { mutateAsync, isPending } = useCreateMessages(projectId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await mutateAsync(values.content);
      toast.success("Message sent successfully");
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    }
  };

  const isButtonDisabled = isPending;

  return (
    <>
      <div
        className={cn(
          "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
          isFocused && "shadow-xs",
        )}
      >
        <form
          id="message-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-4"
        >
          <FieldGroup>
            <Controller
              name="content"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      disabled={isPending}
                      placeholder="What would you like to build?"
                      onFocus={() => setIsFocused(true)}
                      onBlur={(e) => {
                        setIsFocused(false);
                        field.onBlur();
                      }}
                      rows={2}
                      className={cn(
                        "pt-4 resize-none border-none outline-none bg-transparent min-h-15 max-h-50",
                        isPending && "opacity-50"
                      )}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          form.handleSubmit(onSubmit)(e as any);
                        }
                      }}
                    />

                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums text-[10px]">
                        {field.value.length}/500
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>

                  {fieldState.invalid && (
                    <FieldError
                      className="text-rose-500"
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <div className="flex gap-x-2 items-center justify-between pt-2">
          <div className="text-[10px] text-muted-foreground font-mono">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span>&#8984;</span>Enter
            </kbd>
            &nbsp; to submit
          </div>
          <Button
            type="submit"
            form="message-form"
            className={cn(
              "size-8 rounded-full",
              isButtonDisabled && "bg-muted-foreground border"
            )}
            disabled={isButtonDisabled}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <ArrowUpIcon className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default MessageForm;