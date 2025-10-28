import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from './Dialog';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Form, FormControl, FormItem, FormLabel, FormMessage, useForm } from './Form';
import { useAuth } from '../helpers/useAuth';
import { useCreateQuery } from '../helpers/useUserQueries';
import { schema as createQuerySchema } from '../endpoints/queries_POST.schema';
import { z } from 'zod';
import styles from './ChatbotWidget.module.css';

export const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const { authState } = useAuth();
  const { mutate: createQuery, isPending } = useCreateQuery();

  const isGuest = authState.type !== 'authenticated';

  const formSchema = isGuest
    ? createQuerySchema.extend({
        name: z.string().min(1, "Name is required"),
        contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
      })
    : createQuerySchema;

  const form = useForm({
    schema: formSchema,
    defaultValues: {
      name: '',
      contactNumber: '',
      message: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createQuery(values, {
      onSuccess: () => {
        form.setValues({ name: '', contactNumber: '', message: '' });
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-md" title="Contact Support">
          <MessageSquare />
        </Button>
      </DialogTrigger>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
          <DialogDescription>
            Have a question or need help? Fill out the form below and we'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
            {isGuest && (
              <>
                <FormItem name="name">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your Name"
                      value={form.values.name}
                      onChange={(e) => form.setValues((p) => ({ ...p, name: e.target.value }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <FormItem name="contactNumber">
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your Contact Number"
                      value={form.values.contactNumber}
                      onChange={(e) => form.setValues((p) => ({ ...p, contactNumber: e.target.value }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </>
            )}
            <FormItem name="message">
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your issue or question..."
                  rows={5}
                  value={form.values.message}
                  onChange={(e) => form.setValues((p) => ({ ...p, message: e.target.value }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Submitting...' : 'Submit Query'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};