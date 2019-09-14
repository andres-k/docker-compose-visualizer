<script>
  import { yamlToGraph, initGraph } from "./utils.js";
  let isDraggedOver = false;
  let hasFile;
  let cytoscape;
  $: hasfile = false;

  function handleDrop(event) {
    let dt = event.dataTransfer;
    let file = dt.files[0];

    let reader = new FileReader();

    reader.onload = function(e) {
      // The file's text will be printed here
      hasFile = true;
      let text = e.target.result;
      let eles = yamlToGraph(text);
      cytoscape = initGraph(eles);
    };

    reader.readAsText(file);
  }

  function exportPng() {
    let element = document.createElement("a");
    element.style = "display: none;";
    document.body.appendChild(element);

    let image = cytoscape.png({ output: "blob", bg: "white", full: true });
    let file = new Blob([image], { type: "image/png" });
    element.href = window.URL.createObjectURL(file);
    element.download = "docker-compose.png";
    element.click();
    document.body.removeChild(element);
  }
</script>

<style>
  html,
  body,
  .container,
  .row {
    height: 100%;
  }

  .dropbox {
    background: #7fdbff;
    height: 250px;
  }

  .dragged-over {
    background: #39cccc;
  }

  #cytoscape {
    height: 100%;
    width: 100%;
  }
</style>

<div class="container">
  <div class="row row-center">
    {#if !hasFile}
      <div
        class="column column-50 column-offset-25 dropbox"
        class:dragged-over={isDraggedOver}
        on:dragenter|preventDefault={() => (isDraggedOver = true)}
        on:dragleave|preventDefault={() => (isDraggedOver = false)}
        on:dragover|preventDefault
        on:drop|preventDefault={handleDrop}>
        <h3>Drop docker-compose.yml here</h3>
      </div>
    {:else}
      <button on:click={exportPng}>Export png</button>
    {/if}
    <div id="cytoscape" />

  </div>
</div>
