/**
 * The usage ledger and its derived remainder
 *
 * The figure for "Nano-dollars": a credit lot is consumed by signed ledger
 * entries, and the lot's remaining balance is a fold over those entries —
 * drawn dashed, outside both records, because it is never stored. Faithful
 * to the billing engine's data-model overview (the corrected design: no
 * mutable remaining column anywhere; account-scoped stamps like
 * balance_after are deliberately omitted so nothing reads as a stored
 * remainder).
 */

import {defineDiagram} from "../lib/diagrams";

/**
 * Top edge of the two entity records.
 */
const TOP = 32;

/**
 * Left column: the credit lot.
 */
const LOT_X = 28;

/**
 * Right column: the ledger entries, with the derived remainder below.
 */
const LEDGER_X = 392;

/**
 * Shared record width (4.5 modules).
 */
const RECORD_W = 252;

/**
 * Top edge of the derived-remainder box.
 */
const REMAINING_Y = 232;

export const ledger = defineDiagram({
  id: "ledger",
  size: [672, 320],
  ariaLabel:
    "The usage ledger: a credit lot is consumed by signed ledger entries, and the lot's remaining balance is derived from the entries – never stored.",
  scene(d) {
    const lot = d.entity("credit_lot", {
      title: "credit_lot",
      x: LOT_X,
      y: TOP,
      w: RECORD_W,
      fields: [
        {name: "id", note: "pk"},
        {name: "source"},
        {name: "amount_nanodollars", note: "immutable"},
        {name: "expires_at"},
      ],
    });
    const entries = d.entity("ledger_entry", {
      title: "ledger_entry",
      x: LEDGER_X,
      y: TOP,
      w: RECORD_W,
      fields: [
        {name: "id", note: "pk"},
        {name: "sequence", note: "commit order"},
        {name: "entry_type"},
        {name: "amount_nanodollars", note: "signed"},
        {name: "lot_id", note: "fk"},
      ],
    });

    d.edge(lot, entries, {
      label: "consumed by",
      labelAt: {x: d.cx, y: 84},
      labelAnchor: "middle",
    });
    d.text("1 → n", {x: d.cx, y: 136, anchor: "middle"});

    // The remainder: dashed because it is not a record — nothing in the
    // schema stores it. The highlight label borrows the card grammar.
    const remaining = d.actor("remaining", {
      title: "remaining",
      sub: "Σ of the lot's entries",
      x: LEDGER_X,
      y: REMAINING_Y,
      w: RECORD_W,
      h: 64,
      align: "start",
      dashed: true,
      badge: {text: "derived"},
    });
    d.edge(entries, remaining, {dash: true});
    d.label("never stored", {
      x: LEDGER_X + RECORD_W,
      y: REMAINING_Y - 8,
      anchor: "end",
      ink: "highlight",
    });

    d.note("integer nanodollars", {corner: "ne"});
  },
});
