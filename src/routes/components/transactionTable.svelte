<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import type { Transaction } from '$lib/server/prisma/generated/client';
	import { ArrowBigDown, ArrowBigUp } from '@lucide/svelte';
	import { File } from '@lucide/svelte';

	interface Props {
		transactions: Transaction[];
	}

	const { transactions }: Props = $props();

	/**
	 * Formatteert een datum naar Nederlandse notatie met tijd
	 * @param date - De datum om te formatteren
	 * @returns Geformatteerde datum string (dd-mm-yyyy, uu:mm)
	 */
	function formatDate(date: Date): string {
		return date.toLocaleDateString('nl-NL', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<!-- Table container -->
<div class="rounded border shadow">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[150px]">Type</Table.Head>
				<Table.Head>Hoeveel</Table.Head>
				<Table.Head>Beschrijving</Table.Head>
				<Table.Head>Factuur</Table.Head>
				<Table.Head class="text-right">Datum</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each transactions as transaction (transaction.id)}
				<Table.Row>
					<Table.Cell class="flex items-center font-medium">
						{#if transaction.type === 'INCOMING'}
							<ArrowBigDown class="stroke-lime-500" />
							<span class="ml-2">Inkomend</span>
						{:else}
							<ArrowBigUp class="stroke-rose-500" />
							<span class="ml-2">Uitgaand</span>
						{/if}
					</Table.Cell>
					<Table.Cell>€ {transaction.amount}</Table.Cell>
					<Table.Cell>{transaction.description || 'Geen beschrijving'}</Table.Cell>
					<Table.Cell>
						{#if transaction.invoiceId}
							<a
								href={`/documents/${transaction.invoiceId}`} class="flex gap-2 items-center">
								<File class="text-primary w-4 h-4"/>
								Bekijken
							</a>
						{:else}
							<span class="text-gray-500">Geen factuur</span>
						{/if}
					</Table.Cell>
					<Table.Cell class="text-right">
						{formatDate(transaction.createdAt)}
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
