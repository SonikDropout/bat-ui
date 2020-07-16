<script>
  import { STATES } from './constants';
  import ResearchSelect from './layouts/ResearchSelect';
  import BatteryResearch from './layouts/BatteryResearch';
  import EnergyResearch from './layouts/EnergyResearch';
  import Version from './atoms/Version';
  let state = STATES.initial;

  function selectResearch(e) {
    state = e.target.value;
  }
</script>

{#if state == STATES.initial}
  <ResearchSelect on:change={selectResearch} />
{:else if state == STATES.energy}
  <EnergyResearch onBack={() => (state = STATES.initial)} />
{/if}
<BatteryResearch onBack={() => (state = STATES.initial)} />
<Version />
