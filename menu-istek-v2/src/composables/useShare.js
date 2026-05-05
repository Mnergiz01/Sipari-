import { saveAs } from 'file-saver'
import { uzunTarih } from '@/utils/tarih'

function ozetMetni(order) {
  return [
    `📋 Sipariş — ${order.dayName}, ${uzunTarih(order.date)}`,
    `📍 ${order.location || '-'}`,
    `🛒 ${order.totalCount ?? (order.items || []).length} kalem ürün`,
    '',
    '(detay PDF\'de)'
  ].join('\n')
}

export function useShare() {
  function indir({ blob, filename }) {
    saveAs(blob, filename)
    return { method: 'download' }
  }

  async function paylas({ blob, filename, order, defaultContact }) {
    const summary = ozetMetni(order)
    const file = new File([blob], filename, { type: 'application/pdf' })

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Sipariş Listesi',
          text: summary
        })
        return { method: 'share' }
      } catch (err) {
        if (err.name === 'AbortError') return { method: 'share-cancelled' }
        // hata varsa fallback'e düş
      }
    }

    saveAs(blob, filename)
    try {
      await navigator.clipboard?.writeText(summary)
    } catch {
      /* clipboard izni yoksa sessiz geç */
    }

    if (defaultContact) {
      const num = String(defaultContact).replace(/\D/g, '')
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(summary)}`, '_blank')
      return { method: 'fallback-wa' }
    }
    return { method: 'fallback-download' }
  }

  return { paylas, indir }
}
