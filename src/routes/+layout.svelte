<script lang="ts">
	import '../app.css';
	import AppHeader from './components/appHeader.svelte';

	let { children, data } = $props();
</script>

<div class="flex h-screen w-full flex-col overflow-hidden">
	<AppHeader />
	<div class="flex-1 overflow-hidden overflow-y-auto">
		{@render children()}
	</div>
</div>
