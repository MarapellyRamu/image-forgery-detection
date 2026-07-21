"""
Service for generating PDF reports.
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import io

def generate_report(prediction_data: dict, user_data: dict, output_path: str):
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#2c3e50'),
        alignment=1,
        spaceAfter=30
    )
    
    normal_style = styles['Normal']
    
    elements = []
    
    # Header
    elements.append(Paragraph("Image Forgery Detection Report", title_style))
    
    # User info
    user_info = [
        ["Requested By", user_data.get('username', 'Unknown')],
        ["Email", user_data.get('email', 'Unknown')],
        ["Date", prediction_data.get('created_at', 'Unknown')]
    ]
    t = Table(user_info, colWidths=[150, 300])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))
    
    # Detection Result
    result = prediction_data.get('result', 'unknown').upper()
    color = colors.red if result == "FORGED" else colors.green
    
    result_style = ParagraphStyle(
        'ResultStyle',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=color,
        alignment=1,
        spaceAfter=20
    )
    elements.append(Paragraph(f"Detection Result: {result}", result_style))
    
    # Prediction details
    conf = prediction_data.get('confidence', 0)
    details = [
        ["Confidence", f"{conf * 100:.2f}%"],
        ["Processing Time", f"{prediction_data.get('processing_time', 0):.2f}s"],
        ["Model Used", prediction_data.get('model_used', 'N/A')]
    ]
    t2 = Table(details, colWidths=[150, 300])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    elements.append(t2)
    elements.append(Spacer(1, 30))
    
    # Images (Page break typically needed but we will just add them)
    orig_path = prediction_data.get('image_path')
    grad_path = prediction_data.get('grad_cam_path')
    
    if orig_path and os.path.exists(orig_path) and grad_path and os.path.exists(grad_path):
        elements.append(Paragraph("Original Image vs GradCAM Heatmap", styles['Heading3']))
        elements.append(Spacer(1, 10))
        
        try:
            img_orig = Image(orig_path, width=224, height=224)
            img_grad = Image(grad_path, width=224, height=224)
            
            img_table = Table([[img_orig, img_grad]])
            img_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')
            ]))
            elements.append(img_table)
        except Exception as e:
            elements.append(Paragraph(f"Error loading images: {str(e)}", normal_style))
            
    doc.build(elements)
    
    return output_path
