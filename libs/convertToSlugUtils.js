export const convertToSlug = (text) => {
    return text
        .toLowerCase() // Mengubah huruf menjadi huruf kecil
        .replace(/[^a-z0-9]+/g, '-') // Mengganti spasi dan karakter khusus dengan tanda "-"
        .replace(/^-+|-+$/g, ''); // Menghapus tanda "-" di awal atau akhir string
};