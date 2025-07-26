<script lang="ts">
	import '../app.css';
	import TransactionBalance from './components/transactionBalance.svelte';
	import TransactionTable from './components/transactionTable.svelte';
	import AddTransactionForm from './components/form/addTransaction.svelte';

	// Props van de page server load functie
	const { data } = $props();
</script>

<!-- 
	Hoofdpagina layout voor de Geldzakje applicatie
	Toont balans overzicht, transactie tabel en nieuwe transactie form
-->

<!-- App container -->
<div class="mx-auto h-full w-full max-w-6xl">
	<!-- Header met balans en nieuwe transactie knop -->
	<div class="flex items-start justify-between gap-4 p-4">
		<div class="flex-1">
			<TransactionBalance transactions={data.transactions} />
		</div>
	</div>
	<div class="flex items-center justify-between p-4">
		<h1 class="text-xl font-bold">Transacties</h1>
		<AddTransactionForm transactionForm={data.form} />
	</div>
	<!-- Transactie tabel -->
	<div class="p-4 pt-0">
		<TransactionTable transactions={data.transactions} />
	</div>
</div>
