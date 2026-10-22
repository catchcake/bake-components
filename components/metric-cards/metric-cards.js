customElements.define("metric-cards", class extends HTMLElement {
  connectedCallback() {
    try {
      const { props = {}, data } = window.Bake.component(this)

      if (!data) {
        throw new Error("Missing component query data")
      }

      const shell = window.Bake.ui.createShell({ title: props.title })
      shell.body.appendChild(renderCards(data))

      if (props.note) {
        const note = document.createElement("p")
        note.className = "metric-note"
        note.textContent = props.note
        shell.body.appendChild(note)
      }

      const style = document.createElement("style")
      style.textContent = `
        metric-cards .metric-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
          gap: 1rem;
        }

        metric-cards .metric-card {
          padding: 1rem;
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          background: #fff;
        }

        metric-cards .metric-label {
          color: var(--muted);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        metric-cards .metric-value {
          margin-top: 0.35rem;
          font-size: 1.8rem;
          font-weight: 750;
          line-height: 1.1;
        }

        metric-cards .metric-change {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          font-weight: 650;
        }

        metric-cards .metric-change.positive { color: #15803d; }
        metric-cards .metric-change.negative { color: #b91c1c; }
        metric-cards .metric-note {
          margin: 1rem 0 0;
          color: var(--muted);
          font-size: 0.9rem;
        }
      `

      window.Bake.ui.render(this, [style, shell.root])
    } catch (error) {
      window.Bake.ui.renderError(this, error)
    }
  }
})

function renderCards(data) {
  const grid = document.createElement("div")
  grid.className = "metric-grid"
  const rows = data.rows || []

  for (const row of rows) {
    const record = rowObject(data.columns, row)
    const card = document.createElement("article")
    card.className = "metric-card"

    const label = document.createElement("div")
    label.className = "metric-label"
    label.textContent = record.metric

    const value = document.createElement("div")
    value.className = "metric-value"
    value.textContent = formatValue(record.value, record.unit)

    const change = document.createElement("div")
    const direction = Number(record.change_pct) >= 0 ? "positive" : "negative"
    change.className = `metric-change ${direction}`
    change.textContent = `${Number(record.change_pct) >= 0 ? "+" : ""}${record.change_pct}% vs prior period`

    card.append(label, value, change)
    grid.appendChild(card)
  }

  return grid
}

function rowObject(columns, row) {
  const object = {}
  columns.forEach((column, index) => {
    object[column] = row[index]
  })
  return object
}

function formatValue(value, unit) {
  const number = Number(value)
  const formatted = Number.isInteger(number)
    ? number.toLocaleString()
    : number.toLocaleString(undefined, { maximumFractionDigits: 2 })

  return unit ? `${formatted} ${unit}` : formatted
}
