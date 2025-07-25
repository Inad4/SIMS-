import { Equipment, EquipmentStatus } from "@/types/equipment";
import { RequestStatus } from "@/types/request";

export function getConditionColor(status: EquipmentStatus | RequestStatus): string {
    switch (status) {
        case EquipmentStatus.AVAILABLE:
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case EquipmentStatus.CHECKED_OUT:
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case EquipmentStatus.UNDER_REPAIR:
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case EquipmentStatus.RETIRED:
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case RequestStatus.PENDING:
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
        case RequestStatus.APPROVED:
            return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
        case RequestStatus.REJECTED:
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case RequestStatus.RETURNED:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
}

export function getUniqueTypes(equipment: Equipment[]): string[] {
    const types = new Set<string>();
    equipment.forEach(item => types.add(item.type));
    return Array.from(types).sort();
}



import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

/**
 * Generates a PDF document containing a QR code that links to the specified URL.
 * The PDF will automatically download with the given filename.
 *
 * @param {string} link The URL that the QR code should encode.
 * @param {string} [filename='qrcode.pdf'] The name of the PDF file to be downloaded.
 * @returns {Promise<void>} A promise that resolves when the PDF has been generated and downloaded.
 */
export async function generateQrCodePdf(link: string, filename: string = 'qrcode.pdf'): Promise<void> {
    try {
        // Generate QR Code as a Data URL (Base64 image)
        const qrCodeDataUrl = await QRCode.toDataURL(link, {
            errorCorrectionLevel: 'H', // High error correction level
            margin: 1,                
            width: 200,                
        });

        const doc = new jsPDF();

        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const qrCodeSize = 80;
        const qrCodeX = (pageWidth - qrCodeSize) / 2;
        const qrCodeY = (pageHeight - qrCodeSize) / 2 - 10;


        // Add the QR code image
        doc.addImage(qrCodeDataUrl, 'PNG', qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);

        // Save the PDF, triggering a download
        doc.save(filename);

        console.log(`QR Code PDF for "${link}" generated as "${filename}"`);

    } catch (error) {
        console.error('Error generating QR Code PDF:', error);
        throw new Error('Failed to generate QR Code PDF.');
    }
}



/**
 * Finds the ID of the active checkout request for a given equipment.
 * An active checkout request is defined as a request that has been approved
 * but has not yet been returned, and the equipment itself is marked as CHECKED_OUT.
 *
 * @param equipment The Equipment object to check.
 * @returns The ID of the active checkout request, or null if not found or equipment is not checked out.
 */
export function getCheckoutRequestId(equipment: Equipment): number | null {
  if (equipment.status !== EquipmentStatus.CHECKED_OUT) {
    return null;
  }

  // Filter through the requests associated with this equipment.
  // We're looking for requests that:
  // 1. Have an 'approvedAt' timestamp (meaning they were approved).
  // 2. Do NOT have a 'returnedAt' timestamp (meaning the equipment hasn't been returned yet).
  const activeCheckoutRequests = equipment.requests.filter(request =>
    request.approvedAt !== null &&
    request.returnedAt === null
  );

  if (activeCheckoutRequests.length > 0) {
    activeCheckoutRequests.sort((a, b) => {
      const dateA = a.approvedAt ? new Date(a.approvedAt).getTime() : 0;
      const dateB = b.approvedAt ? new Date(b.approvedAt).getTime() : 0;
      return dateB - dateA;
    });

    return activeCheckoutRequests[0].id;
  }

  return null;
}
