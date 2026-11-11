const SPACE_LIST = [
  ['A-3A','Bloque A','Aula 3A'],['A-4A','Bloque A','Aula 4A'],['A-5A','Bloque A','Aula 5A'],
  ['A-CRO','Bloque A','Lab Croma'],['A-ANA','Bloque A','Lab. Analógico'],['A-FOT','Bloque A','Lab. Fotografía'],['A-SON','Bloque A','Lab. Sonido'],
  ['B-AUD','Bloque B','Auditorio'],['B-1B','Bloque B','Aula 1B'],['B-2B','Bloque B','Aula 2B'],['B-3B','Bloque B','Aula 3B'],['B-4B','Bloque B','Aula 4B'],['B-5B','Bloque B','Aula 5B'],['B-6B','Bloque B','Aula 6B'],['B-7B','Bloque B','Aula 7B'],['B-MOD','Bloque B','Lab. Producción de Moda'],['B-BIB','Bloque B','Biblioteca'],['B-CON','Bloque B','Confección · Lab. Producción de Modas'],['B-PAT','Bloque B','Patronaje · Lab. Producción de Modas'],
  ['C-1C','Bloque C','Aula 1C'],['C-2C','Bloque C','Aula 2C'],['C-3C','Bloque C','Aula 3C'],['C-4C','Bloque C','Aula 4C'],['C-5C','Bloque C','Aula 5C'],['C-7C','Bloque C','Aula 7C'],['C-8C','Bloque C','Aula 8C'],['C-TEC1','Bloque C','Isla TEC1 Gaming'],['C-TEC2','Bloque C','Isla TEC2 Mac'],['C-TEC3','Bloque C','Isla TEC3 Tabletas'],['C-TEC4','Bloque C','Isla TEC4 Lenovo'],['C-TEC5','Bloque C','Isla TEC5 MSI'],['C-TEC6','Bloque C','Isla TEC6 Alien'],
  ['EXT-FAB','Espacios independientes','FABLAB'],['EXT-GAL','Espacios independientes','Galería OVER'],['EXT-TM','Espacios independientes','Taller de Modelos']
];

const PROP_SHEET_ID = 'INSPECCIONES_SPREADSHEET_ID';
const PROP_FOLDER_ID = 'INSPECCIONES_DRIVE_FOLDER_ID';
const RECORD_HEADERS = ['ID','Fecha de guardado','Código del espacio','Bloque / grupo','Espacio','Inspector','Correo de cuenta','Prioridad mobiliario','Acción mobiliario','Prioridad condiciones','Acción condiciones','Archivo ficha','Fotos'];
const HISTORY_HEADERS = ['ID de registro','Fecha de guardado','Código del espacio','Usuario','Resumen de cambios','Archivo ficha'];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Inventario y diagnóstico de aulas · La Metro')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getSpaces() {
  return SPACE_LIST.map(([id, group, name]) => ({id, group, name}));
}

// Ejecutar una vez desde Apps Script para crear la hoja y las carpetas en Drive.
function setupStorage() {
  const props = PropertiesService.getScriptProperties();
  let folderId = props.getProperty(PROP_FOLDER_ID);
  let folder = folderId ? DriveApp.getFolderById(folderId) : null;
  if (!folder) {
    folder = DriveApp.createFolder('La Metro - Inventario de aulas');
    props.setProperty(PROP_FOLDER_ID, folder.getId());
  }

  let spreadsheetId = props.getProperty(PROP_SHEET_ID);
  let spreadsheet = spreadsheetId ? SpreadsheetApp.openById(spreadsheetId) : null;
  if (!spreadsheet) {
    spreadsheet = SpreadsheetApp.create('La Metro - Consolidado de inspecciones de aulas');
    props.setProperty(PROP_SHEET_ID, spreadsheet.getId());
    DriveApp.getFileById(spreadsheet.getId()).moveTo(folder);
  }

  ensureSheet_(spreadsheet, 'Inspecciones', RECORD_HEADERS);
  ensureSheet_(spreadsheet, 'Historial', HISTORY_HEADERS);
  const defaultSheet = spreadsheet.getSheetByName('Sheet1');
  if (defaultSheet && spreadsheet.getSheets().length > 2 && defaultSheet.getLastRow() === 0) {
    spreadsheet.deleteSheet(defaultSheet);
  }
  return {spreadsheetUrl: spreadsheet.getUrl(), driveFolderUrl: folder.getUrl()};
}

function ensureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function saveInspection(data, photos) {
  if (!data || !data.space) throw new Error('Selecciona el espacio inspeccionado.');
  const space = SPACE_LIST.find(item => item[0] === data.space);
  if (!space) throw new Error('El espacio seleccionado no está en el catálogo aprobado.');

  const props = PropertiesService.getScriptProperties();
  const folderId = props.getProperty(PROP_FOLDER_ID);
  const spreadsheetId = props.getProperty(PROP_SHEET_ID);
  if (!folderId || !spreadsheetId) throw new Error('Falta la configuración inicial. Ejecuta setupStorage() desde Apps Script.');

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const root = DriveApp.getFolderById(folderId);
    const evidence = getOrCreateFolder_(root, 'Fotos de inspección');
    const now = new Date();
    const recordId = Utilities.getUuid();
    const stamp = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
    const savedPhotos = savePhotos_(evidence, photos || [], recordId, stamp);
    const email = Session.getActiveUser().getEmail() || '';
    const record = Object.assign({}, data, {
      id: recordId,
      fechaGuardado: now.toISOString(),
      grupo: space[1],
      espacio: space[2],
      usuario: email,
      fotos: savedPhotos
    });

    const jsonFile = root.createFile(
      `${space[0]}_${stamp}_${recordId.slice(0, 8)}.json`,
      JSON.stringify(record, null, 2),
      'application/json'
    );

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ensureSheet_(spreadsheet, 'Inspecciones', RECORD_HEADERS);
    sheet.appendRow([
      recordId, now, space[0], space[1], space[2], data.inspector || '', email,
      data['mobiliario-prioridad'] || '', data['mobiliario-accion'] || '',
      data['infraestructura-prioridad'] || '', data['infraestructura-accion'] || '',
      jsonFile.getUrl(), savedPhotos.map(photo => photo.url).join('\n')
    ]);

    const history = ensureSheet_(spreadsheet, 'Historial', HISTORY_HEADERS);
    history.appendRow([
      recordId, now, space[0], email || data.inspector || '',
      `Nueva inspección guardada para ${space[2]}`, jsonFile.getUrl()
    ]);
    return {ok: true, recordId, spreadsheetUrl: spreadsheet.getUrl(), fileUrl: jsonFile.getUrl(), photos: savedPhotos};
  } finally {
    lock.releaseLock();
  }
}

function getOrCreateFolder_(parent, name) {
  const folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parent.createFolder(name);
}

function savePhotos_(folder, photos, recordId, stamp) {
  if (photos.length > 5) throw new Error('Puedes adjuntar hasta 5 fotos por inspección.');
  return photos.map((photo, index) => {
    if (!photo || !photo.dataUrl || !/^data:image\/(png|jpeg|webp);base64,/i.test(photo.dataUrl)) {
      throw new Error('Una de las fotos tiene un formato no compatible. Usa JPG, PNG o WebP.');
    }
    const parts = photo.dataUrl.split(',');
    const bytes = Utilities.base64Decode(parts[1]);
    if (bytes.length > 4 * 1024 * 1024) throw new Error('Cada foto debe pesar menos de 4 MB.');
    const type = photo.dataUrl.match(/^data:(image\/(?:png|jpeg|webp));/i)[1];
    const ext = type === 'image/jpeg' ? 'jpg' : type.split('/')[1];
    const name = `${stamp}_${recordId.slice(0, 8)}_${index + 1}.${ext}`;
    const file = folder.createFile(Utilities.newBlob(bytes, type, name));
    return {name, type, url: file.getUrl()};
  });
}
