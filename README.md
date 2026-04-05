# MITRE ATT·CK v18.1 — Radial Mindmap

Interactive radial tree visualization of the full MITRE ATT&CK Enterprise Matrix.

**14 Tactics · 221 Techniques · 538 Sub-techniques**

---

## Project Structure

```
ttpmap/
├── index.php           # HTML shell — outputs live stats from constants
├── api/
│   └── data.php        # JSON endpoint → serves data/data.json
├── data/
│   └── data.json       # Full ATT&CK v18.1 dataset (14 tactics, 221 techniques)
├── src/
│   ├── renderer.js     # D3 radial tree layout + interactions (client-side)
│   └── styles.css      # Dark terminal theme + UI components
└── .htaccess           # Blocks direct access to data/, disables directory listing
```

---

## Running

```bash
php -S localhost:8080
# Then open: http://localhost:8080
```

> **Note:** Must be served via HTTP — `file://` URLs block `fetch()` in modern browsers.

---

## How It Works

1. Browser loads `index.php` (HTML shell)
2. `renderer.js` fetches `api/data.php` → receives JSON
3. D3.js builds the radial tree entirely client-side
4. No server-side rendering — PHP only serves files

---

## Editing the Data

All ATT&CK data lives in **`data/data.json`**. Schema:

```
Tactic {
  id:    string        // "TA0043"
  name:  string        // "Reconnaissance"
  color: string        // "#ff4d6d" (hex)
  desc:  string        // one-line description
  techs: Technique[]
}

Technique {
  id:   string         // "T1595"
  name: string         // "Active Scanning"
  desc: string         // description
  sub:  SubTechnique[] // may be empty []
  cmds: Command[]
}

SubTechnique {
  id:   string         // ".001"  (prepend parent id for full id: "T1595.001")
  name: string
}

Command {
  c: string            // shell command
  n: string            // explanation / note
}
```

### Add a technique

Find the tactic block in `data/data.json` and add to its `techs` array:

```json
{
  "id": "T1234",
  "name": "My New Technique",
  "desc": "What the adversary does and why.",
  "sub": [
    { "id": ".001", "name": "Sub-technique One" }
  ],
  "cmds": [
    { "c": "command --flag value", "n": "What this command does" }
  ]
}
```

### Add a tactic

Append to the root array in `data/data.json`:

```json
{
  "id": "TA9999",
  "name": "New Tactic",
  "color": "#ab12cd",
  "desc": "One-line description.",
  "techs": []
}
```

After editing `data/data.json`, update the three constants in `index.php`:

```php
const TACTICS    = 14;
const TECHNIQUES = 221;
const SUBS       = 538;
```

### Change visual theme

In `src/styles.css`, edit the `:root` block:

```css
:root {
  --bg:    #03050f;              /* canvas background     */
  --glow:  #00c8ff;              /* accent / highlight    */
  --panel: rgba(4,10,28,.97);    /* tooltip background    */
}
```

### Adjust radial layout spacing

The tree radius is computed automatically in `src/renderer.js`:

```js
// 10 px of arc per leaf node — increase for more spacing
const treeRadius = Math.max(
  Math.min(W, H) * 0.42,
  (leafCount * 10) / (2 * Math.PI)
);
```

Change `10` to a larger value for more spacing between outer nodes.

---

## Source

- MITRE ATT&CK v18.1: https://attack.mitre.org
- Data verified: April 2025
- ATT&CK content © MITRE (CC BY 4.0)
