import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { CalculatorInputs, CalculatorResults } from './calculator';

export const generateExcelTool = async (inputs: CalculatorInputs, results: CalculatorResults) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'NetSellerSheet.com';
    workbook.lastModifiedBy = 'Harvest Homes';
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet('Net Seller Sheet', {
        views: [{ showGridLines: false, zoomScale: 110 }]
    });

    // --- STYLES ---
    const headerFont = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }; // White
    const labelFont = { name: 'Arial', size: 11, color: { argb: 'FF334155' } }; // Slate 700
    const valueFont = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0F172A' } }; // Slate 900
    const inputFont = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF166534' } }; // Green 800 (Editable)
    const titleFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; // Slate 900
    const sectionFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } }; // Slate 300
    const inputFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }; // Green 100
    const lockedFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }; // Slate 100
    const resultFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF22C55E' } }; // Green 500

    // Set Column Widths
    sheet.columns = [
        { width: 5 },  // Padding
        { width: 35 }, // Labels
        { width: 25 }, // Values (Inputs)
        { width: 5 },  // Padding
        { width: 35 }, // Helper Text / Labels
        { width: 25 }, // Helper Values
    ];

    // --- HEADER ---
    sheet.mergeCells('B2:F3');
    const titleCell = sheet.getCell('B2');
    titleCell.value = 'Net Seller Sheet - Master Calculator';
    titleCell.style = {
        font: { name: 'Arial', size: 20, bold: true, color: { argb: 'FFFFFFFF' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: titleFill
    };

    sheet.mergeCells('B4:F4');
    const subTitle = sheet.getCell('B4');
    subTitle.value = `Prepared for ZIP: ${inputs.zipCode || 'Unknown'}`;
    subTitle.style = {
        font: { name: 'Arial', size: 10, italic: true, color: { argb: 'FF94A3B8' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: titleFill
    };

    // --- SECTION: INPUTS (Editable) ---
    let currentRow = 6;

    // Section Header
    const addSectionHeader = (row: number, text: string) => {
        sheet.mergeCells(`B${row}:C${row}`);
        const cell = sheet.getCell(`B${row}`);
        cell.value = text;
        cell.style = { font: headerFont, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }, alignment: { vertical: 'middle', indent: 1 } };
        sheet.getRow(row).height = 25;
    };

    const addInputRow = (row: number, label: string, value: number, format = '$#,##0') => {
        // Label
        const lCell = sheet.getCell(`B${row}`);
        lCell.value = label;
        lCell.style = { font: labelFont, alignment: { vertical: 'middle' }, border: { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } } };

        // Input (Unlock this!)
        const vCell = sheet.getCell(`C${row}`);
        vCell.value = value;
        vCell.numFmt = format;
        vCell.style = { font: inputFont, alignment: { horizontal: 'right', vertical: 'middle' }, fill: inputFill, border: { bottom: { style: 'thin', color: { argb: 'FFA7F3D0' } } } };
        vCell.protection = { locked: false }; // CRITICAL: Unlock

        sheet.getRow(row).height = 20;
    };

    // INPUTS SECTION
    addSectionHeader(currentRow, 'PROPERTY & LOANS');
    currentRow++;
    addInputRow(currentRow++, 'Estimated Sale Price', inputs.salePrice);
    addInputRow(currentRow++, 'Mortgage Payoff', inputs.mortgageBalance);
    currentRow++; // Spacer

    addSectionHeader(currentRow, 'COMMISSIONS & FEES');
    currentRow++;
    addInputRow(currentRow++, 'Commission Rate (%)', inputs.commissionRate / 100, '0.00%');
    addInputRow(currentRow++, 'Closing Cost Rate (%)', inputs.closingCostsRate / 100, '0.00%');
    addInputRow(currentRow++, 'Title / Escrow Fees ($)', results.breakdown.titleEscrow);
    addInputRow(currentRow++, 'Transfer Taxes ($)', 0);
    currentRow++;

    addSectionHeader(currentRow, 'ADJUSTMENTS');
    currentRow++;
    addInputRow(currentRow++, 'Repair Credits ($)', inputs.repairCosts);
    addInputRow(currentRow++, 'Home Warranty / Misc ($)', inputs.miscFees);
    addInputRow(currentRow++, 'Prorated Prop Tax Credit ($)', results.breakdown.taxes);
    // Other Concessions removed from UI, keeping hidden or removing? 
    // Let's remove 'Other Concessions' if it's not in UI to match perfectly, OR keep it as a bonus for Excel users. 
    // UI has 'Repair Credits' only. Let's keep it simple.
    // addInputRow(currentRow++, 'Other Concessions ($)', inputs.customCredits); 

    // --- SECTION: RESULTS (Locked Formulas) ---
    // Mapping:
    // Sale Price: C7
    // Mortgage: C8
    // Comm Rate: C11
    // Closing Rate: C12
    // Title: C13
    // Transfer Tax: C14
    // Repairs: C17
    // Misc/Warranty: C18 <-- NEW
    // Pro Taxes: C19

    // Header for Results
    sheet.mergeCells(`E6:F6`);
    const resHeader = sheet.getCell('E6');
    resHeader.value = 'LIVE CALCULATIONS';
    resHeader.style = { font: headerFont, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF166534' } }, alignment: { horizontal: 'center', vertical: 'middle' } };

    const addResultRow = (row: number, label: string, formula: string, isTotal = false) => {
        sheet.getCell(`E${row}`).value = label;
        sheet.getCell(`E${row}`).style = { font: labelFont, alignment: { vertical: 'middle' } };

        const valCell = sheet.getCell(`F${row}`);
        valCell.value = { formula };
        valCell.numFmt = '$#,##0';

        if (isTotal) {
            valCell.style = { font: { ...valueFont, size: 14, color: { argb: 'FFFFFFFF' } }, fill: resultFill, alignment: { horizontal: 'right', vertical: 'middle' } };
            sheet.getCell(`E${row}`).style = { font: { ...labelFont, bold: true }, fill: lockedFill };
            sheet.getRow(row).height = 30;
        } else {
            valCell.style = { font: valueFont, fill: lockedFill, alignment: { horizontal: 'right', vertical: 'middle' } };
            sheet.getRow(row).height = 20;
        }
    };

    let rRow = 7;
    addResultRow(rRow++, 'Gross Sale Price', 'C7');
    addResultRow(rRow++, '(-) Mortgage Payoff', 'C8');
    rRow++; // Spacer

    // Commission: SalePrice * Rate
    addResultRow(rRow++, '(-) Total Commission', 'C7*(C11)');

    // Closing Costs: SalePrice * Rate
    addResultRow(rRow++, '(-) Closing Costs', 'C7*(C12)');

    // Fixed Fees
    addResultRow(rRow++, '(-) Title & Escrow', 'C13');
    addResultRow(rRow++, '(-) Transfer Tax', 'C14');
    rRow++;

    // Adjustments
    addResultRow(rRow++, '(-) Repair Credits', 'C17');
    addResultRow(rRow++, '(-) Warranty / Misc', 'C18');
    addResultRow(rRow++, '(-) Prorated Tax', 'C19');

    // TOTAL NET FORMULA
    // C7 - C8 - (C7*C11) - (C7*C12) - C13 - C14 - C17 - C18 - C19
    const netFormula = 'C7-C8-(C7*C11)-(C7*C12)-C13-C14-C17-C18-C19';

    // Add big box at bottom
    rRow += 2;

    // Net Proceeds Cell
    const netRow = rRow;
    sheet.getCell(`E${netRow}`).value = "NET PROCEEDS";
    sheet.getCell(`E${netRow}`).style = { font: { name: 'Arial', size: 12, bold: true, color: { argb: 'FF166534' } }, alignment: { vertical: 'middle', horizontal: 'center' } };

    sheet.getCell(`F${netRow}`).value = { formula: netFormula };
    sheet.getCell(`F${netRow}`).numFmt = '$#,##0';
    sheet.getCell(`F${netRow}`).style = { font: { name: 'Arial', size: 18, bold: true, color: { argb: 'FF166534' } }, alignment: { vertical: 'middle', horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } } };
    sheet.getRow(netRow).height = 40;

    // --- SCENARIOS (Matches UI) ---
    rRow += 2;
    sheet.mergeCells(`E${rRow}:F${rRow}`);
    const scenHeader = sheet.getCell(`E${rRow}`);
    scenHeader.value = "SCENARIO PROJECTIONS";
    scenHeader.style = { font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FF94A3B8' } }, alignment: { horizontal: 'center' } };

    rRow++;
    // Best Case (+5%) | Expected | Conservative (-5%)
    // Row 1: Labels
    // Row 2: Values formula

    // We only have 2 columns (E, F). Let's use E for labels, F for values?
    // Or stack them.
    // Let's do a simple stacked table.

    // Best Case
    sheet.getCell(`E${rRow}`).value = "Best Case (+5%)";
    sheet.getCell(`E${rRow}`).style = { font: { color: { argb: 'FF10B981' } } };
    sheet.getCell(`F${rRow}`).value = { formula: `F${netRow}*1.05` };
    sheet.getCell(`F${rRow}`).numFmt = '$#,##0';
    sheet.getCell(`F${rRow}`).style = { font: { bold: true } };
    rRow++;

    // Conservative
    sheet.getCell(`E${rRow}`).value = "Conservative (-5%)";
    sheet.getCell(`E${rRow}`).style = { font: { color: { argb: 'FFEF4444' } } };
    sheet.getCell(`F${rRow}`).value = { formula: `F${netRow}*0.95` };
    sheet.getCell(`F${rRow}`).numFmt = '$#,##0';
    sheet.getCell(`F${rRow}`).style = { font: { bold: true } };

    // --- PROTECT THE SHEET ---
    await sheet.protect('harvest', {
        selectLockedCells: true,
        selectUnlockedCells: true,
        formatCells: false,
        formatColumns: false,
        formatRows: false,
        insertColumns: false,
        insertRows: false,
        insertHyperlinks: false,
        deleteColumns: false,
        deleteRows: false,
        sort: false,
        autoFilter: false,
        pivotTables: false
    });

    // Write file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `NetSellerSheet_OfflineCalculator_${inputs.zipCode || 'Master'}.xlsx`);
};
