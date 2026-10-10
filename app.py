"""
Smart Data Analytics Dashboard - Python Flask Backend
Provides REST API endpoints for CSV, XLSX, and XLS data processing,
automated statistical summaries, column type detection, filtering, and exports.
"""

import os
import io
import json
import uuid
import tempfile
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
import pandas as pd
import numpy as np

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB limit
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls'}

# In-memory session storage for active datasets (keyed by session_id)
# In production, use Redis or short-lived serverless cache
DATASET_CACHE = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def detect_column_types(df):
    columns_meta = []
    total_rows = len(df)
    
    for col in df.columns:
        series = df[col]
        missing_count = int(series.isna().sum())
        non_null_series = series.dropna()
        non_null_count = len(non_null_series)
        unique_count = int(series.nunique())
        
        col_type = 'text'
        min_val, max_val, sum_val, mean_val, median_val = None, None, None, None, None
        distinct_values = [str(x) for x in non_null_series.unique()[:50]]
        
        if pd.api.types.is_numeric_dtype(series):
            col_type = 'numeric'
            if non_null_count > 0:
                min_val = float(series.min())
                max_val = float(series.max())
                sum_val = float(series.sum())
                mean_val = round(float(series.mean()), 2)
                median_val = round(float(series.median()), 2)
        elif pd.api.types.is_datetime64_any_dtype(series):
            col_type = 'date'
        else:
            # Test if parseable as dates
            try:
                converted_dates = pd.to_datetime(non_null_series.astype(str), errors='coerce')
                if converted_dates.notna().sum() / max(1, non_null_count) >= 0.8:
                    col_type = 'date'
            except Exception:
                pass
            
            # If not date, check if categorical
            if col_type != 'date':
                if unique_count <= min(100, max(5, int(total_rows * 0.3))):
                    col_type = 'categorical'

        meta = {
            'name': str(col),
            'type': col_type,
            'uniqueCount': unique_count,
            'missingCount': missing_count,
            'distinctValues': distinct_values
        }
        if col_type == 'numeric':
            meta.update({
                'min': min_val,
                'max': max_val,
                'sum': sum_val,
                'mean': mean_val,
                'median': median_val
            })
            
        columns_meta.append(meta)
        
    return columns_meta

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part provided in request.'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected.'}), 400
        
    if not allowed_file(file.filename):
        return jsonify({'error': 'Unsupported file format. Please upload CSV, XLSX, or XLS.'}), 400
        
    filename = secure_filename(file.filename)
    extension = filename.rsplit('.', 1)[1].lower()
    
    try:
        if extension == 'csv':
            df = pd.read_csv(file)
        elif extension in ['xlsx', 'xls']:
            df = pd.read_excel(file)
        else:
            return jsonify({'error': 'Unsupported file format.'}), 400
            
        if df.empty:
            return jsonify({'error': 'Uploaded spreadsheet contains no data rows.'}), 400
            
        session_id = str(uuid.uuid4())
        DATASET_CACHE[session_id] = {
            'df': df,
            'fileName': filename,
            'uploadedAt': datetime.utcnow()
        }
        
        row_count = len(df)
        col_count = len(df.columns)
        duplicate_rows = int(df.duplicated().sum())
        missing_total = int(df.isna().sum().sum())
        columns_meta = detect_column_types(df)
        
        preview_data = df.head(50).fillna('').to_dict(orient='records')
        
        return jsonify({
            'sessionId': session_id,
            'fileName': filename,
            'rowCount': row_count,
            'columnCount': col_count,
            'duplicateRows': duplicate_rows,
            'missingTotal': missing_total,
            'columns': columns_meta,
            'preview': preview_data
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to process file: {str(e)}'}), 500

@app.route('/api/filter', methods=['POST'])
def filter_data():
    req_data = request.get_json() or {}
    session_id = req_data.get('sessionId')
    
    if not session_id or session_id not in DATASET_CACHE:
        return jsonify({'error': 'Session expired or not found. Please re-upload.'}), 404
        
    df = DATASET_CACHE[session_id]['df'].copy()
    
    # 1. Search filter
    search_query = req_data.get('search', '').strip().lower()
    if search_query:
        mask = df.astype(str).apply(lambda row: row.str.lower().str.contains(search_query, regex=False).any(), axis=1)
        df = df[mask]
        
    # 2. Categorical filters
    categorical = req_data.get('categorical', {})
    for col, selected_vals in categorical.items():
        if selected_vals and col in df.columns:
            df = df[df[col].astype(str).isin(selected_vals)]
            
    # 3. Numeric range filters
    numeric = req_data.get('numeric', {})
    for col, r in numeric.items():
        if col in df.columns and pd.api.types.is_numeric_dtype(df[col]):
            if r.get('min') is not None:
                df = df[df[col] >= float(r['min'])]
            if r.get('max') is not None:
                df = df[df[col] <= float(r['max'])]
                
    page = int(req_data.get('page', 1))
    page_size = int(req_data.get('pageSize', 25))
    total_filtered = len(df)
    
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    records = df.iloc[start_idx:end_idx].fillna('').to_dict(orient='records')
    
    return jsonify({
        'totalFiltered': total_filtered,
        'page': page,
        'pageSize': page_size,
        'records': records
    })

@app.route('/api/export', methods=['POST'])
def export_dataset():
    req_data = request.get_json() or {}
    session_id = req_data.get('sessionId')
    export_format = req_data.get('format', 'csv').lower()
    
    if not session_id or session_id not in DATASET_CACHE:
        return jsonify({'error': 'Session not found.'}), 404
        
    df = DATASET_CACHE[session_id]['df']
    
    if export_format == 'excel':
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Data')
        output.seek(0)
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name='filtered_export.xlsx'
        )
    else:
        output = io.StringIO()
        df.to_csv(output, index=False)
        mem = io.BytesIO(output.getvalue().encode('utf-8'))
        return send_file(
            mem,
            mimetype='text/csv',
            as_attachment=True,
            download_name='filtered_export.csv'
        )

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
