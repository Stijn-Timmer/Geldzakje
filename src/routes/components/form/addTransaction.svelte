<script lang="ts">
    import * as Form from '$lib/components/ui/form';
    import * as AlertDialog from '$lib/components/ui/alert-dialog';
    import * as Select from '$lib/components/ui/select/index.js';
    import { Textarea } from '$lib/components/ui/textarea';
    import { transactionSchema, type TransactionSchema } from './schema';
    import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
    import { zod4Client } from 'sveltekit-superforms/adapters';
    import { buttonVariants } from '$lib/components/ui/button';
    import { ArrowBigDown, ArrowBigUp, FileCheck2 } from '@lucide/svelte';
    import Input from '$lib/components/ui/input/input.svelte';
    import Calendar from "$lib/components/ui/calendar/calendar.svelte";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
    import { CalendarDate, getLocalTimeZone, today, type DateValue, DateFormatter } from "@internationalized/date"; // [1]
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

    // Props: Pre-validated form data van de server
    const { transactionForm }: { transactionForm: SuperValidated<Infer<TransactionSchema>> } =
        $props();

    // Superforms setup met client-side validatie
    const form = superForm(transactionForm, {
        validators: zod4Client(transactionSchema),
        dataType: 'json',
        onResult: async ({ result }) => {
            if (result.type === 'success') {
                openDialog = false;
                await invalidateAll()
                toast.success('Transactie succesvol toegevoegd!');
            } 
        }
    });

    let openDialog: boolean = $state(false);

    const { form: formData, enhance } = form;

    // Local state for calendar popup
    let isCalendarOpen: boolean = $state(false);

    // DateFormatter instance for displaying the date in a user-friendly format within the button trigger.
    const df = new DateFormatter("nl-NL", { dateStyle: "long" }); // [1]

    // Svelte state for the Calendar component's bind:value.
    // This variable holds the CalendarDate object for the UI component.
    // It is initialized from $formData.date (a native Date) by converting it to CalendarDate,
    // ensuring the date picker displays any pre-filled value from the form data.
    let selectedCalendarDate: DateValue | undefined = $state(
        $formData.date instanceof Date
           ? new CalendarDate($formData.date.getFullYear(), $formData.date.getMonth() + 1, $formData.date.getDate())
            : undefined
    ); // [1]

    const fileSelection = (event: Event) => {
        const input = event.target as HTMLInputElement;
        const files: FileList | null = input.files;
        if (files && files.length > 0) {
            const file = files[0];
            $formData.invoiceFile = file;
        }
    };

    // Reset the form data and calendar value when the dialog is closed,
    // and initialize calendar value when dialog opens.
    const onOpenChange = async (state: boolean) => {
        if (!state) { // Dialog is closing
            form.reset();
            selectedCalendarDate = undefined; // Clear calendar value on close
        } else { // Dialog is opening
            // Initialize calendar value from form data if it exists
            selectedCalendarDate = $formData.date instanceof Date
               ? new CalendarDate($formData.date.getFullYear(), $formData.date.getMonth() + 1, $formData.date.getDate())
                : undefined; // [1]
        }
    };
</script>

<AlertDialog.Root bind:open={openDialog} onOpenChange={onOpenChange}>
    <AlertDialog.Trigger class={buttonVariants({ variant: 'default' })}
        >Nieuwe Transactie</AlertDialog.Trigger
    >
    <AlertDialog.Content class="transition-colors duration-300 ease-in-out {$formData.type === 'INCOMING'? 'border-lime-500' : 'border-rose-500'}">
        <form method="POST" use:enhance enctype="multipart/form-data">
            <AlertDialog.Header>
                <AlertDialog.Title>Nieuwe Transactie</AlertDialog.Title>
            </AlertDialog.Header>
            <div class="mt-4 flex items-center gap-4">
                <Form.Field {form} name="type">
                    <Form.Control>
                        {#snippet children({ props })}
                            <Form.Label>Transactie Type</Form.Label>
                            <Select.Root type="single" bind:value={$formData.type} name={props.name}>
                                <Select.Trigger {...props} class="w-40">
                                    <ArrowBigDown
                                        class="transition-all duration-300 ease-in-out {$formData.type === 'INCOMING'
                                           ? 'stroke-lime-500'
                                            : 'rotate-180 stroke-rose-500'}"
                                    />
                                    <span class="ml-2">{$formData.type === 'INCOMING'? 'Inkomend' : 'Uitgaand'}</span
                                    >
                                </Select.Trigger>
                                <Select.Content>
                                    <Select.Item value="INCOMING">
                                        <ArrowBigDown class="stroke-lime-500" />
                                        <span class="ml-2">Inkomend</span>
                                    </Select.Item>
                                    <Select.Item value="OUTGOING">
                                        <ArrowBigUp class="stroke-rose-500" />
                                        <span class="ml-2">Uitgaand</span>
                                    </Select.Item>
                                </Select.Content>
                            </Select.Root>
                        {/snippet}
                    </Form.Control>
                    <div class="h-6 w-full">
                        <Form.FieldErrors />
                    </div>
                </Form.Field>
                <Form.Field {form} name="amount">
                    <Form.Control>
                        {#snippet children({ props })}
                            <Form.Label>Bedrag</Form.Label>
                            <Input
                                autofocus={true}
                                type="number"
                                class="w-28 [appearance:textfield][&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                min="0"
                                step="0.01"
                                bind:value={$formData.amount}
                                {...props}
                            />
                        {/snippet}
                    </Form.Control>
                    <div class="h-6 w-full">
                        <Form.FieldErrors />
                    </div>
                </Form.Field>
            </div>
                            <Form.Field {form} name="date">
                    <Form.Control>
                        {#snippet children({ props })}
                            <Form.Label for="date">Datum</Form.Label>
                            <Popover.Root bind:open={isCalendarOpen}>
                                <Popover.Trigger id="date">
                                    <Button
                                        variant="outline"
                                        class="w-full justify-between font-normal"
                                        {...props}
                                    >
                                        {selectedCalendarDate
                                           ? df.format(selectedCalendarDate.toDate(getLocalTimeZone())) // [1]
                                            : 'Selecteer datum'}
                                        <ChevronDownIcon class="ml-2 h-4 w-4" />
                                    </Button>
                                </Popover.Trigger>

                                <Popover.Content class="w-auto overflow-hidden p-0" align="start">
                                    <Calendar
                                        type="single"
                                        bind:value={selectedCalendarDate}
                                        onValueChange={(v) => {
                                            if (v) {
                                                // Crucial conversion: CalendarDate (v) is converted to a native Date object.
                                                $formData.date = v.toDate(getLocalTimeZone()); // [1, 4, 5]
                                            } 
                                            isCalendarOpen = false; // Close popover on selection for better UX
                                        }}
                                        captionLayout="dropdown"
                                        minValue={new CalendarDate(1900, 1, 1)} 
                                        maxValue={today(getLocalTimeZone())}
                                    />
                                </Popover.Content>
                            </Popover.Root>
                        {/snippet}
                    </Form.Control>
                    <div class="h-6 w-full">
                        <Form.FieldErrors />
                    </div>
                </Form.Field>
            <Form.Field {form} name="description">
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>Omschrijving</Form.Label>
                        <Textarea bind:value={$formData.description} {...props} />
                    {/snippet}
                </Form.Control>
                <div class="h-8 w-full">
                    <Form.FieldErrors />
                </div>
            </Form.Field>
            <Form.Field {form} name="invoiceFile">
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>Factuur</Form.Label>
                        {#if $formData.invoiceFile}
                            <div class="mt-2 flex items-center gap-2">
                                <FileCheck2 class="stroke-primary"/>
                                <p class="text-sm text-gray-500">
                                    Geselecteerde: {$formData.invoiceFile.name}
                                </p>
                            </div>
                        {:else}
                            <Input type="file" accept=".pdf" {...props} onchange={fileSelection} />
                        {/if}
                    {/snippet}
                </Form.Control>
                <div class="h-8 w-full">
                    <Form.FieldErrors />
                </div>
            </Form.Field>
            <AlertDialog.Footer>
                <AlertDialog.Cancel type="reset">Cancel</AlertDialog.Cancel>
                <AlertDialog.Action type="submit">Create</AlertDialog.Action>
            </AlertDialog.Footer>
        </form>
    </AlertDialog.Content>
</AlertDialog.Root>