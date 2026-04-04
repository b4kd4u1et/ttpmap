/**
 * renderer.js — D3 Radial Tree renderer for MITRE ATT&CK mindmap
 *
 * Fetches data from /api/data.php, then builds the visualization.
 * No global DATA variable — all logic scoped inside the fetch callback.
 *
 * Customisation points:
 *   - Modify TACTIC_RADII / TECH_RADII to adjust layout density
 *   - Replace showTT() for custom tooltip content
 *   - Add new node.on('click') handlers for custom interactions
 */

fetch('api/data.php')
  .then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  })
  .then(DATA => {
    document.getElementById('loading').style.display = 'none';
    init(DATA);
  })
  .catch(err => {
    const el = document.getElementById('loading');
    el.innerHTML = `<span style="color:#ff4d6d">FAILED TO LOAD DATA: ${err.message}</span>`;
  });

function init(DATA) {

// BUILD D3 RADIAL TREE
// ════════════════════════════════════════════════════════════════════════════
const W = window.innerWidth, H = window.innerHeight;

// Flatten to hierarchy: root → tactic → technique → sub-technique
const root_d = {
  id: 'root', name: 'ATT·CK', type: 'root',
  children: DATA.map(t => ({
    id: t.id, name: t.name, color: t.color, type: 'tactic', desc: t.desc,
    children: t.techs.map(te => ({
      id: te.id, name: te.name, color: t.color, type: 'technique',
      tactic: t.name, tacticId: t.id, desc: te.desc,
      cmds: te.cmds || [], mits: te.mits || [],
      children: (te.sub || []).map(s => ({
        id: s.id, name: s.name, color: t.color, type: 'subtechnique',
        tactic: t.name, parentId: te.id, parentName: te.name
      }))
    }))
  }))
};

const svg = d3.select('#svg').attr('width', W).attr('height', H);
const g   = svg.append('g').attr('transform', `translate(${W/2},${H/2})`);

const zoom = d3.zoom().scaleExtent([.08, 4])
  .on('zoom', e => g.attr('transform', e.transform.translate(W/2, H/2)));
svg.call(zoom);

const tree = d3.tree().size([2 * Math.PI, Math.min(W, H) * .42])
  .separation((a, b) => (a.parent === b.parent ? (a.depth > 1 ? 0.65 : 1) : (a.depth > 1 ? 1.2 : 2)) / a.depth);

const hier = d3.hierarchy(root_d);
tree(hier);

const linkGen = d3.linkRadial().angle(d => d.x).radius(d => d.y);

g.selectAll('.link').data(hier.links()).join('path')
  .attr('class', 'link').attr('d', linkGen)
  .attr('stroke', d => d.target.data.color || '#334')
  .attr('stroke-width', d => d.target.depth === 1 ? 1.8 : d.target.depth === 2 ? .9 : .5)
  .attr('stroke-dasharray', d => d.target.depth === 3 ? '3,3' : 'none');

const node = g.selectAll('.node').data(hier.descendants()).join('g')
  .attr('class', 'node')
  .attr('transform', d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
  .on('click', (e, d) => { e.stopPropagation(); showTT(d.data); });

// ROOT
node.filter(d => d.depth === 0).append('circle')
  .attr('r', 42).attr('fill', '#060e20')
  .attr('stroke', '#00c8ff').attr('stroke-width', 2.5)
  .style('filter', 'drop-shadow(0 0 20px #00c8ff88)');
node.filter(d => d.depth === 0).append('text')
  .attr('text-anchor', 'middle').attr('dy', '-.1em')
  .attr('font-size', '12px').attr('font-weight', '900')
  .attr('fill', '#00c8ff').attr('font-family', 'Orbitron,monospace').text('MITRE');
node.filter(d => d.depth === 0).append('text')
  .attr('text-anchor', 'middle').attr('dy', '1.1em')
  .attr('font-size', '12px').attr('font-weight', '900')
  .attr('fill', '#00c8ff').attr('font-family', 'Orbitron,monospace').text('ATT·CK');
node.filter(d => d.depth === 0).append('text')
  .attr('text-anchor', 'middle').attr('dy', '2.5em')
  .attr('font-size', '7px').attr('fill', 'rgba(0,200,255,.45)')
  .attr('font-family', 'Share Tech Mono,monospace').text('v18.1');

// TACTICS
const tNode = node.filter(d => d.depth === 1);
tNode.append('circle').attr('r', 22)
  .attr('fill', d => d.data.color + '28')
  .attr('stroke', d => d.data.color).attr('stroke-width', 2)
  .style('filter', d => `drop-shadow(0 0 7px ${d.data.color}88)`);
tNode.each(function(d) {
  const el = d3.select(this), ang = d.x * 180 / Math.PI - 90;
  const isR = (ang > -90 && ang < 90), words = d.data.name.split(/\s+/);
  words.forEach((w, i) => {
    el.append('text')
      .attr('transform', `rotate(${isR ? 0 : 180})`)
      .attr('text-anchor', 'middle')
      .attr('dy', `${(i - (words.length - 1) / 2) * 1.05 + .35}em`)
      .attr('font-size', words.length > 2 ? '6.8px' : '7.8px').attr('font-weight', '700')
      .attr('fill', '#fff').attr('font-family', 'Rajdhani,sans-serif').text(w);
  });
});

// TECHNIQUES
const teNode = node.filter(d => d.depth === 2);
teNode.append('circle').attr('r', 5)
  .attr('fill', d => d.data.color + '55')
  .attr('stroke', d => d.data.color).attr('stroke-width', 1.5)
  .style('filter', d => `drop-shadow(0 0 4px ${d.data.color}66)`);
teNode.each(function(d) {
  const el = d3.select(this), ang = d.x * 180 / Math.PI - 90;
  const isR = (ang > -90 && ang < 90);
  el.append('text')
    .attr('transform', `rotate(${isR ? 0 : 180})`)
    .attr('text-anchor', isR ? 'start' : 'end')
    .attr('dx', isR ? 9 : -9).attr('dy', '.32em')
    .attr('font-size', '7px').attr('font-family', 'Rajdhani,sans-serif')
    .attr('fill', d => d.data.color)
    .attr('stroke', '#03050f').attr('stroke-width', '3px')
    .text(d => `${d.data.id} ${d.data.name}`);
});

// SUB-TECHNIQUES
const sNode = node.filter(d => d.depth === 3);
sNode.append('circle').attr('r', 2.8)
  .attr('fill', d => d.data.color + '80')
  .attr('stroke', d => d.data.color + 'aa').attr('stroke-width', .8);
sNode.each(function(d) {
  const el = d3.select(this), ang = d.x * 180 / Math.PI - 90;
  const isR = (ang > -90 && ang < 90);
  el.append('text')
    .attr('transform', `rotate(${isR ? 0 : 180})`)
    .attr('text-anchor', isR ? 'start' : 'end')
    .attr('dx', isR ? 6 : -6).attr('dy', '.32em')
    .attr('font-size', '5.5px').attr('font-family', 'Share Tech Mono,monospace')
    .attr('fill', d => d.data.color + 'bb')
    .attr('stroke', '#03050f').attr('stroke-width', '2.5px')
    .text(d => `${d.data.parentId}${d.data.id} ${d.data.name}`);
});

// ════════════════════════════════════════════════════════════════════════════
// TOOLTIP
// ════════════════════════════════════════════════════════════════════════════
function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

function showTT(data) {
  if (data.type === 'root') return;
  const tt = document.getElementById('tt');
  document.getElementById('tth').style.borderBottomColor = (data.color || '#00c8ff') + '55';
  document.getElementById('ttid').textContent = data.id || '';
  const titleEl = document.getElementById('tttitle');
  titleEl.textContent = data.name;
  titleEl.style.color = data.color || '#00c8ff';
  let html = '';

  if (data.type === 'tactic') {
    html += `<div class="ts"><div class="tl">◈ Description</div><div class="td">${esc(data.desc)}</div></div>`;
    const techs = DATA.find(t => t.id === data.id)?.techs || [];
    html += `<div class="ts"><div class="tl">◈ Techniques (${techs.length})</div>`;
    techs.forEach(te => {
      html += `<div class="tsub"><span class="tsub-id" style="color:${data.color}">${te.id}</span><span class="tsub-name">${te.name}</span></div>`;
    });
    html += '</div>';
  } else if (data.type === 'technique') {
    html += `<div class="ts"><div class="tl">◈ Tactic</div><div class="td" style="color:${data.color}">${data.tactic}</div></div>`;
    html += `<div class="ts"><div class="tl">◈ Description</div><div class="td">${esc(data.desc)}</div></div>`;
    if (data.cmds && data.cmds.length) {
      html += `<div class="ts"><div class="tl">◈ Commands (${data.cmds.length})</div>`;
      data.cmds.forEach(c => {
        html += `<div class="tc">${esc(c.c)}</div>`;
        if (c.n) html += `<div class="tn">${esc(c.n)}</div>`;
      });
      html += '</div>';
    }
    const tData = DATA.find(t => t.id === data.tacticId)?.techs?.find(te => te.id === data.id);
    if (tData?.sub && tData.sub.length) {
      html += `<div class="ts"><div class="tl">◈ Sub-techniques (${tData.sub.length})</div>`;
      tData.sub.forEach(s => {
        html += `<div class="tsub"><span class="tsub-id" style="color:${data.color}">${data.id}${s.id}</span><span class="tsub-name">${s.name}</span></div>`;
      });
      html += '</div>';
    }
  } else if (data.type === 'subtechnique') {
    html += `<div class="ts"><div class="tl">◈ Parent Technique</div><div class="td" style="color:${data.color}">${data.parentId} ${data.parentName}</div></div>`;
    html += `<div class="ts"><div class="tl">◈ Tactic</div><div class="td">${data.tactic}</div></div>`;
    html += `<div class="ts"><div class="tl">◈ Full ID</div><div class="td" style="color:${data.color};font-family:Share Tech Mono,monospace">${data.parentId}${data.id}</div></div>`;
  }

  document.getElementById('ttb').innerHTML = html;
  tt.style.display = 'block';
}

function closeTT() { document.getElementById('tt').style.display = 'none'; }
svg.on('click', closeTT);

// ════════════════════════════════════════════════════════════════════════════
// SEARCH
// ════════════════════════════════════════════════════════════════════════════
function doSearch(q) {
  q = q.toLowerCase().trim();
  if (!q) {
    g.selectAll('.node').style('opacity', 1);
    return;
  }
  g.selectAll('.node').style('opacity', function(d) {
    if (d.depth === 0) return 1;
    const id   = (d.data.id   || '').toLowerCase();
    const name = (d.data.name || '').toLowerCase();
    if (id.includes(q) || name.includes(q)) return 1;
    if (d.depth === 3) {
      const full = (d.data.parentId + (d.data.id || '')).toLowerCase();
      if (full.includes(q)) return 1;
    }
    return .08;
  });
}
// expose for oninput handler on the input element
window.doSearch = doSearch;

// ════════════════════════════════════════════════════════════════════════════
// CONTROLS
// ════════════════════════════════════════════════════════════════════════════
window.resetZoom = () => svg.transition().duration(600).call(zoom.transform, d3.zoomIdentity);
window.zoomTo    = s  => svg.transition().duration(600).call(zoom.transform, d3.zoomIdentity.scale(s));

// ════════════════════════════════════════════════════════════════════════════
// LEGEND
// ════════════════════════════════════════════════════════════════════════════
const leg = document.getElementById('leg');
DATA.forEach(t => {
  const el = document.createElement('div');
  el.className = 'li';
  el.innerHTML = `<div class="ld" style="background:${t.color}"></div>${t.name}`;
  el.onclick = () => {
    const d = hier.descendants().find(n => n.data.id === t.id);
    if (d) showTT(d.data);
  };
  leg.appendChild(el);
});

} // end init()
