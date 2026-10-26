const SHEET_NAMES = {
  vendor: "Vendor",
  customer: "Customer"
};

const HEADERS = [
  "timestamp", "role", "nama", "panggilan", "pic", "email", "phone",
  "kota", "kategori", "alamat", "deskripsi", "event", "verified"
];

function doPost(e) {
  try {
    const rawData = e.parameter.data;
    if (!rawData) {
      return jsonResponse({ ok: false, error: "Data pendaftaran kosong." });
    }

    const data = JSON.parse(rawData);
    const sheet = getRegistrationSheet_(data.role);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    sheet.appendRow([
      new Date(), data.role || "", data.nama || "", data.panggilan || "",
      data.pic || "", data.email || "", data.phone || "", data.kota || "",
      data.kategori || "", data.alamat || "", data.desc || "", data.event || "",
      data.verified === false ? "FALSE" : data.verified || ""
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}

function getRegistrationSheet_(role) {
  const sheetName = SHEET_NAMES[role];
  if (!sheetName) {
    throw new Error("Jenis pendaftar tidak valid.");
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.parameter.data);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (data.type === "order") {
      let sheet = ss.getSheetByName("Orders");
      if (!sheet) {
        sheet = ss.insertSheet("Orders");
        sheet.appendRow([
          "Tanggal", "Kode", "Nama", "Email", "HP", 
          "Vendor", "Kategori", "Paket", "Tanggal Acara", 
          "Jumlah Tamu", "Catatan", "Metode Bayar", 
          "Total", "Status Bayar", "Rekening Tujuan", 
          "Link Bukti"
        ]);
      }
      
      let proofLink = "";
      if (data.proofImage && data.proofImage.startsWith("data:image")) {
        proofLink = saveImageToDrive(data.proofImage, data.code, data.proofFileName);
      }
      
      sheet.appendRow([
        new Date(),
        data.code,
        data.name,
        data.email,
        data.phone,
        data.vendor,
        data.vendorCategory,
        data.packageName,
        data.eventDate,
        data.guestCount,
        data.notes,
        data.paymentMethod,
        data.total,
        data.paymentStatus,
        data.destinationAccount,
        proofLink
      ]);
      
      return ContentService
        .createTextOutput(JSON.stringify({ status: "ok", code: data.code }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.role === "customer" || data.role === "vendor") {
      let sheet = ss.getSheetByName("Registrations");
      if (!sheet) {
        sheet = ss.insertSheet("Registrations");
        sheet.appendRow([
          "Tanggal", "Role", "Nama", "PIC", "Email", "HP", 
          "Kota", "Kategori", "Alamat", "Deskripsi", "Event"
        ]);
      }
      
      sheet.appendRow([
        new Date(),
        data.role,
        data.nama,
        data.pic || "",
        data.email,
        data.phone,
        data.kota || "",
        data.kategori || "",
        data.alamat || "",
        data.desc || "",
        data.event || ""
      ]);
      
      return ContentService
        .createTextOutput(JSON.stringify({ status: "ok" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "unknown_type" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function saveImageToDrive(base64Data, code, fileName) {
  try {
    const folderName = "ILook_Bukti_Pembayaran";
    let folder;
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }
    
    const split = base64Data.split(",");
    const contentType = split[0].match(/:(.*?);/)[1];
    const bytes = Utilities.base64Decode(split[1]);
    const blob = Utilities.newBlob(bytes, contentType, `${code}_${fileName || "bukti.jpg"}`);
    
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return file.getUrl();
  } catch (err) {
    Logger.log("Error save image: " + err);
    return "";
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "ILook API aktif" }))
    .setMimeType(ContentService.MimeType.JSON);
}

const SERVICE_FEE_MIN = 25000;
const SERVICE_FEE_MAX = 500000;
const SERVICE_FEE_LOW = 0.05;     // 5%
const SERVICE_FEE_HIGH = 0.04;    // 4%
const SERVICE_FEE_THRESHOLD_1 = 500000;
const SERVICE_FEE_THRESHOLD_2 = 5000000;

function hitungServiceFee(totalPaket) {
    let fee;
    if (totalPaket < SERVICE_FEE_THRESHOLD_1) {
        fee = SERVICE_FEE_MIN;
    } else if (totalPaket <= SERVICE_FEE_THRESHOLD_2) {
        fee = totalPaket * SERVICE_FEE_LOW;
    } else {
        fee = totalPaket * SERVICE_FEE_HIGH;
    }
    fee = Math.round(fee);
    if (fee < SERVICE_FEE_MIN) fee = SERVICE_FEE_MIN;
    if (fee > SERVICE_FEE_MAX) fee = SERVICE_FEE_MAX;
    return fee;
}