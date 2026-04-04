<?php
/**
 * index.php — MITRE ATT&CK Radial Mindmap
 *
 * Serves the application shell. No server-side rendering:
 * all visualization and data loading happens client-side via
 * D3.js + fetch('/api/data.php').
 */

// Compute live stats from data for the HUD
$dataFile = __DIR__ . '/data/data.json';
$tactics = 0; $techniques = 0; $subs = 0;

if (file_exists($dataFile)) {
    $data = json_decode(file_get_contents($dataFile), true);
    if (is_array($data)) {
        $tactics    = count($data);
        $techniques = array_sum(array_map(fn($t) => count($t['techs']), $data));
        $subs       = array_sum(array_map(
            fn($t) => array_sum(array_map(fn($te) => count($te['sub']), $t['techs'])),
            $data
        ));
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MITRE ATT·CK v18.1 — Radial Mindmap</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"
        integrity="sha384-su5kReKyYlIFrI62mbQRKXHzFobMa7BHp1cK6julLPbnYcCW9NIZKJiTODjLPeDh"
        crossorigin="anonymous"></script>
<link rel="stylesheet" href="src/styles.css">
</head>
<body>

<div id="grid"></div>

<div id="hud">
  <div id="htitle">MITRE ATT·CK v18.1</div>
  <div id="hsub">ENTERPRISE · <?= $tactics ?> TACTICS · <?= $techniques ?> TECHNIQUES · <?= $subs ?> SUB-TECHNIQUES · CLICK TO INSPECT</div>
</div>

<div id="ctrl">
  <button class="cb" onclick="resetZoom()">⊕ RESET</button>
  <button class="cb" onclick="zoomOverview()">◈ OVERVIEW</button>
  <button class="cb" onclick="zoomTo(1.2)">◉ DETAIL</button>
</div>

<div id="search-wrap">
  <input id="search" placeholder="Search technique / TID..." oninput="doSearch(this.value)">
</div>

<div id="stats">
  <div>TACTICS  <span id="ct"><?= $tactics ?></span></div>
  <div>TECHNIQUES <span id="cte"><?= $techniques ?></span></div>
  <div>SUB-TECH <span id="cs"><?= $subs ?></span></div>
</div>

<div id="canvas"><svg id="svg"></svg></div>

<div id="tt">
  <div id="tth">
    <button class="ttclose" onclick="closeTT()">✕</button>
    <div id="ttid"></div>
    <div id="tttitle"></div>
  </div>
  <div id="ttb"></div>
</div>

<div id="leg"></div>

<div id="loading">
  <span>LOADING ATT&amp;CK DATA...</span>
</div>

<!-- Renderer fetches data from /api/data.php, then builds the D3 visualization -->
<script src="src/renderer.js"></script>

</body>
</html>
