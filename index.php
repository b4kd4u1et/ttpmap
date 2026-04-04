<?php
/**
 * index.php — MITRE ATT&CK Radial Mindmap
 *
 * Serves the application shell. No server-side rendering:
 * all visualization and data loading happens client-side via
 * D3.js + fetch('api/data.php').
 *
 * Stats are hardcoded to avoid decoding the 153 KB data.json
 * on every request (shared hosting: 5 FastCGI processes per site).
 * Update these constants manually when data/data.json changes.
 */

const TACTICS    = 14;
const TECHNIQUES = 221;
const SUBS       = 538;
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
  <div id="hsub">ENTERPRISE · <?= TACTICS ?> TACTICS · <?= TECHNIQUES ?> TECHNIQUES · <?= SUBS ?> SUB-TECHNIQUES · CLICK TO INSPECT</div>
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
  <div>TACTICS  <span id="ct"><?= TACTICS ?></span></div>
  <div>TECHNIQUES <span id="cte"><?= TECHNIQUES ?></span></div>
  <div>SUB-TECH <span id="cs"><?= SUBS ?></span></div>
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
