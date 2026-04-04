# MITRE ATT·CK v18.1 — Radial Mindmap

Interactive radial tree visualization of the full MITRE ATT&CK Enterprise Matrix.

**14 Tactics · 216 Techniques · 475 Sub-techniques**

---

## Project Structure

```
mitre-mindmap/
├── index.html          # Shell: HTML layout + script tags only
├── src/
│   ├── data.js         # ← ALL ATT&CK data lives here
│   ├── renderer.js     # D3 radial tree layout + interactions
│   └── styles.css      # Dark terminal theme + UI components
└── README.md
```

---

## Running

```bash
# Any static server works — pick one:
python3 -m http.server 8080
npx serve .
npx http-server . -p 8080

# Then open:
# http://localhost:8080
```

> **Note:** Must be served via HTTP — `file://` URLs block `<script src>` loading
> in modern browsers. Use one of the servers above.

---

## Claude Code Tasks

### Add a new technique

In `src/data.js`, find the tactic block and add to its `techs` array:

```js
{
  id: "T1234",
  name: "My New Technique",
  desc: "What the adversary does and why.",
  sub: [
    { id: ".001", name: "Sub-technique One" },
    { id: ".002", name: "Sub-technique Two" }
  ],
  cmds: [
    { c: "command --flag value",       n: "What this command does" },
    { c: "another-tool -x target.com", n: "Second command note" }
  ]
}
```

### Add a new tactic

Append to the `DATA` array in `src/data.js`:

```js
{
  id: "TA9999",
  name: "New Tactic",
  color: "#ab12cd",          // any hex color
  desc: "One-line description.",
  techs: [ /* technique objects */ ]
}
```

### Change visual theme

In `src/styles.css`, edit the `:root` block:

```css
:root {
  --bg:   #03050f;     /* canvas background */
  --glow: #00c8ff;     /* accent / highlight color */
  --panel: rgba(4,10,28,.97); /* tooltip panel background */
}
```

### Adjust radial layout spacing

In `src/renderer.js`, find the `d3.tree()` call:

```js
const tree = d3.tree()
  .size([2 * Math.PI, Math.min(W, H) * 0.42])  // ← change 0.42 for radius
  .separation((a, b) => (
    a.parent === b.parent
      ? (a.depth > 1 ? 0.65 : 1)
      : (a.depth > 1 ? 1.2  : 2)
  ) / a.depth);
```

### Export data as JSON / CSV

Open browser DevTools console on the running page:

```js
// JSON — full tree
copy(JSON.stringify(DATA, null, 2))

// CSV flat list — paste into spreadsheet
const rows = toFlatList();
const csv = [Object.keys(rows[0]).join(','),
  ...rows.map(r => Object.values(r).map(v => `"${v ?? ''}"`).join(','))
].join('\n');
copy(csv);

// Search all techniques matching a query
search('powershell').forEach(r => console.log(r.id, r.name));

// Get single technique with all metadata
console.log(getTechnique('T1059'));
```

### Programmatic query (Node.js / Claude Code)

```js
// In a .mjs file or with "type":"module" in package.json:
// NOTE: strip the browser-specific renderer, keep only data.js logic

const { DATA } = await import('./src/data.js'); // after adding exports

// Count all techniques
const count = DATA.reduce((n, t) => n + t.techs.length, 0);

// All techniques with commands
const withCmds = DATA.flatMap(t =>
  t.techs.filter(te => te.cmds?.length > 0)
);

// Find by ID
const creds = DATA.find(t => t.id === 'TA0006');
```

---

## Data Schema

```
DATA: Tactic[]

Tactic {
  id:    string   // "TA0043"
  name:  string   // "Reconnaissance"
  color: string   // "#ff4d6d" (hex)
  desc:  string   // one-line description
  techs: Technique[]
}

Technique {
  id:   string    // "T1595"
  name: string    // "Active Scanning"
  desc: string    // multi-sentence description
  sub:  SubTechnique[]
  cmds: Command[]
}

SubTechnique {
  id:   string    // ".001" (suffix — prepend parent id for full id)
  name: string    // "Scanning IP Blocks"
}

Command {
  c: string       // actual shell command
  n: string       // human note / explanation
}
```

---

## Helper Functions (available in browser console)

| Function | Returns |
|---|---|
| `getTechnique(tid)` | Technique object with tactic metadata |
| `getTactic(taId)` | Tactic object |
| `search(query)` | `Array<Technique\|SubTechnique>` matching name/ID |
| `toFlatList()` | Flat array for CSV/spreadsheet export |
| `allTechniqueIds` | `string[]` of all T-IDs |
| `allSubIds` | `string[]` of all full sub-IDs (e.g. `"T1548.001"`) |

---

## Source

- MITRE ATT&CK v18.1: https://attack.mitre.org
- Verified: April 2025
- License: ATT&CK content © MITRE (CC BY 4.0)
