import { uzunTarih } from '@/utils/tarih'
import { slugify } from '@/utils/slug'

let pdfMakeInstance = null

async function loadPdfMake() {
  if (pdfMakeInstance) return pdfMakeInstance
  const pdfMakeMod = await import('pdfmake/build/pdfmake.js')
  const pdfFontsMod = await import('pdfmake/build/vfs_fonts.js')
  const pdfMake = pdfMakeMod.default || pdfMakeMod
  const vfs = pdfFontsMod.default?.pdfMake?.vfs
    || pdfFontsMod.pdfMake?.vfs
    || pdfFontsMod.default?.vfs
    || pdfFontsMod.vfs
  if (vfs) pdfMake.vfs = vfs
  pdfMakeInstance = pdfMake
  return pdfMake
}

// Renkler
const INK = '#0c0a09'        // ana metin
const SOFT = '#44403c'        // ikincil metin
const MUTED = '#78716c'       // küçük caption
const SUBTLE = '#a8a29e'      // çok soft
const ACCENT = '#0d6e64'      // brand teal
const HAIRLINE = '#e6e4dd'    // ince çizgi

function siparisNo(date, locationSlug) {
  // İnsan-okur "ME-2026-0505-tms" formatı
  const compact = (date || '').replace(/-/g, '')
  const last4 = compact.slice(-4)
  const yil = compact.slice(0, 4)
  return `ME-${yil}-${last4}-${(locationSlug || 'mado').slice(0, 4).toUpperCase()}`
}

function buildDocDefinition(order) {
  const filledItems = (order.items || []).filter(i => Number(i.quantity) > 0)
  const itemsByCat = new Map()
  for (const item of filledItems) {
    const key = item.categoryName || 'Diğer'
    if (!itemsByCat.has(key)) itemsByCat.set(key, [])
    itemsByCat.get(key).push(item)
  }

  const totalCount = filledItems.length
  const totalQty = filledItems.reduce((s, i) => s + Number(i.quantity || 0), 0)
  const slug = slugify(order.location || 'mado')
  const orderNo = siparisNo(order.date, slug)

  const timestampStr = new Date().toLocaleDateString('tr-TR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  // Üst bant — brand bloğu + sağda meta
  const headerBlock = {
    columns: [
      {
        width: '*',
        stack: [
          { text: 'TÜRKOĞLU MADO', style: 'brand' },
          { text: 'Günlük Sipariş Listesi', style: 'subtitle', margin: [0, 4, 0, 0] }
        ]
      },
      {
        width: 'auto',
        stack: [
          { text: orderNo, style: 'orderNo', alignment: 'right' },
          { text: timestampStr, style: 'timestamp', alignment: 'right', margin: [0, 4, 0, 0] }
        ]
      }
    ],
    margin: [0, 0, 0, 14]
  }

  // İnce ayraç + accent çubuk
  const divider = {
    canvas: [
      { type: 'rect', x: 0, y: 0, w: 40, h: 2, color: ACCENT },
      { type: 'line', x1: 44, y1: 1, x2: 515, y2: 1, lineWidth: 0.5, lineColor: HAIRLINE }
    ],
    margin: [0, 0, 0, 18]
  }

  // Meta — 3 kolon
  const metaBlock = {
    columns: [
      {
        width: '*',
        stack: [
          { text: 'TARİH', style: 'metaLabel' },
          { text: uzunTarih(order.date), style: 'metaValue', margin: [0, 3, 0, 0] },
          { text: order.dayName || '', style: 'metaSub', margin: [0, 1, 0, 0] }
        ]
      },
      {
        width: '*',
        stack: [
          { text: 'ŞUBE', style: 'metaLabel' },
          { text: order.location || '—', style: 'metaValue', margin: [0, 3, 0, 0] }
        ]
      },
      {
        width: 'auto',
        stack: [
          { text: 'TOPLAM', style: 'metaLabel', alignment: 'right' },
          {
            text: [
              { text: String(totalCount), style: 'metaBig' },
              { text: ' kalem', style: 'metaSub' }
            ],
            alignment: 'right',
            margin: [0, 3, 0, 0]
          },
          {
            text: `${totalQty} adet/kg`,
            style: 'metaSub',
            alignment: 'right',
            margin: [0, 1, 0, 0]
          }
        ]
      }
    ],
    margin: [0, 0, 0, 24]
  }

  // Kategoriler bloğu
  const categoryBlocks = []
  let firstCat = true
  for (const [catName, items] of itemsByCat) {
    if (!firstCat) {
      categoryBlocks.push({
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.4, lineColor: HAIRLINE }],
        margin: [0, 8, 0, 14]
      })
    }
    firstCat = false

    categoryBlocks.push({
      columns: [
        { text: catName.toUpperCase(), style: 'categoryTitle' },
        { text: `${items.length} ürün`, style: 'categoryCount', alignment: 'right' }
      ],
      margin: [0, 0, 0, 8]
    })

    categoryBlocks.push({
      table: {
        widths: ['*', 36, 28],
        body: items.map((it, idx) => [
          {
            text: it.productName,
            style: 'item',
            border: [false, idx === 0, false, true],
            borderColor: [HAIRLINE, HAIRLINE, HAIRLINE, HAIRLINE],
            margin: [0, 4, 0, 4]
          },
          {
            text: String(it.quantity),
            style: 'qty',
            alignment: 'right',
            border: [false, idx === 0, false, true],
            borderColor: [HAIRLINE, HAIRLINE, HAIRLINE, HAIRLINE],
            margin: [0, 4, 0, 4]
          },
          {
            text: it.unit,
            style: 'unit',
            alignment: 'left',
            border: [false, idx === 0, false, true],
            borderColor: [HAIRLINE, HAIRLINE, HAIRLINE, HAIRLINE],
            margin: [4, 4, 0, 4]
          }
        ])
      },
      layout: {
        hLineWidth: () => 0.4,
        hLineColor: () => HAIRLINE,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0
      },
      margin: [0, 0, 0, 4]
    })
  }

  // Not bloğu
  const noteBlock = order.note?.trim() ? [
    {
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: HAIRLINE }],
      margin: [0, 18, 0, 12]
    },
    { text: 'NOT', style: 'metaLabel' },
    { text: order.note, style: 'note', margin: [0, 6, 0, 0] }
  ] : []

  // Boş sipariş durumu
  if (filledItems.length === 0) {
    return {
      pageSize: 'A4',
      pageMargins: [40, 50, 40, 60],
      content: [
        headerBlock,
        divider,
        metaBlock,
        {
          text: 'Bu siparişte adet girilmiş ürün yok.',
          style: 'emptyState',
          margin: [0, 30, 0, 0]
        }
      ],
      defaultStyle: { font: 'Roboto', fontSize: 10, color: INK },
      styles: pdfStyles()
    }
  }

  return {
    pageSize: 'A4',
    pageMargins: [40, 50, 40, 60],
    content: [
      headerBlock,
      divider,
      metaBlock,
      ...categoryBlocks,
      ...noteBlock
    ],
    defaultStyle: { font: 'Roboto', fontSize: 10, color: INK },
    styles: pdfStyles(),
    footer: (currentPage, pageCount) => ({
      columns: [
        {
          text: orderNo,
          fontSize: 7.5,
          color: SUBTLE,
          characterSpacing: 0.4,
          margin: [40, 20, 0, 0]
        },
        {
          text: `${currentPage} / ${pageCount}`,
          fontSize: 7.5,
          color: SUBTLE,
          alignment: 'right',
          margin: [0, 20, 40, 0]
        }
      ]
    })
  }
}

function pdfStyles() {
  return {
    brand: {
      fontSize: 22,
      bold: true,
      characterSpacing: 0.5,
      color: INK
    },
    subtitle: {
      fontSize: 9,
      color: MUTED,
      characterSpacing: 1.5
    },
    orderNo: {
      fontSize: 9,
      color: ACCENT,
      bold: true,
      characterSpacing: 0.6
    },
    timestamp: {
      fontSize: 8,
      color: SUBTLE
    },
    metaLabel: {
      fontSize: 7.5,
      color: MUTED,
      bold: true,
      characterSpacing: 1.4
    },
    metaValue: {
      fontSize: 11,
      color: INK,
      bold: true
    },
    metaBig: {
      fontSize: 16,
      color: ACCENT,
      bold: true
    },
    metaSub: {
      fontSize: 9,
      color: SOFT
    },
    categoryTitle: {
      fontSize: 10,
      bold: true,
      color: ACCENT,
      characterSpacing: 1.6
    },
    categoryCount: {
      fontSize: 8,
      color: SUBTLE,
      characterSpacing: 0.6
    },
    item: {
      fontSize: 10,
      color: INK
    },
    qty: {
      fontSize: 11,
      color: INK,
      bold: true
    },
    unit: {
      fontSize: 8,
      color: MUTED
    },
    note: {
      fontSize: 10,
      italics: true,
      color: SOFT,
      lineHeight: 1.4
    },
    emptyState: {
      fontSize: 10,
      color: MUTED,
      italics: true,
      alignment: 'center'
    }
  }
}

export function usePdfGenerator() {
  async function generate(order) {
    const pdfMake = await loadPdfMake()
    const docDef = buildDocDefinition(order)
    const filename = `siparis-${order.date}-${slugify(order.location || 'mado')}.pdf`
    return new Promise((resolve, reject) => {
      try {
        pdfMake.createPdf(docDef).getBlob((blob) => {
          resolve({ blob, filename })
        })
      } catch (err) {
        reject(err)
      }
    })
  }
  return { generate }
}
