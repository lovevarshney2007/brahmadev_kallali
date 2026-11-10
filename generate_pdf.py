import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#6B7280"))
        
        # Header (on pages after first)
        if self._pageNumber > 1:
            self.drawString(45, 805, "Shri Kshetra Brahmadev Devasthan, Kallali — Website Audit & Enhancement Report")
            self.setStrokeColor(colors.HexColor("#E5E7EB"))
            self.setLineWidth(0.5)
            self.line(45, 800, 550, 800)
            
        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(550, 30, footer_text)
        self.drawString(45, 30, "CONFIDENTIAL — For Temple Trust & Development Review Only")
        self.setStrokeColor(colors.HexColor("#E5E7EB"))
        self.setLineWidth(0.5)
        self.line(45, 42, 550, 42)
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=45,
        rightMargin=45,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#801818"),
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#B45309"),
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#801818"),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#2B1810"),
        spaceAfter=6
    )

    bold_body = ParagraphStyle(
        'BoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#374151")
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor("#801818")
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#2B1810")
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell_style,
        fontName='Helvetica-Bold'
    )

    badge_urgent = ParagraphStyle(
        'BadgeUrgent',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#B91C1C")
    )

    badge_info = ParagraphStyle(
        'BadgeInfo',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#0369A1")
    )

    story = []

    # Document Header
    story.append(Paragraph("Shri Kshetra Brahmadev Devasthan, Kallali", title_style))
    story.append(Paragraph("Website Audit, Real-World Data Checklist & UI Enhancement Plan", subtitle_style))
    
    meta_table = Table([
        [
            Paragraph("<b>Target Domain:</b> brahmadev-kallali.vercel.app", body_style),
            Paragraph("<b>Location:</b> Kallali, Mukhed/Kandhar, Nanded, MH", body_style)
        ],
        [
            Paragraph("<b>Contact Official:</b> Maruti Kunjatwad (9503131031)", body_style),
            Paragraph("<b>Date:</b> November 2026 | <b>Status:</b> Ready for Trust Alignment", body_style)
        ]
    ], colWidths=[250, 255])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FDFBF7")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E5E7EB")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#F3F4F6")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # Executive Summary & Regional Context
    story.append(Paragraph("Executive Summary & Public Research Insights", h1_style))
    exec_summary_text = (
        "This report consolidates the complete technical audit, missing real-world parameters, "
        "and suggested user interface upgrades for the official digital seva platform of "
        "<b>Shri Kshetra Brahmadev Devasthan, Kallali</b>.<br/><br/>"
        "<b>Google & Marathwada Regional Research Findings:</b><br/>"
        "• <b>Rare Sacred Heritage:</b> In India, temples dedicated to Lord Brahmadev are exceptionally rare (Pushkar, Rajasthan being the best known). In Maharashtra's Marathwada region, the shrine at Kallali (PIN 431715) holds distinct religious reverence as an ancient Gramdaivat.<br/>"
        "• <b>Geography & Access:</b> Situated on the border region of Mukhed and Kandhar talukas in Nanded district, accessed via the Kallali–Pethwadaj–Rui road network.<br/>"
        "• <b>Community Alignment:</b> Local devotees and village pilgrims are predominantly native Marathi speakers. Replacing generic AI placeholder text with authentic Marathi language content, verified trust credentials, and transparent digital receipts is paramount for long-term credibility."
    )
    
    summary_box = Table([[Paragraph(exec_summary_text, callout_style)]], colWidths=[505])
    summary_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FFFBEB")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#FDE68A")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(summary_box)
    story.append(Spacer(1, 10))

    # Section 1: Checklist of Real-World Data Needed from Trust
    story.append(Paragraph("1. Data Checklist: Information Required from the Temple Trust", h1_style))
    story.append(Paragraph(
        "The following parameters are currently blank or set to system defaults in the codebase. "
        "These items must be provided by the temple trust to complete the production setup:",
        body_style
    ))

    data_checklist = [
        [
            Paragraph("Item / Parameter", table_header_style),
            Paragraph("Current Status", table_header_style),
            Paragraph("Information Needed from Temple Trust / Client", table_header_style)
        ],
        [
            Paragraph("Official Temple UPI ID", table_cell_bold),
            Paragraph("MISSING (Blank)", badge_urgent),
            Paragraph("Official bank-linked UPI ID (e.g. <code>brahmadevtrust@sbi</code>). Required to generate dynamic QR codes on the donation page.", table_cell_style)
        ],
        [
            Paragraph("Darshan & Aarti Schedule", table_cell_bold),
            Paragraph("'To be confirmed'", badge_urgent),
            Paragraph("Confirmed times for: 1. Temple opening hours, 2. Kakad Aarti, 3. Daily Abhishek & Puja, 4. Evening Aarti, 5. Shej Aarti & closing.", table_cell_style)
        ],
        [
            Paragraph("Annual Brahmadev Yatra Dates", table_cell_bold),
            Paragraph("'Date to be confirmed'", badge_urgent),
            Paragraph("Exact Marathi Tithi (e.g. Chaitra/Kartik Vadya/Purnima) and dates for the annual Yatra, Palkhi procession, and Mahaprasad.", table_cell_style)
        ],
        [
            Paragraph("Authentic Temple History", table_cell_bold),
            Paragraph("Temporary Draft (TBC)", badge_urgent),
            Paragraph("Founding era/century, idol details (Swayambhu or carved stone), and notable historical renovations confirmed by village elders.", table_cell_style)
        ],
        [
            Paragraph("Trust Registration & 80G", table_cell_bold),
            Paragraph("Blank in Database", badge_info),
            Paragraph("Official Trust Name (under Bombay Public Trusts Act), Registration No. (e.g. <code>A/1234/Nanded</code>), and 80G tax exemption number if applicable.", table_cell_style)
        ],
        [
            Paragraph("Direct Bank Transfer Details", table_cell_bold),
            Paragraph("Not Configured", badge_info),
            Paragraph("Bank Name, Branch, Account Holder Name, Account Number, and IFSC Code for donors making large RTGS/NEFT donations.", table_cell_style)
        ],
        [
            Paragraph("Authentic Temple Photos", table_cell_bold),
            Paragraph("Placeholder Text Boxes", badge_info),
            Paragraph("High-resolution photos of the deity (Murti), Shikhar, Sabhamandap, and annual fair for the homepage and public photo gallery.", table_cell_style)
        ],
        [
            Paragraph("Sample Ledger Cleanup", table_cell_bold),
            Paragraph("5 Test Entries in DB", badge_info),
            Paragraph("Execute cleanup command (<code>npm run seed -- --clear-examples</code>) to wipe test donations prior to formal public launch.", table_cell_style)
        ]
    ]

    t_checklist = Table(data_checklist, colWidths=[125, 95, 285])
    t_checklist.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#FDF6EC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E5E7EB")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E5E7EB")),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_checklist)

    story.append(PageBreak())

    # Section 2: AI Content & Information to Modify / Localize
    story.append(Paragraph("2. AI Content & Text to Modify or Localize", h1_style))
    story.append(Paragraph(
        "Parts of the existing website copy were scaffolded using automated AI text. "
        "The following changes will ground the website in authentic regional identity:",
        body_style
    ))

    content_items = [
        [
            Paragraph("Area of Modification", table_header_style),
            Paragraph("Current AI / Placeholder State", table_header_style),
            Paragraph("Recommended Modification & Authentic Detail", table_header_style)
        ],
        [
            Paragraph("<b>Marathi Language Support</b>", table_cell_style),
            Paragraph("95% English text across all pages.", table_cell_style),
            Paragraph("Provide a Marathi toggle (मराठी / English) or bilingual Devanagari headings. Crucial for elderly devotees and rural villagers.", table_cell_style)
        ],
        [
            Paragraph("<b>Deity Significance</b>", table_cell_style),
            Paragraph("Generic phrases: <i>'a sacred place of faith and spiritual heritage'</i>.", table_cell_style),
            Paragraph("Describe the specific spiritual significance of Lord Brahmadev at Kallali, local belief, vowed offerings (navas), and traditional pujas.", table_cell_style)
        ],
        [
            Paragraph("<b>'How to Reach' Guide</b>", table_cell_style),
            Paragraph("Vague guidance: <i>'reach Mukhed by bus, continue by local transport'</i>.", table_cell_style),
            Paragraph("Include exact road distances (~75 km from Nanded, ~12 km from Mukhed), route via Pethwadaj-Rui Road (PIN 431715), and rail stations.", table_cell_style)
        ],
        [
            Paragraph("<b>Office Contact Integration</b>", table_cell_style),
            Paragraph("Dispersed contact placeholders.", table_cell_style),
            Paragraph("Integrate verified trustee <b>Maruti Kunjatwad (9503131031)</b> clearly in the header, footer, donation assistance, and WhatsApp link.", table_cell_style)
        ]
    ]

    t_content = Table(content_items, colWidths=[120, 140, 245])
    t_content.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#FDF6EC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E5E7EB")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E5E7EB")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_content)
    story.append(Spacer(1, 10))

    # Section 3: Recommended UI / UX Improvements
    story.append(Paragraph("3. High-Impact UI & UX Improvements to Implement", h1_style))
    story.append(Paragraph(
        "These technical and aesthetic enhancements will provide a modern, respectful, and frictionless user experience:",
        body_style
    ))

    ui_items = [
        [
            Paragraph("UI / UX Feature", table_header_style),
            Paragraph("Implementation Description", table_header_style),
            Paragraph("Value to Devotees & Temple Office", table_header_style)
        ],
        [
            Paragraph("<b>Floating WhatsApp Seva Button</b>", table_cell_style),
            Paragraph("A persistent, responsive pill button at bottom-right linking directly to WhatsApp (<code>wa.me/919503131031</code>).", table_cell_style),
            Paragraph("Enables 1-click communication for devotees seeking receipt verification, puja bookings, or route guidance.", table_cell_style)
        ],
        [
            Paragraph("<b>Digital Donation Slip (पावती)</b>", table_cell_style),
            Paragraph("A cleanly styled digital receipt card generated post-donation with temple seal, receipt ID, date, and donor name.", table_cell_style),
            Paragraph("Devotees can save/download the image and immediately share confirmation with family members.", table_cell_style)
        ],
        [
            Paragraph("<b>Bank Transfer (NEFT/RTGS) Card</b>", table_cell_style),
            Paragraph("A dedicated section on <code>/donate</code> detailing Bank Name, A/C No., and IFSC with 1-click 'Copy' buttons.", table_cell_style),
            Paragraph("Caters to senior citizens and institutional patrons who do not use mobile QR payment apps.", table_cell_style)
        ],
        [
            Paragraph("<b>Urgent Announcement Banner</b>", table_cell_style),
            Paragraph("An eye-catching golden announcement bar at the top of the portal for active Yatra, festival, or emergency alerts.", table_cell_style),
            Paragraph("Ensures immediate visibility for key dates, festival registrations, and trust circulars.", table_cell_style)
        ],
        [
            Paragraph("<b>Embedded Aarti Audio Player</b>", table_cell_style),
            Paragraph("A lightweight, elegant mini-player embedded on the homepage or worship tab.", table_cell_style),
            Paragraph("Allows pilgrims and remote devotees to listen to the sacred Brahmadev Aarti and stotras anytime.", table_cell_style)
        ]
    ]

    t_ui = Table(ui_items, colWidths=[120, 195, 190])
    t_ui.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#FDF6EC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E5E7EB")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E5E7EB")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_ui)
    story.append(Spacer(1, 10))

    # Section 4: Recommended Action Plan
    story.append(Paragraph("4. Recommended Phased Action Plan", h1_style))
    action_text = (
        "<b>Phase 1 (Immediate UI Deployment):</b> Implement the Floating WhatsApp Chat Button, "
        "Bank Details Card with copy shortcuts, and responsive image placeholders right away.<br/>"
        "<b>Phase 2 (Trustee Alignment):</b> Share this report with the temple committee to obtain "
        "the official UPI ID, darshan timings, and festival dates.<br/>"
        "<b>Phase 3 (Admin Data Entry):</b> Enter the verified credentials into the admin dashboard at <code>/admin</code>.<br/>"
        "<b>Phase 4 (Sample Cleanup & Public Go-Live):</b> Run the sample data removal script and inaugurate the live portal."
    )
    plan_box = Table([[Paragraph(action_text, callout_style)]], colWidths=[505])
    plan_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FDF4")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#BBF7D0")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(plan_box)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {filename}")

if __name__ == "__main__":
    out_dir = r"C:\Users\lavva\Downloads"
    out_pdf = os.path.join(out_dir, "Brahmadev_Devasthan_Kallali_Website_Audit_Report.pdf")
    build_pdf(out_pdf)
