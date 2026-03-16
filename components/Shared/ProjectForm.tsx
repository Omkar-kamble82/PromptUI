"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { useCreateProject } from "@/modules/project/hooks"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  description: z
    .string()
    .min(20, "Project description must be at least 20 characters.")
    .max(500, "Description must be under 500 characters."),
})

const ProjectForm = ({ initialPrompt }: { initialPrompt: string }) => {

    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: initialPrompt || "",  
        },
        mode: "onChange",
    })

    const {mutateAsync, isPending} = useCreateProject()

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            const res = await mutateAsync(data.description)
            toast.success("Project created successfully!") 
            form.reset()
            router.push(`/projects/${res.id}`) 
        } catch (error) {
            console.error("Error creating project:", error)
            toast.error("Failed to create project.")
        }
    }

    const isButtonDisabled = isPending || !form.watch("description").trim();

  return (
    <Card className="mt-4 border-neutral-200 shadow-sm">
        <CardHeader>
            <CardTitle className="text-lg">
                <span className="text-lg font-bold md:text-xl">
                    Start Building Your UI with <span className="text-[#ff4136]">PromptUI</span>
                </span>
            </CardTitle>
            <CardDescription>
            Describe the project you want to generate.
            </CardDescription>
        </CardHeader>

        <CardContent>
            <form
            id="project-form"
            onSubmit={form.handleSubmit(onSubmit)}
            >
            <FieldGroup>
                <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="project-description">
                        Project Description
                    </FieldLabel>

                    <InputGroup>
                        <InputGroupTextarea
                        {...field}
                        id="project-description"
                        rows={6}
                        placeholder="Example: Build a SaaS analytics dashboard with charts, filters, authentication, and a modern UI..."
                        className="min-h-28 resize-none focus-visible:ring-[#ff4136]/40"
                        aria-invalid={fieldState.invalid}
                        />

                        <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                            {field.value.length}/500
                        </InputGroupText>
                        </InputGroupAddon>
                    </InputGroup>

                    <FieldDescription>
                        Describe the UI, features, and layout of the project you want.
                    </FieldDescription>

                    {fieldState.invalid && (
                        <FieldError className="text-rose-500" errors={[fieldState.error]} />
                    )}
                    </Field>
                )}
                />
            </FieldGroup>
            </form>
        </CardContent>

        <CardFooter className="flex justify-end">
            <Button
                type="submit"
                form="project-form"
                className={cn("bg-[#ff4136] hover:bg-[#e6362c] text-white", isButtonDisabled && "cursor-not-allowed opacity-50")}
                disabled={isButtonDisabled}
                >
                {isPending ? (<Spinner className="h-4 w-4" />) : "Create Project"}
            </Button>
        </CardFooter>
    </Card>
  )
}

export default ProjectForm