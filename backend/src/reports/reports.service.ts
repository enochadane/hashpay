import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService) { }

    async generateTransactionPdf(txnId: string, userId: string): Promise<Buffer> {
        const txn = await this.prisma.transactions.findUnique({
            where: { id: txnId },
            include: {
                currency: true,
                from_account: {
                    include: {
                        profiles: true,
                    },
                },
                to_account: {
                    include: {
                        profiles: true,
                    },
                },
            },
        });

        if (!txn) {
            throw new NotFoundException('Transaction not found');
        }

        // Verify ownership: user must be sender or receiver
        if (txn.from_account.user_id !== userId && txn.to_account.user_id !== userId) {
            throw new ForbiddenException('Access denied to this transaction report');
        }

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));

            // Brand Header
            doc
                .fillColor('#D4A843')
                .fontSize(24)
                .text('HashPay', { align: 'left' })
                .moveDown(0.2);

            doc
                .fillColor('#999999')
                .fontSize(10)
                .text('Transaction Receipt', { align: 'left' })
                .moveDown(2);

            // Line separator
            doc
                .strokeColor('#EEEEEE')
                .lineWidth(1)
                .moveTo(50, doc.y)
                .lineTo(550, doc.y)
                .stroke()
                .moveDown(2);

            const startY = doc.y;

            // Summary Info
            doc
                .fillColor('#999999')
                .fontSize(10)
                .text('REFERENCE NUMBER')
                .fillColor('#333333')
                .fontSize(12)
                .text(txn.reference_number || `TXN-${txn.id.slice(0, 8)}`)
                .moveDown();

            doc
                .fillColor('#999999')
                .fontSize(10)
                .text('DATE & TIME')
                .fillColor('#333333')
                .fontSize(12)
                .text(new Date(txn.created_at).toLocaleString())
                .moveDown();

            doc
                .fillColor('#999999')
                .fontSize(10)
                .text('STATUS')
                .fillColor(txn.status === 'APPROVED' ? '#10B981' : '#F59E0B')
                .fontSize(12)
                .text(txn.status)
                .moveDown(2);

            // Amount Section
            const amountY = startY;
            doc
                .fillColor('#999999')
                .fontSize(10)
                .text('TOTAL AMOUNT', 350, amountY)
                .fillColor('#000000')
                .fontSize(24)
                .text(`${parseFloat(txn.amount.toString()).toLocaleString()} ${txn.currency.code}`, 350, amountY + 15)
                .moveDown(4);

            // Sender / Receiver Details
            doc.y = 350; // Set explicit Y to ensure it doesn't overlap

            const leftCol = 50;
            const rightCol = 300;

            // From
            doc
                .fillColor('#999999')
                .fontSize(10)
                .text('SENDER', leftCol)
                .fillColor('#333333')
                .fontSize(12)
                .text(`${txn.from_account.profiles.first_name} ${txn.from_account.profiles.last_name}`)
                .fontSize(10)
                .text(`Account: ${txn.from_account.account_number}`)
                .moveDown();

            // To
            doc
                .fillColor('#999999')
                .fontSize(10)
                .text('RECEIVER', rightCol, 350)
                .fillColor('#333333')
                .fontSize(12)
                .text(`${txn.to_account.profiles.first_name} ${txn.to_account.profiles.last_name}`, rightCol)
                .fontSize(10)
                .text(`Account: ${txn.to_account.account_number}`, rightCol)
                .moveDown();

            // Footer
            doc
                .fontSize(10)
                .fillColor('#999999')
                .text(
                    'This is a computer-generated receipt. No signature is required.',
                    50,
                    700,
                    { align: 'center', width: 500 }
                );

            doc.end();
        });
    }
}
