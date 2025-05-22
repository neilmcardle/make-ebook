'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useSettingsStore } from "@/lib/settings-store"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

const settingsFormSchema = z.object({
  export: z.object({
    format: z.enum(['epub', 'pdf', 'markdown']),
    includeCover: z.boolean(),
    includeTableOfContents: z.boolean(),
    defaultLanguage: z.string().min(2).max(5),
    pageSize: z.enum(['A4', 'A5', 'Letter']).optional(),
    marginSize: z.enum(['small', 'medium', 'large']).optional(),
  }),
  defaultMetadata: z.object({
    author: z.string().min(1),
    language: z.string().min(2),
    publisher: z.string().optional(),
    rights: z.string().optional(),
  }),
  theme: z.enum(['light', 'dark', 'system']),
  autosaveInterval: z.number().min(1).max(60),
})

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettingsStore()
  
  const form = useForm<z.infer<typeof settingsFormSchema>>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: settings
  })

  function onSubmit(values: z.infer<typeof settingsFormSchema>) {
    updateSettings(values)
    toast.success("Settings saved successfully")
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure your export preferences and default metadata.
        </p>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <h4 className="text-sm font-medium">Export Settings</h4>
            <FormField
              control={form.control}
              name="export.format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Export Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select export format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="epub">EPUB</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="export.includeCover"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Include Cover</FormLabel>
                    <FormDescription>
                      Automatically generate a cover page for exports
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="export.includeTableOfContents"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Include Table of Contents</FormLabel>
                    <FormDescription>
                      Generate a table of contents for exports
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-medium">Default Metadata</h4>
            <FormField
              control={form.control}
              name="defaultMetadata.author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Author</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be used as the default author for new books
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultMetadata.language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Language</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="en" />
                  </FormControl>
                  <FormDescription>
                    ISO 639-1 language code (e.g., en, es, fr)
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultMetadata.publisher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publisher</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultMetadata.rights"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rights</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Copyright or license information
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-medium">Application Settings</h4>
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autosaveInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autosave Interval (minutes)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How often to automatically save your work (1-60 minutes)
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                resetSettings()
                form.reset(defaultSettings)
                toast.success("Settings reset to defaults")
              }}
            >
              Reset to Defaults
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}