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
    import { getLocalTimeZone, today, type DateValue } from "@internationalized/date";

    // Props: Pre-validated form data van de server
    const { transactionForm }: { transactionForm: SuperValidated<Infer<TransactionSchema>> } =
        $props();

    // Superforms setup met client-side validatie
    const form = superForm(transactionForm, {
        validators: zod4Client(transactionSchema),
    });

    const { form: formData, enhance } = form;

    // Local state voor calendar popup
    let isCalendarOpen: boolean = $state(false);

    /**
     * Tijdelijke datum waarde voor de calendar component
     * Converteert tussen JavaScript Date en CalendarDate formaten
     */
    let tempDateValue: DateValue | undefined = $state(
        $formData.date ? today(getLocalTimeZone()).set(
            {
                year: $formData.date.getFullYear(),
                month: $formData.date.getMonth() + 1, // JS Date maanden zijn 0-indexed, CalendarDate 1-indexed
                day: $formData.date.getDate()
            }
        ) : undefined
    );

    let open = $state(false);

    const fileSelection = (event: Event) => {
        const input = event.target as HTMLInputElement;
        const files: FileList | null = input.files;
        if (files && files.length > 0) {
            const file = files[0];
            $formData.invoiceFile = file;
        }
    };

    // Handler for when the calendar value changes
    const handleDateChange = (dateValue: DateValue | undefined) => {
        tempDateValue = dateValue; // Update the temporary state for the Calendar component

        if (dateValue) {
            $formData.date = new Date(dateValue.toString());
		}

        isCalendarOpen = false; // Close the popover after selection
    };

    // Reset the form data when the dialog is closed
    const onOpenChange = async (state: boolean) => {
        if (state) return;
        form.reset();
        // Also reset tempDateValue when the dialog closes
        tempDateValue = undefined;
    };

</script>

<AlertDialog.Root onOpenChange={onOpenChange}>
    <AlertDialog.Trigger class={buttonVariants({ variant: 'default' })}
        >Nieuwe Transactie</AlertDialog.Trigger
    >
    <AlertDialog.Content class="transition-colors duration-300 ease-in-out {$formData.type === 'INCOMING' ? 'border-lime-500' : 'border-rose-500'}">
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
                                    <span class="ml-2">{$formData.type === 'INCOMING' ? 'Inkomend' : 'Uitgaand'}</span
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
                                class="w-28 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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

                <Form.Field {form} name="date">
                    <Form.Control>
                        {#snippet children({ props })}
                            <Form.Label for="date">Datum</Form.Label>
                            <Popover.Root bind:open={isCalendarOpen}>
                                <Popover.Trigger id="date">
                                    <Button
                                        {...props}
                                        variant="outline"
                                        class="w-40 justify-between font-normal"
                                    >
                                        {$formData.date
                                            ? $formData.date.toLocaleDateString()
                                            : 'Selecteer datum'}
                                        <ChevronDownIcon class="ml-2 h-4 w-4" />
                                    </Button>
                                </Popover.Trigger>

                                <Popover.Content class="w-auto overflow-hidden p-0" align="start">
                                <Calendar
                                    type="single"
                                    bind:value={tempDateValue} captionLayout="dropdown"
                                    onValueChange={handleDateChange} maxValue={today(getLocalTimeZone())}
                                />
                                </Popover.Content>
                            </Popover.Root>
                        {/snippet}
                    </Form.Control>
                    <div class="h-6 w-full">
                        <Form.FieldErrors />
                    </div>
                </Form.Field>
            </div>
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