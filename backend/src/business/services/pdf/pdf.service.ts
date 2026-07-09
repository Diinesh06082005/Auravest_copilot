import PDFDocument from 'pdfkit';

export interface IPdfReportData {
  ticker: string;
  title: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  targetPrice: string;
  analystName: string;
  timestamp: string;
  financials: Array<{ metric: string; value: string; yoy: string }>;
  chartData: number[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  thesis: string;
  risks: string[];
}

export class PdfService {
  /**
   * Generates a beautifully formatted PDF report buffer
   */
  public generateReportPdf(data: IPdfReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          bufferPages: true,
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        // ==========================================
        // PAGE 1: COVER HEADER & KEY HIGHLIGHTS
        // ==========================================

        // Vector Logo Shield
        doc.save();
        doc.translate(50, 40);
        // Outer shield path
        doc.path('M 0 0 L 12 -8 L 24 0 L 24 16 C 24 24 12 32 12 32 C 12 32 0 24 0 16 Z')
           .fillColor('#2563EB')
           .fill();
        // Inner accent
        doc.path('M 4 4 L 12 -2 L 20 4 L 20 14 C 20 20 12 26 12 26 C 12 26 4 20 4 14 Z')
           .fillColor('#10B981')
           .fill();
        doc.restore();

        // Brand names
        doc.fillColor('#0F172A')
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('EquiShare', 85, 42);
        doc.fillColor('#2563EB')
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('Copilot', 165, 42);

        // Subhead tag
        doc.fillColor('#64748B')
           .fontSize(8)
           .font('Helvetica-Bold')
           .text('AI-POWERED FINANCIAL INTELLIGENCE PLATFORM', 85, 60);

        // Timestamp (Top Right)
        doc.fillColor('#64748B')
           .fontSize(8)
           .font('Helvetica')
           .text(`Exported: ${data.timestamp}`, 400, 45, { align: 'right', width: 145 });

        // Border divider
        doc.moveTo(50, 80)
           .lineTo(545, 80)
           .lineWidth(1)
           .strokeColor('#E2E8F0')
           .stroke();

        // Main Report Header
        doc.fillColor('#0F172A')
           .fontSize(20)
           .font('Helvetica-Bold')
           .text(data.title, 50, 100, { width: 495 });

        // Metadata grid container
        const gridY = 140;
        doc.roundedRect(50, gridY, 495, 45, 6)
           .fillColor('#F8FAFC')
           .fill()
           .strokeColor('#E2E8F0')
           .lineWidth(1)
           .stroke();

        // Column Labels
        doc.fillColor('#64748B').fontSize(7.5).font('Helvetica-Bold');
        doc.text('TICKER', 65, gridY + 10);
        doc.text('RECOMMENDATION', 160, gridY + 10);
        doc.text('TARGET PRICE', 290, gridY + 10);
        doc.text('ANALYST NAME', 420, gridY + 10);

        // Column Values
        doc.fillColor('#0F172A').fontSize(11).font('Helvetica-Bold');
        doc.text(data.ticker, 65, gridY + 22);

        const recColor = data.recommendation === 'BUY' ? '#10B981' : data.recommendation === 'SELL' ? '#EF4444' : '#F59E0B';
        doc.fillColor(recColor).text(data.recommendation, 160, gridY + 22);

        doc.fillColor('#0F172A').text(data.targetPrice, 290, gridY + 22);
        doc.fillColor('#334155').font('Helvetica').text(data.analystName, 420, gridY + 22);

        // Executive Summary
        doc.fillColor('#0F172A')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('Executive Summary', 50, 210);

        doc.fillColor('#334155')
           .fontSize(9.5)
           .font('Helvetica')
           .text(data.summary, 50, 227, { width: 495, align: 'justify', lineGap: 3.5 });

        // Section Title: Financial Analysis
        doc.fillColor('#0F172A')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('Financial Highlight Analysis', 50, 320);

        // 1. Vector Chart Box (Left Column: 50 to 285)
        const chartX = 50;
        const chartY = 345;
        const chartW = 225;
        const chartH = 115;

        doc.roundedRect(chartX, chartY, chartW, chartH, 6)
           .fillColor('#FFFFFF')
           .fill()
           .strokeColor('#E2E8F0')
           .lineWidth(1)
           .stroke();

        doc.fillColor('#475569')
           .fontSize(8)
           .font('Helvetica-Bold')
           .text('QUARTERLY VALUATION / REVENUE TREND', chartX + 15, chartY + 12);

        // Inner Chart dimensions
        const plotX = chartX + 25;
        const plotY = chartY + 95;
        const plotW = chartW - 40;
        const plotH = chartH - 45;

        // Draw Axes
        doc.moveTo(plotX, plotY)
           .lineTo(plotX + plotW, plotY)
           .strokeColor('#CBD5E1')
           .lineWidth(1)
           .stroke();

        // Draw Gridlines
        const gridSteps = 3;
        for (let i = 1; i <= gridSteps; i++) {
          const gy = plotY - (i / gridSteps) * plotH;
          doc.moveTo(plotX, gy)
             .lineTo(plotX + plotW, gy)
             .strokeColor('#F1F5F9')
             .lineWidth(0.5)
             .stroke();
        }

        // Draw Line graph
        const points = data.chartData;
        const maxVal = Math.max(...points);
        const minVal = Math.min(...points);
        const valRange = maxVal - minVal || 1;

        doc.save();
        doc.moveTo(plotX, plotY - ((points[0] - minVal) / valRange) * plotH);
        for (let i = 1; i < points.length; i++) {
          const px = plotX + (i / (points.length - 1)) * plotW;
          const py = plotY - ((points[i] - minVal) / valRange) * plotH;
          doc.lineTo(px, py);
        }
        doc.strokeColor('#2563EB')
           .lineWidth(2.25)
           .stroke();
        doc.restore();

        // Draw vertex dots
        for (let i = 0; i < points.length; i++) {
          const px = plotX + (i / (points.length - 1)) * plotW;
          const py = plotY - ((points[i] - minVal) / valRange) * plotH;
          doc.circle(px, py, 3)
             .fillColor('#10B981')
             .fill();
        }

        // 2. Financial Metrics Table (Right Column: 290 to 545)
        const tblX = 290;
        const tblY = 345;
        const tblW = 255;
        const tblH = 115;

        doc.roundedRect(tblX, tblY, tblW, tblH, 6)
           .fillColor('#FFFFFF')
           .fill()
           .strokeColor('#E2E8F0')
           .lineWidth(1)
           .stroke();

        doc.fillColor('#475569')
           .fontSize(8.5)
           .font('Helvetica-Bold')
           .text('Metric', tblX + 15, tblY + 12);
        doc.text('Value', tblX + 130, tblY + 12);
        doc.text('YoY Growth', tblX + 190, tblY + 12);

        doc.moveTo(tblX + 10, tblY + 26)
           .lineTo(tblX + tblW - 10, tblY + 26)
           .strokeColor('#E2E8F0')
           .lineWidth(1)
           .stroke();

        let rowY = tblY + 32;
        data.financials.forEach((row) => {
          doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(8).text(row.metric, tblX + 15, rowY);
          doc.fillColor('#334155').font('Helvetica').text(row.value, tblX + 130, rowY);
          
          const isPos = row.yoy.startsWith('+');
          doc.fillColor(isPos ? '#10B981' : '#EF4444')
             .font('Helvetica-Bold')
             .text(row.yoy, tblX + 190, rowY);

          // Divider row line
          doc.moveTo(tblX + 10, rowY + 16)
             .lineTo(tblX + tblW - 10, rowY + 16)
             .strokeColor('#F8FAFC')
             .lineWidth(0.5)
             .stroke();

          rowY += 19;
        });

        // Disclaimer footnote page 1
        doc.fillColor('#94A3B8')
           .fontSize(7)
           .font('Helvetica')
           .text('EquiShare Copilot Financial Intelligence Report. Standard A4 Export. Proprietary insights.', 50, 755);
        doc.text('Page 1 of 2', 495, 755, { align: 'right' });


        // ==========================================
        // PAGE 2: SWOT, THESIS & RISK FACTORS
        // ==========================================
        doc.addPage();

        // Small Header
        doc.fillColor('#0F172A')
           .fontSize(9.5)
           .font('Helvetica-Bold')
           .text(`EquiShare Investment Copilot  |  Report on ${data.ticker}`, 50, 40);

        doc.moveTo(50, 52)
           .lineTo(545, 52)
           .lineWidth(0.5)
           .strokeColor('#E2E8F0')
           .stroke();

        // SWOT Title
        doc.fillColor('#0F172A')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('SWOT Assessment Matrix', 50, 70);

        // SWOT Quadrants setup
        const swotY = 90;
        const boxW = 240;
        const boxH = 135;

        // Quadrant 1: Strengths
        doc.roundedRect(50, swotY, boxW, boxH, 6)
           .fillColor('#F0FDF4')
           .fill()
           .strokeColor('#DCFCE7')
           .lineWidth(1)
           .stroke();
        doc.fillColor('#15803D').font('Helvetica-Bold').fontSize(9).text('STRENGTHS (S)', 65, swotY + 12);
        let bulletY = swotY + 30;
        data.swot.strengths.forEach((str) => {
          doc.fillColor('#1E293B').font('Helvetica').fontSize(8).text(`•  ${str}`, 65, bulletY, { width: boxW - 30, lineGap: 1.5 });
          bulletY += 25;
        });

        // Quadrant 2: Weaknesses
        doc.roundedRect(305, swotY, boxW, boxH, 6)
           .fillColor('#FEF2F2')
           .fill()
           .strokeColor('#FEE2E2')
           .lineWidth(1)
           .stroke();
        doc.fillColor('#B91C1C').font('Helvetica-Bold').fontSize(9).text('WEAKNESSES (W)', 320, swotY + 12);
        bulletY = swotY + 30;
        data.swot.weaknesses.forEach((wk) => {
          doc.fillColor('#1E293B').font('Helvetica').fontSize(8).text(`•  ${wk}`, 320, bulletY, { width: boxW - 30, lineGap: 1.5 });
          bulletY += 25;
        });

        // Quadrant 3: Opportunities
        doc.roundedRect(50, swotY + boxH + 15, boxW, boxH, 6)
           .fillColor('#EFF6FF')
           .fill()
           .strokeColor('#DBEAFE')
           .lineWidth(1)
           .stroke();
        doc.fillColor('#1D4ED8').font('Helvetica-Bold').fontSize(9).text('OPPORTUNITIES (O)', 65, swotY + boxH + 27);
        bulletY = swotY + boxH + 45;
        data.swot.opportunities.forEach((op) => {
          doc.fillColor('#1E293B').font('Helvetica').fontSize(8).text(`•  ${op}`, 65, bulletY, { width: boxW - 30, lineGap: 1.5 });
          bulletY += 25;
        });

        // Quadrant 4: Threats
        doc.roundedRect(305, swotY + boxH + 15, boxW, boxH, 6)
           .fillColor('#FFFDF5')
           .fill()
           .strokeColor('#FEF3C7')
           .lineWidth(1)
           .stroke();
        doc.fillColor('#D97706').font('Helvetica-Bold').fontSize(9).text('THREATS (T)', 320, swotY + boxH + 27);
        bulletY = swotY + boxH + 45;
        data.swot.threats.forEach((th) => {
          doc.fillColor('#1E293B').font('Helvetica').fontSize(8).text(`•  ${th}`, 320, bulletY, { width: boxW - 30, lineGap: 1.5 });
          bulletY += 25;
        });

        // Thesis Section
        const thesisY = swotY + (boxH * 2) + 35;
        doc.fillColor('#0F172A')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('Synthesis & Investment Thesis', 50, thesisY);

        doc.fillColor('#334155')
           .fontSize(9)
           .font('Helvetica')
           .text(data.thesis, 50, thesisY + 18, { width: 495, align: 'justify', lineGap: 2.5 });

        // Downsides & Risk factors
        const risksY = thesisY + 120;
        doc.fillColor('#0F172A')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('Critical Risk Mitigation Variables', 50, risksY);

        bulletY = risksY + 18;
        data.risks.forEach((risk) => {
          doc.fillColor('#EF4444').font('Helvetica-Bold').fontSize(8.5).text('[ RISK ]', 50, bulletY);
          doc.fillColor('#334155').font('Helvetica').fontSize(8.5).text(risk, 100, bulletY, { width: 445 });
          bulletY += 20;
        });

        // Footer Page 2
        doc.fillColor('#94A3B8')
           .fontSize(7)
           .font('Helvetica')
           .text('Disclaimer: Investment research reports are compiled dynamically and do not constitute direct trading recommendation plans.', 50, 755);
        doc.text('Page 2 of 2', 495, 755, { align: 'right' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const pdfService = new PdfService();
