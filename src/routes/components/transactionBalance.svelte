<script lang="ts">
	import { AreaChart, LinearGradient, Area } from 'layerchart';
	import { curveBumpX } from 'd3-shape';
	import { scaleUtc } from 'd3-scale';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import type { Transaction } from '$lib/server/prisma/generated/client';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';

	interface Props {
		transactions: Transaction[];
	}

	const { transactions = [] }: Props = $props();

	let chartData: { date: Date; balance: number }[] = $state([]);

	// Sorteer transacties chronologisch voor correcte balans berekening
	const sorted = [...transactions].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

	let balance = 0;

	// Bereken de lopende balans door alle transacties heen
	// Dit creëert data punten voor de grafiek die de balans over tijd toont
	chartData = sorted.map((transaction) => {
		if (transaction.type === 'INCOMING') {
			balance += Number(transaction.amount);
		} else {
			balance -= Number(transaction.amount);
		}
		return { date: transaction.createdAt, balance: balance };
	});

	// Animatie voor de huidige balans weergave
	const currentBalance = new Tween(0, {
		duration: 2500,
		delay: 100,
		easing: cubicOut
	});

	onMount(() => {
		// Start de balans animatie naar de eindwaarde
		const finalBalance = chartData.length > 0 ? chartData[chartData.length - 1].balance : 0;
		currentBalance.set(finalBalance);
	});

	// Configuratie voor de chart styling
	const chartConfig = {
		balance: { label: 'Balans', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;
</script>

<div class="h-40 border shadow">
	<div class="h-[40%] p-2">
		<div class="w-40 rounded border p-1 shadow transition-transform ease-in-out hover:scale-105">
			<h2 class="text-md font-semibold">Huidige Balans</h2>
			<p class="text-1xl font-bold text-primary">
				{currentBalance.current.toLocaleString('nl-NL', {
					style: 'currency',
					currency: 'EUR',
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				})}
			</p>
		</div>
	</div>
	<Chart.Container config={chartConfig} class="h-[60%] w-full overflow-hidden pt-2">
		<AreaChart
			data={chartData}
			x="date"
			grid={false}
			xScale={scaleUtc()}
			series={[
				{
					key: 'balance',
					label: 'Balans',
					color: chartConfig.balance.color
				}
			]}
			axis={false}
			props={{
				area: { curve: curveBumpX, motion: 'tween', strokeWidth: 2, fillOpacity: 0.2 },
				highlight: {
					points: {
						motion: 'tween',
						r: 6
					}
				}
			}}
		>
			{#snippet marks({ series, getAreaProps })}
				{#each series as s, i (s.key)}
					<LinearGradient
						stops={[s.color ?? '', 'color-mix(in lch, ' + s.color + ' 10%, transparent)']}
						vertical
					>
						{#snippet children({ gradient })}
							<Area {...getAreaProps(s, i)} fill={gradient} />
						{/snippet}
					</LinearGradient>
				{/each}
			{/snippet}
			{#snippet tooltip()}
				<Chart.Tooltip
					labelFormatter={(v: Date) => v.toLocaleDateString('nl-NL', { month: 'long' })}
					indicator="line"
				/>
			{/snippet}
		</AreaChart>
	</Chart.Container>
</div>
