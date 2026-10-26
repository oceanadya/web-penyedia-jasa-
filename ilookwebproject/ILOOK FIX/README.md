# Web-ILook
Web penyedia vendor jasa.

## Hubungkan pendaftaran ke Google Sheets

1. Buat atau buka Google Spreadsheet tujuan.
2. Buka **Extensions > Apps Script**, lalu salin isi `Code.gs` ke editor Apps Script.
3. Simpan, pilih **Deploy > New deployment**, pilih tipe **Web app**.
4. Atur **Execute as** menjadi akun kamu dan **Who has access** menjadi **Anyone**.
5. Deploy, salin URL yang berakhiran `/exec`.
6. Tempel URL tersebut ke `SPREADSHEET_WEB_APP_URL` di `Index.html`.
7. Buka website, lakukan satu pendaftaran customer dan satu vendor, lalu cek sheet `Customer` dan `Vendor`.

Satu spreadsheet akan otomatis memiliki dua sheet: `Customer` untuk data customer dan `Vendor` untuk data vendor. Password tidak dikirim ke spreadsheet.

## Mode tampilan dan keranjang

- Gunakan tombol bulan/matahari di navigasi untuk mengganti mode terang dan gelap. Pilihan tema disimpan di browser.
- Dari detail vendor, pilih paket lalu tekan **Tambah ke Keranjang**. Isi keranjang tersimpan di browser yang sama; jumlah tamu untuk paket catering mengikuti batas minimum paket.
- Tombol **Pesan paket** di keranjang melanjutkan ke alur pemesanan yang sudah ada. Login tetap diperlukan untuk melanjutkan pesanan dan pembayaran.
- Keranjang dapat berisi beberapa vendor, tetapi pemesanan diproses satu paket setiap kali. Total keranjang belum memasukkan biaya layanan; biaya tersebut dihitung pada alur pemesanan.
