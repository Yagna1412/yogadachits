import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.scss'
})
export class UserDashboardComponent {
  downloadReceipt(receiptNo: string) {
    const fileName = `Yogada_Receipt_${receiptNo.replace('#', '')}.pdf`;
    
    // Minimal valid PDF structure for demonstration
    const pdfContent = `%PDF-1.1
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 72 >>
stream
BT
/F1 18 Tf
100 700 Td
(Yogada Chit Funds - Official Receipt) Tj
/F1 12 Tf
0 -30 Td
(Receipt Number: ${receiptNo}) Tj
/F1 12 Tf
0 -20 Td
(Amount Paid: INR 10,000) Tj
/F1 10 Tf
0 -40 Td
(This is a computer generated receipt.) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000259 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
381
%%EOF`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    
    window.URL.revokeObjectURL(url);
  }

  payNow(receiptNo: string) {
    console.log('Initiating payment for:', receiptNo);
    alert(`Redirecting to secure payment gateway for ${receiptNo}...`);
  }
}
