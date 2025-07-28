<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { PiggyBank } from '@lucide/svelte';
</script>

<div class="flex h-14 items-center justify-between border-b p-2">
	<!-- Logo and title -->
	<div class="flex items-center gap-1">
		<PiggyBank class="stroke-primary" />
		<h1 class="font-pixelify text-2xl">Geldzakje</h1>
	</div>
	<div>
		{#if page.url.pathname !== "/"}
			<Button variant="destructive" href="/">Terug</Button>
		{/if}
	</div>
</div>
