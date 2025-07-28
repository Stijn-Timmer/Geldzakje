<script>
	import Button from "$lib/components/ui/button/button.svelte";
	import { CloudAlert } from "@lucide/svelte";

</script>

<div class="flex flex-col flex-1 items-center h-full justify-center">
    <CloudAlert class="stroke-primary/10 w-20 h-20"/>
    <h1 class="text-lg text-center">Dit document bestaad niet, of is reeds verwijderd.</h1>
    <Button class="mt-8 w-80" href="/" variant="outline">Terug</Button>
</div>