/**
 * Message Constants
 * Centralized messages, quotes, and text content
 */

export const MOTIVATIONAL_QUOTES = [
  "Setiap hari tanpa judol adalah kemenangan! 🎯",
  "Kamu lebih kuat dari dorongan untuk bermain! 💪",
  "Finansial sehat dimulai dari keputusan bijak hari ini 💰",
  "Progress, bukan kesempurnaan yang penting! 🌟",
  "Masa depanmu lebih cerah tanpa judol ☀️",
  "Setiap hari bersih adalah investasi untuk dirimu 🚀",
  "Kamu layak mendapat kehidupan yang lebih baik! ✨",
  "Tetap fokus pada tujuanmu, bukan gangguan sementara 🎯",
  "Keberanian untuk berubah dimulai dari hari ini 🦁",
  "Kamu tidak sendirian dalam perjalanan ini! 🤝",
] as const

export const TOAST_MESSAGES = {
  SUCCESS: {
    LOSS_ADDED: "Loss Tracked",
    WIN_ADDED: "Win Added! 🎉",
    ENTRY_UPDATED: "Entry updated successfully",
    ENTRY_DELETED: "Entry deleted successfully",
    DOWNLOAD_SUCCESS: "PnL card berhasil diunduh",
  },
  ERROR: {
    ADD_FAILED: "Gagal menambahkan entry. Coba lagi.",
    UPDATE_FAILED: "Failed to update entry",
    DELETE_FAILED: "Failed to delete entry",
    DOWNLOAD_FAILED: "Gagal mengunduh PnL card",
    AUTH_REQUIRED: "Not authenticated",
  },
  INFO: {
    CREATING_IMAGE: "Membuat gambar...",
    LOADING: "Mohon tunggu sebentar.",
  },
} as const

export const EMPTY_STATE_MESSAGES = {
  NO_LOSSES: "Belum ada data loss. Mulai tracking sekarang!",
  NO_WITHDRAWALS: "Belum ada data withdrawal. Tambahkan withdrawal pertama mu!",
  NO_TRANSACTIONS: "Belum ada transaksi yang tercatat.",
  NO_RESULTS: "Tidak ada data yang cocok dengan filter.",
} as const

export const LABEL_TEXT = {
  DEPOSIT: "Deposit",
  WITHDRAWAL: "Penarikan",
  WIN: "WIN",
  LOSS: "LOSS",
  WITHDRAW: "Withdraw",
  JUDOL: "Judol",
  CRYPTO: "Crypto",
} as const
