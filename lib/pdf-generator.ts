import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculatorInputs, CalculatorResults, calculateNetProceeds, DEFAULT_INPUTS } from './calculator';
import { formatCurrency } from './utils';

// Helper to format currency without cents for cleaner PDF
const fmt = (num: number) => formatCurrency(num).replace('.00', '');

export const generateNetSheetPDF = (inputs: CalculatorInputs, results: CalculatorResults, email: string = "Values Estimate") => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;

    // --- COLOR PALETTE ---
    const primaryColor = [16, 185, 129]; // Emerald 500
    const darkColor = [15, 23, 42]; // Slate 900
    const lightGray = [241, 245, 249]; // Slate 100
    const textGray = [100, 116, 139]; // Slate 500

    // --- HELPER FUNCTIONS ---
    const centerText = (text: string, y: number, fontSize: number = 12, color: number[] = darkColor) => {
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, y);
    };

    const addFooter = (pageNumber: number) => {
        const totalPages = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);

        // Disclaimer
        const disclaimer = "This net sheet is an estimate only and not an appraisal or guarantee. Actual proceeds may vary based on market conditions.";
        const footerY = pageHeight - 15;
        centerText(disclaimer, footerY, 8, [150, 150, 150]);

        // Branding
        centerText("NetSellerSheet.com · Built by Harvest Homes", footerY + 5, 8, [150, 150, 150]);

        // Page Number
        doc.text(`Page ${pageNumber}`, pageWidth - margin, footerY + 5, { align: 'right' });
    };

    // ================= PAGE 1: SUMMARY =================

    // 1. Header
    doc.setFontSize(18);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("Net Seller Sheet", margin, 20);

    doc.setFontSize(10);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text("Estimated Home Sale Proceeds", margin, 26);

    doc.setFontSize(10);
    doc.text("NetSellerSheet.com", pageWidth - margin, 20, { align: 'right' });
    doc.text(`Prepared for: ${email}`, pageWidth - margin, 26, { align: 'right' });
    const dateStr = new Date().toLocaleDateString();
    doc.text(`Date Generated: ${dateStr}`, pageWidth - margin, 32, { align: 'right' });

    // Divider
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.line(margin, 38, pageWidth - margin, 38);

    // 2. Property Snapshot
    doc.setFontSize(11);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(`Property ZIP: ${inputs.zipCode || 'N/A'}`, margin, 50);
    doc.text(`Est. Sale Price: ${fmt(inputs.salePrice)}`, pageWidth - margin, 50, { align: 'right' });

    // 3. Hero Section (Net Proceeds)
    const heroY = 70;
    doc.setFillColor(240, 253, 244); // Light Green Background
    doc.roundedRect(margin, heroY - 10, pageWidth - (margin * 2), 50, 3, 3, 'F');

    centerText("ESTIMATED NET PROCEEDS", heroY + 5, 12, [21, 128, 61]); // Green 700
    centerText(fmt(results.netProceeds), heroY + 25, 36, [22, 101, 52]); // Green 800
    centerText("What you may take home after estimated costs", heroY + 35, 10, textGray);

    // 4. Scenario Comparison (Side-by-Side)
    // We calculate scenarios by tweaking the price +/- 5%
    const expected = results;

    const bestCaseInputs = { ...inputs, salePrice: inputs.salePrice * 1.05 };
    const bestCaseResults = calculateNetProceeds(bestCaseInputs);

    const conservativeInputs = { ...inputs, salePrice: inputs.salePrice * 0.95 };
    const conservativeResults = calculateNetProceeds(conservativeInputs);

    const scenarioY = 135;

    // Using autoTable for the clean grid
    autoTable(doc, {
        startY: scenarioY,
        head: [['Scenario', 'Sale Price', 'Total Costs', 'Net Proceeds']],
        body: [
            ['Best Case (+5%)', fmt(bestCaseInputs.salePrice), fmt(bestCaseResults.totalSellingCosts), fmt(bestCaseResults.netProceeds)],
            ['Expected', fmt(inputs.salePrice), fmt(results.totalSellingCosts), fmt(results.netProceeds)],
            ['Conservative (-5%)', fmt(conservativeInputs.salePrice), fmt(conservativeResults.totalSellingCosts), fmt(conservativeResults.netProceeds)],
        ],
        theme: 'striped',
        headStyles: { fillColor: [40, 50, 60], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
            0: { fontStyle: 'bold' },
            3: { fontStyle: 'bold', textColor: [22, 101, 52] }
        }
    });

    // 5. Cost Summary (Below Fold)
    const summaryY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("Selling Costs Overview", margin, summaryY);

    autoTable(doc, {
        startY: summaryY + 5,
        body: [
            ['Realtor Commissions', fmt(results.breakdown.commission)],
            ['Closing & Title Fees', fmt(results.breakdown.closingCosts + results.breakdown.titleEscrow)], // Grouping for summary
            ['Prorated Taxes (Credit to Buyer)', fmt(results.breakdown.taxes)],
            ['Repairs / Credits', fmt(results.breakdown.repairs + results.breakdown.credits)],
            ['Mortgage Payoff', fmt(results.breakdown.mortgagePayoff)],
            ['Total Estimated Costs (incl. Payoff)', fmt(results.totalSellingCosts + results.breakdown.mortgagePayoff)] // Total definition varies, spec implies costs + payoff to get net
        ],
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            1: { halign: 'right' }
        },
        // Highlight Total Row
        didParseCell: function (data) {
            if (data.row.index === 5) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.textColor = [185, 28, 28]; // Red for costs
                data.cell.styles.fillColor = [254, 242, 242];
            }
        }
    });

    addFooter(1);


    // ================= PAGE 2: DETAILED BREAKDOWN =================
    doc.addPage();

    // Header P2
    doc.setFontSize(14);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("Detailed Cost Breakdown", margin, 20);

    // Grouping Data for Detail Table
    const detailsY = 30;

    autoTable(doc, {
        startY: detailsY,
        head: [['Category', 'Description', 'Amount']],
        body: [
            // Realtor Fees
            [{ content: 'Realtor Fees', rowSpan: 3, styles: { valign: 'middle', fontStyle: 'bold' } }, `Total Commission (${inputs.commissionRate}%)`, fmt(results.breakdown.commission)],
            ['Seller-side Est.', fmt(results.breakdown.commission / 2)], // Simple assumption for display
            ['Buyer-side Est.', fmt(results.breakdown.commission / 2)],

            // Title & Closing
            [{ content: 'Closing & Title', rowSpan: 3, styles: { valign: 'middle', fontStyle: 'bold' } }, 'Closing Costs (Lender/Origination)', fmt(results.breakdown.closingCosts)],
            ['Title & Escrow Fees', fmt(results.breakdown.titleEscrow)],
            ['Prorated Tax Credit', fmt(results.breakdown.taxes)],

            // Adjustments
            [{ content: 'Adjustments', rowSpan: 2, styles: { valign: 'middle', fontStyle: 'bold' } }, 'Repairs', fmt(results.breakdown.repairs)],
            ['Credits / Concessions', fmt(results.breakdown.credits)],

            // Loans
            [{ content: 'Loans', rowSpan: 1, styles: { valign: 'middle', fontStyle: 'bold' } }, 'Mortgage Payoff', fmt(results.breakdown.mortgagePayoff)],
        ],
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
            2: { halign: 'right' }
        }
    });

    // Final Net Calc Box
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    autoTable(doc, {
        startY: finalY,
        body: [
            ['Estimated Sale Price', fmt(inputs.salePrice)],
            ['Total Selling Costs (Fees + Comm + Credits)', `-${fmt(results.totalSellingCosts)}`],
            ['Mortgage Payoff', `-${fmt(inputs.mortgageBalance)}`],
            ['ESTIMATED NET PROCEEDS', fmt(results.netProceeds)]
        ],
        theme: 'plain',
        styles: { fontSize: 11, cellPadding: 5 },
        columnStyles: {
            1: { halign: 'right' }
        },
        didParseCell: function (data) {
            if (data.row.index === 3) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fontSize = 14;
                data.cell.styles.textColor = [22, 101, 52]; // Green
                data.cell.styles.fillColor = [240, 253, 244];
            }
        }
    });

    addFooter(2);

    // Save
    const fileName = `NetSellerSheet_${inputs.zipCode || 'X'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};
