typescriptreact
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import storage functions
import { db, functions, storage } from "@/lib/firebase"; // Assuming you have storage exported
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Icons } from "@/components/icons";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";

interface PdfResource {
  id: string;
  label: string;
  icon: string; // Icon name string, e.g., "book"
  type: "uploaded" | "link";
  sourceUrl: string; // Download URL for uploaded, or external URL for link
  storagePath?: string; // Path in Firebase Storage for uploaded files
  fileName?: string; // Original file name for uploaded files
}

interface PdfResourceManagerProps {
  chapterId: string | null;
}

const addPdfResourceCallable = httpsCallable(
  functions,
  "addPdfResource"
);
const updatePdfResourceCallable = httpsCallable(
  functions,
  "updatePdfResource"
);
const deletePdfResourceCallable = httpsCallable(
  functions,
  "deletePdfResource"
);

const formSchema = z.object({
  label: z.string().min(1, { message: "Label is required." }),
  icon: z.string().optional(),
  type: z.enum(["uploaded", "link"]),
  sourceUrl: z.string().optional(), // Only required for 'link'
  file: typeof window === 'undefined' ? z.any().optional() : z.instanceof(FileList).optional(), // Only required for 'uploaded'
});

type FormValues = z.infer<typeof formSchema>;

const PdfResourceManager: React.FC<PdfResourceManagerProps> = ({
  chapterId,
}) => {
  const [resources, setResources] = useState<PdfResource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingResource, setEditingResource] = useState<PdfResource | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      icon: "",
      type: "link",
      sourceUrl: "",
      file: undefined,
    },
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      icon: "",
      type: "link",
      sourceUrl: "",
      file: undefined,
    },
  });

  useEffect(() => {
    if (!chapterId) {
      setResources([]);
      return;
    }

    setIsLoadingResources(true);
    // Listen to changes in the pdfResources subcollection for this chapter
    const q = query(
      collection(db, `studyMaterials/${chapterId}/pdfResources`)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const resourcesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PdfResource[];
        setResources(resourcesList);
        setIsLoadingResources(false);
      },
      (error) => {
        console.error("Error fetching PDF resources:", error);
        toast({
          title: "Error",
          description: "Failed to load PDF resources.",
          variant: "destructive",
        });
        setIsLoadingResources(false);
      }
    );

    return () => unsubscribe(); // Cleanup the listener on unmount or chapterId change
  }, [chapterId, toast]);

  const onSubmit = async (values: FormValues) => {
    if (!chapterId) {
      toast({
        title: "Error",
        description: "Please select a chapter first.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      let sourceUrl = values.sourceUrl;
      let storagePath = undefined;
      let fileName = undefined;

      if (values.type === "uploaded" && values.file && values.file.length > 0) {
        const file = values.file[0];
        fileName = file.name;
        storagePath = `studyMaterials/${chapterId}/pdfResources/${Date.now()}_${fileName}`;
        const storageRef = ref(storage, storagePath);

        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);
        sourceUrl = await getDownloadURL(snapshot.ref);
        console.log("Uploaded file and got download URL:", sourceUrl);

      } else if (values.type === "link" && !values.sourceUrl) {
         toast({
          title: "Error",
          description: "Source URL is required for link type.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }


      const resourceData = {
        chapterId, // Pass chapterId for subcollection path in function
        label: values.label,
        icon: values.icon || "book",
        type: values.type,
        sourceUrl: sourceUrl || '', // Use the generated URL or the provided link
        storagePath: storagePath, // Store storage path for uploaded files
        fileName: fileName, // Store original file name for uploaded files
      };
      console.log("Calling addPdfResource with:", resourceData);


      const result = await addPdfResourceCallable(resourceData);
      console.log("addPdfResource result:", result.data);

      toast({
        title: "Success",
        description: "PDF resource added.",
      });
      form.reset(); // Reset form after successful submission
    } catch (error: any) {
      console.error("Error adding PDF resource:", error);
      toast({
        title: "Error",
        description: `Failed to add PDF resource: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onEditSubmit = async (values: FormValues) => {
      if (!editingResource) return;

      setIsSaving(true);
      try {
          let sourceUrl = values.sourceUrl;
          let storagePath = editingResource.storagePath;
          let fileName = editingResource.fileName;

          // Check if a new file is selected for an uploaded resource
          if (values.type === "uploaded" && values.file && values.file.length > 0) {
            const file = values.file[0];
            fileName = file.name;
             storagePath = `studyMaterials/${chapterId}/pdfResources/${Date.now()}_${fileName}`; // Generate new path
            const storageRef = ref(storage, storagePath);

             // Upload the new file
            const snapshot = await uploadBytes(storageRef, file);
            sourceUrl = await getDownloadURL(snapshot.ref);
            console.log("Uploaded new file and got download URL:", sourceUrl);

             // Attempt to delete the old file if it existed
             if (editingResource.storagePath) {
                 try {
                    const oldFileRef = ref(storage, editingResource.storagePath);
                    await deleteObject(oldFileRef);
                    console.log("Deleted old file from storage:", editingResource.storagePath);
                 } catch (storageError) {
                    console.warn("Failed to delete old file from storage:", storageError);
                    // Continue even if old file deletion fails
                 }
             }

          } else if (values.type === "link" && !values.sourceUrl) {
             toast({
              title: "Error",
              description: "Source URL is required for link type.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          } else if (values.type === "uploaded" && !editingResource.storagePath && (!values.file || values.file.length === 0)) {
               // Case where type is switched to uploaded but no file is provided, and no existing file
                toast({
                  title: "Error",
                  description: "File is required for uploaded type.",
                  variant: "destructive",
                });
                setIsSaving(false);
                return;
          }


          const resourceData = {
              resourceId: editingResource.id,
              label: values.label,
              icon: values.icon || "book",
              type: values.type,
              sourceUrl: sourceUrl || '',
              storagePath: storagePath,
              fileName: fileName,
          };
          console.log("Calling updatePdfResource with:", resourceData);

          const result = await updatePdfResourceCallable(resourceData);
          console.log("updatePdfResource result:", result.data);

          toast({
              title: "Success",
              description: "PDF resource updated.",
          });
          setEditingResource(null); // Close edit form
          editForm.reset();
      } catch (error: any) {
          console.error("Error updating PDF resource:", error);
          toast({
              title: "Error",
              description: `Failed to update PDF resource: ${error.message}`,
              variant: "destructive",
          });
      } finally {
          setIsSaving(false);
      }
  };


  const handleDeleteResource = async (resource: PdfResource) => {
    setIsSaving(true); // Use the same saving state for simplicity
    try {
      const result = await deletePdfResourceCallable({
        resourceId: resource.id,
        sourceUrlOrPath: resource.storagePath || resource.sourceUrl, // Pass storagePath for uploaded, URL for link (though function uses storagePath for deletion)
        type: resource.type,
      });
      console.log("deletePdfResource result:", result.data);
      toast({
        title: "Success",
        description: "PDF resource deleted.",
      });
    } catch (error: any) {
      console.error("Error deleting PDF resource:", error);
      toast({
        title: "Error",
        description: `Failed to delete PDF resource: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (resource: PdfResource) => {
      setEditingResource(resource);
      editForm.reset({
          label: resource.label,
          icon: resource.icon,
          type: resource.type,
          sourceUrl: resource.sourceUrl,
          file: undefined, // Reset file input when starting edit
      });
  };

  const cancelEditing = () => {
      setEditingResource(null);
      editForm.reset();
  };


  if (!chapterId) {
    return (
      <div className="mt-4 text-center text-muted-foreground">
        Select a Grade and Chapter to manage PDF resources.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Manage PDF Resources</h2>

      {isLoadingResources ? (
        <div className="flex justify-center items-center">
           <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> Loading Resources...
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No PDF resources found for this chapter.
                </TableCell>
              </TableRow>
            ) : (
              resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>{resource.label}</TableCell>
                  <TableCell>{resource.type === 'uploaded' ? 'Uploaded File' : 'Link'}</TableCell>
                  <TableCell>
                    {resource.type === 'link' ? (
                         <a href={resource.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                             {resource.sourceUrl}
                         </a>
                    ) : (
                        resource.fileName || 'Uploaded File' // Display file name or a generic label
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => startEditing(resource)}>Edit</Button>
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="destructive" size="sm" disabled={isSaving}>Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the PDF resource
                            "{resource.label}" and remove the associated file from storage if it was uploaded.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteResource(resource)} disabled={isSaving}>
                             {isSaving ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Add New Resource Form */}
      <div className="mt-8 p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-4">Add New PDF Resource</h3>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-label">Label</Label>
              <Input id="new-label" {...form.register("label")} />
              {form.formState.errors.label && (
                <p className="text-sm text-red-500">{form.formState.errors.label.message}</p>
              )}
            </div>
             <div>
              <Label htmlFor="new-icon">Icon (Optional)</Label>
              <Input id="new-icon" {...form.register("icon")} placeholder="e.g., book, file" />
               {form.formState.errors.icon && (
                <p className="text-sm text-red-500">{form.formState.errors.icon.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Resource Type</Label>
             <Select onValueChange={(value: "uploaded" | "link") => form.setValue("type", value)} defaultValue="link">
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="link">Link (External URL)</SelectItem>
                <SelectItem value="uploaded">Uploaded File</SelectItem>
              </SelectContent>
            </Select>
             {form.formState.errors.type && (
                <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
              )}
          </div>

          {form.watch("type") === "link" && (
            <div>
              <Label htmlFor="new-sourceUrl">Source URL</Label>
              <Input id="new-sourceUrl" {...form.register("sourceUrl")} placeholder="https://example.com/resource.pdf" />
               {form.formState.errors.sourceUrl && (
                <p className="text-sm text-red-500">{form.formState.errors.sourceUrl.message}</p>
              )}
            </div>
          )}

          {form.watch("type") === "uploaded" && (
            <div>
              <Label htmlFor="new-file">Upload File (PDF, etc.)</Label>
              <Input id="new-file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" {...form.register("file")} />
               {form.formState.errors.file && (
                 // Note: react-hook-form errors for file inputs can be tricky to type
                <p className="text-sm text-red-500">{(form.formState.errors.file as any)?.message}</p>
              )}
            </div>
          )}

          <Button type="submit" disabled={isSaving || !chapterId}>
            {isSaving ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.plus className="mr-2 h-4 w-4" />}
            Add Resource
          </Button>
        </form>
      </div>

        {/* Edit Resource Form Dialog */}
       {editingResource && (
           <AlertDialog open={!!editingResource} onOpenChange={setEditingResource}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Edit PDF Resource</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update the details for "{editingResource.label}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                     <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-label">Label</Label>
                                <Input id="edit-label" {...editForm.register("label")} />
                                {editForm.formState.errors.label && (
                                    <p className="text-sm text-red-500">{editForm.formState.errors.label.message}</p>
                                )}
                            </div>
                             <div>
                                <Label htmlFor="edit-icon">Icon (Optional)</Label>
                                <Input id="edit-icon" {...editForm.register("icon")} placeholder="e.g., book, file" />
                                 {editForm.formState.errors.icon && (
                                    <p className="text-sm text-red-500">{editForm.formState.errors.icon.message}</p>
                                )}
                            </div>
                        </div>

                         <div>
                            <Label>Resource Type</Label>
                             <Select onValueChange={(value: "uploaded" | "link") => editForm.setValue("type", value)} value={editForm.watch("type")}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="link">Link (External URL)</SelectItem>
                                <SelectItem value="uploaded">Uploaded File</SelectItem>
                              </SelectContent>
                            </Select>
                             {editForm.formState.errors.type && (
                                <p className="text-sm text-red-500">{editForm.formState.errors.type.message}</p>
                              )}
                        </div>

                        {editForm.watch("type") === "link" && (
                            <div>
                                <Label htmlFor="edit-sourceUrl">Source URL</Label>
                                <Input id="edit-sourceUrl" {...editForm.register("sourceUrl")} placeholder="https://example.com/resource.pdf" />
                                 {editForm.formState.errors.sourceUrl && (
                                    <p className="text-sm text-red-500">{editForm.formState.errors.sourceUrl.message}</p>
                                )}
                            </div>
                        )}

                        {editForm.watch("type") === "uploaded" && (
                            <div>
                                <Label htmlFor="edit-file">Upload New File (Optional)</Label>
                                <Input id="edit-file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" {...editForm.register("file")} />
                                 {editForm.formState.errors.file && (
                                    <p className="text-sm text-red-500">{(editForm.formState.errors.file as any)?.message}</p>
                                )}
                                {editingResource.storagePath && (
                                    <p className="text-sm text-muted-foreground mt-1">Current file: {editingResource.fileName || editingResource.storagePath}</p>
                                )}
                            </div>
                        )}
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={cancelEditing}>Cancel</AlertDialogCancel>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
           </AlertDialog>
       )}

    </div>
  );
};

export default PdfResourceManager;