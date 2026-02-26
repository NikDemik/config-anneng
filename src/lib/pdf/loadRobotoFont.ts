import { jsPDF } from 'jspdf';

export async function loadRobotoFont(doc: jsPDF) {
    const fontUrl = '/fonts/roboto/Roboto-Regular.ttf';

    const response = await fetch(fontUrl);
    const fontBuffer = await response.arrayBuffer();

    const fontBase64 = arrayBufferToBase64(fontBuffer);

    doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
}
