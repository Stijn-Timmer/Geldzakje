<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { Trash } from "@lucide/svelte";
  import { enhance } from "$app/forms";

  interface Props {
    transactionId: number;
  }

  const { transactionId }: Props = $props();

  let isDeleting = $state(false);
  let dialogOpen = $state(false);

  /**
   * Handle form submission events
   * Toont loading state tijdens het verwijderen
   */
  function handleSubmit() {
    isDeleting = true;
  }
</script>

 
<AlertDialog.Root bind:open={dialogOpen}>
  <AlertDialog.Trigger class="p-1 group">
    <Trash class="w-4 h-4 group-hover:stroke-red-500 transition-colors duration-200 ease-in-out" />
  </AlertDialog.Trigger>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Transactie verwijderen</AlertDialog.Title>
      <AlertDialog.Description>
        Weet je zeker dat je deze transactie wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
      </AlertDialog.Description>
    </AlertDialog.Header>
    
    <form method="POST" action="?/deleteTransaction" use:enhance onsubmit={handleSubmit}>
      <input type="hidden" name="id" value={transactionId} />
      
      <AlertDialog.Footer>
        <AlertDialog.Cancel type="button" disabled={isDeleting} onclick={() => { isDeleting = false; }}>
          Annuleren
        </AlertDialog.Cancel>
        <button
          type="submit"
          disabled={isDeleting}
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2"
        >
          {isDeleting ? 'Verwijderen...' : 'Verwijderen'}
        </button>
      </AlertDialog.Footer>
    </form>
  </AlertDialog.Content>
</AlertDialog.Root>