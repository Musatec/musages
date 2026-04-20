
import jsPDF from "jspdf";
import "jspdf-autotable";
import { formatMoney } from "./utils";

interface InvoiceData {
    saleId: string;
    customerName: string;
    customerPhone?: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    date: string;
    storeName: string;
}

export async function generateInvoicePDF(data: InvoiceData) {
    const doc = new jsPDF() as any;
    const margin = 20;
    
    // --- HEADER ---
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text(data.storeName.toUpperCase(), margin, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Facture N°: #${data.saleId.toUpperCase()}`, margin, 40);
    doc.text(`Date: ${data.date}`, margin, 45);
    
    // --- CUSTOMER INFO ---
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text("CLIENT:", margin, 65);
    doc.setFontSize(14);
    doc.text(data.customerName.toUpperCase(), margin, 72);
    
    // --- TABLE ---
    const tableRows = data.items.map(item => [
        item.name.toUpperCase(),
        item.quantity.toString(),
        `${formatMoney(item.price)} F`,
        `${formatMoney(item.quantity * item.price)} F`
    ]);
    
    doc.autoTable({
        startY: 85,
        head: [['ARTICLE', 'QTÉ', 'P. UNITAIRE', 'TOTAL']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { halign: 'center', cellWidth: 20 },
            2: { halign: 'right', cellWidth: 40 },
            3: { halign: 'right', cellWidth: 40 },
        }
    });
    
    // --- TOTAL ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(`TOTAL À PAYER: ${formatMoney(data.totalAmount)} FCFA`, 200 - margin, finalY, { align: 'right' });
    
    // --- FOOTER ---
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Merci pour votre confiance !", 105, 280, { align: 'center' });
    doc.text("Musages POS - La gestion intelligente", 105, 285, { align: 'center' });

    return doc;
}

export function shareViaWhatsApp(data: InvoiceData) {
    const message = `Bonjour ${data.customerName},\n\nMerci pour votre achat chez ${data.storeName} !\n\n*Facture #${data.saleId.toUpperCase()}*\nTotal: ${formatMoney(data.totalAmount)} FCFA\n\nÀ bientôt !`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${data.customerPhone?.replace(/\s/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
}
