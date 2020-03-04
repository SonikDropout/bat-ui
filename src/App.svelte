<script>
  import { STATES } from './constants';
  import ResearchSelect from './layouts/ResearchSelect';
  import BatteryResearch from './layouts/BatteryResearch';
  import EnergyResearch from './layouts/EnergyResearch';
  let state = STATES.battery;

  function selectResearch(e) {
    state = e.target.value;
  }
</script>

{#if state == STATES.battery}
  <BatteryResearch onBack={() => (state = STATES.initial)} />
{:else if state == STATES.energy}
  <EnergyResearch onBack={() => (state = STATES.initial)} />
{:else}
  <ResearchSelect on:change={selectResearch} />
{/if}
