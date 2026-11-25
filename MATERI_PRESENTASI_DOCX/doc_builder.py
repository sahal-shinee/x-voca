import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

# Color palette
COLOR_PRIMARY = RGBColor(30, 58, 138)     # Navy #1E3A8A
COLOR_SECONDARY = RGBColor(13, 148, 136) # Teal #0D9488
COLOR_ACCENT = RGBColor(37, 99, 235)     # Blue #2563EB
COLOR_TEXT = RGBColor(51, 65, 85)        # Slate 700 #334155
COLOR_MUTED = RGBColor(100, 116, 139)    # Slate 500 #64748B
COLOR_WHITE = RGBColor(255, 255, 255)

HEX_PRIMARY = "1E3A8A"
HEX_LIGHT_BG = "F8FAFC"
HEX_CODE_BG = "F1F5F9"
HEX_CALLOUT_INFO_BG = "EFF6FF"
HEX_CALLOUT_INFO_BORDER = "3B82F6"
HEX_CALLOUT_WARN_BG = "FEF3C7"
HEX_CALLOUT_WARN_BORDER = "F59E0B"
HEX_CALLOUT_SUCCESS_BG = "ECFDF5"
HEX_CALLOUT_SUCCESS_BORDER = "10B981"
HEX_BORDER = "CBD5E1"

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_base_document():
    doc = docx.Document()
    
    # Page setup: Standard A4 or Letter, 1 inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.9)
        section.bottom_margin = Inches(0.9)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
    # Set default style font
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = COLOR_TEXT
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(4)
    
    return doc

def add_header_banner(doc, title, subtitle, tag="PANDUAN PRESENTASI X-VOCA"):
    # Header tag
    p_tag = doc.add_paragraph()
    p_tag.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_tag.paragraph_format.space_after = Pt(2)
    run_tag = p_tag.add_run(f"★ {tag.upper()} ★")
    run_tag.bold = True
    run_tag.font.size = Pt(9.5)
    run_tag.font.color.rgb = COLOR_SECONDARY
    
    # Document Title
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run(title)
    run_title.bold = True
    run_title.font.size = Pt(22)
    run_title.font.color.rgb = COLOR_PRIMARY
    
    # Subtitle
    if subtitle:
        p_sub = doc.add_paragraph()
        p_sub.paragraph_format.space_after = Pt(14)
        run_sub = p_sub.add_run(subtitle)
        run_sub.font.size = Pt(12)
        run_sub.font.italic = True
        run_sub.font.color.rgb = COLOR_MUTED
        
    # Divider line
    p_div = doc.add_paragraph()
    p_div.paragraph_format.space_after = Pt(12)
    run_div = p_div.add_run("―" * 55)
    run_div.font.color.rgb = COLOR_SECONDARY
    run_div.bold = True

def add_heading_1(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
    r = h.add_run(text)
    r.bold = True
    r.font.size = Pt(15)
    r.font.color.rgb = COLOR_PRIMARY
    return h

def add_heading_2(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(12)
    h.paragraph_format.space_after = Pt(4)
    h.paragraph_format.keep_with_next = True
    r = h.add_run(text)
    r.bold = True
    r.font.size = Pt(13)
    r.font.color.rgb = COLOR_ACCENT
    return h

def add_heading_3(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(8)
    h.paragraph_format.space_after = Pt(3)
    h.paragraph_format.keep_with_next = True
    r = h.add_run(text)
    r.bold = True
    r.font.size = Pt(11.5)
    r.font.color.rgb = COLOR_SECONDARY
    return h

def add_paragraph(doc, text, bold=False, italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(5)
    r = p.add_run(text)
    r.bold = bold
    r.italic = italic
    r.font.color.rgb = COLOR_TEXT
    return p

def add_bullet_point(doc, title, description=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    r_title = p.add_run(title)
    r_title.bold = True
    r_title.font.color.rgb = COLOR_PRIMARY
    if description:
        r_sep = p.add_run(": ")
        r_sep.bold = True
        r_desc = p.add_run(description)
        r_desc.font.color.rgb = COLOR_TEXT
    return p

def add_callout(doc, text, title="CATATAN PENTING UNTUK GURU / PENGUJI", style_type="info"):
    bg_color = HEX_CALLOUT_INFO_BG
    border_color = HEX_CALLOUT_INFO_BORDER
    title_color = COLOR_ACCENT
    
    if style_type == "warn":
        bg_color = HEX_CALLOUT_WARN_BG
        border_color = HEX_CALLOUT_WARN_BORDER
        title_color = RGBColor(180, 83, 9)
    elif style_type == "success":
        bg_color = HEX_CALLOUT_SUCCESS_BG
        border_color = HEX_CALLOUT_SUCCESS_BORDER
        title_color = RGBColor(16, 149, 106)
        
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    # Left thick border
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    r_head = p.add_run(f"💡 {title}\n")
    r_head.bold = True
    r_head.font.size = Pt(10)
    r_head.font.color.rgb = title_color
    
    r_body = p.add_run(text)
    r_body.font.size = Pt(10)
    r_body.font.color.rgb = COLOR_TEXT
    
    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(2)
    p_spacer.paragraph_format.space_after = Pt(4)

def add_code_block(doc, code_str, caption=None):
    if caption:
        p_cap = doc.add_paragraph()
        p_cap.paragraph_format.space_before = Pt(6)
        p_cap.paragraph_format.space_after = Pt(2)
        r_cap = p_cap.add_run(f"💻 Cuplikan Kode: {caption}")
        r_cap.bold = True
        r_cap.font.size = Pt(9.5)
        r_cap.font.color.rgb = COLOR_SECONDARY
        
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, HEX_CODE_BG)
    set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
    
    # Thin gray border around code
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
            <w:left w:val="single" w:sz="12" w:space="0" w:color="{HEX_PRIMARY}"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.05
    r = p.add_run(code_str.strip())
    r.font.name = 'Consolas'
    r.font.size = Pt(9)
    r.font.color.rgb = RGBColor(30, 41, 59)
    
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(2)
    p_after.paragraph_format.space_after = Pt(4)

def add_image_with_caption(doc, image_path, caption=None, width=Inches(6.5)):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run()
    run.add_picture(image_path, width=width)
    
    if caption:
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(2)
        p_cap.paragraph_format.space_after = Pt(10)
        r_cap = p_cap.add_run(f"Gambar: {caption}")
        r_cap.font.size = Pt(9.5)
        r_cap.font.italic = True
        r_cap.font.color.rgb = COLOR_MUTED
    return p

def add_table_data(doc, headers, rows, col_widths=None):
    table = doc.add_table(rows=len(rows) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    # Header row
    hdr_cells = table.rows[0].cells
    for i, header_text in enumerate(headers):
        hdr_cells[i].text = header_text
        set_cell_background(hdr_cells[i], HEX_PRIMARY)
        set_cell_margins(hdr_cells[i], top=80, bottom=80, left=100, right=100)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for run in p.runs:
            run.bold = True
            run.font.size = Pt(10)
            run.font.color.rgb = COLOR_WHITE
            
    # Body rows
    for r_idx, row_data in enumerate(rows):
        row_cells = table.rows[r_idx + 1].cells
        is_even = (r_idx % 2 == 0)
        row_bg = HEX_LIGHT_BG if is_even else "FFFFFF"
        for c_idx, cell_value in enumerate(row_data):
            row_cells[c_idx].text = str(cell_value)
            set_cell_background(row_cells[c_idx], row_bg)
            set_cell_margins(row_cells[c_idx], top=70, bottom=70, left=100, right=100)
            p = row_cells[c_idx].paragraphs[0]
            p.paragraph_format.line_spacing = 1.1
            p.paragraph_format.space_after = Pt(2)
            for run in p.runs:
                run.font.size = Pt(9.5)
                run.font.color.rgb = COLOR_TEXT
                
    # Set borders and col widths
    for row in table.rows:
        for c_idx, cell in enumerate(row.cells):
            tcPr = cell._tc.get_or_add_tcPr()
            borders = parse_xml(f'''
                <w:tcBorders {nsdecls("w")}>
                    <w:top w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
                    <w:left w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
                    <w:bottom w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
                    <w:right w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
                </w:tcBorders>
            ''')
            tcPr.append(borders)
            if col_widths and c_idx < len(col_widths):
                cell.width = col_widths[c_idx]
                
    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(4)
    p_spacer.paragraph_format.space_after = Pt(4)
