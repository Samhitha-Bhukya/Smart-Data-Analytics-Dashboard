# Smart Data Analytics Dashboard

An interactive full-stack analytics dashboard web application for instant CSV and Excel spreadsheet exploration, automatic statistical profiling, dynamic Chart.js visualizations, multi-attribute filtering, and filtered data exports.

---

## 🌟 Key Features

1. **Spreadsheet Ingestion & Validation**
   - Drag-and-drop or browse upload supporting **CSV (.csv)**, **Excel OpenXML (.xlsx)**, and **Legacy Excel (.xls)**.
   - Pre-analysis preview card showing file name, file size, row count, column count, and first 5 preview rows.
   - Graceful handling of empty files, malformed rows, missing cells, and duplicate headers.

2. **Automated Data Profiling & Statistics**
   - Automatic classification into `numeric`, `categorical`, `date`, and `text` columns.
   - Calculation of dataset totals: record count, dimension count, missing value counts, and duplicate row detection.
   - Descriptive statistics for quantitative variables: sum, mean, median, min, max.
   - Unique group cardinality for categorical dimensions and time range discovery for temporal columns.
   - Concise human-readable natural language summary of the dataset.

3. **Interactive Visualizations (Chart.js)**
   - Automatic generation of sensible default charts (bar charts, time-series line charts, doughnut/pie charts, histograms, scatter plots, area charts).
   - In-chart customization controls:
     - Switch chart types dynamically.
     - Choose independent (X-axis) and dependent (Y-axis) columns.
     - Select aggregation function (`SUM`, `AVG`, `COUNT`, `MIN`, `MAX`).
     - Rename chart titles with inline editing.
     - Export individual charts as high-resolution PNG images.
   - Create custom user-defined charts on the fly.

4. **Multi-Attribute Interactive Filters**
   - Global keyword search across all fields.
   - Categorical dimension filtering via interactive value selectors.
   - Numeric range filters (min and max boundary inputs).
   - Date range boundaries (start date and end date).
   - Instant real-time updates across KPI cards, Chart.js visualizations, statistical summaries, and the data table.
   - One-click filter reset.

5. **Dynamic KPI Cards**
   - Total records (active filtered rows vs. total dataset rows).
   - Total dimensions with type breakdown.
   - Data completeness and missing value count.
   - Duplicate records alert.
   - Configurable metric card: select any numeric dimension and toggle Sum, Average, Min, Max, or Count in real time.

6. **Searchable & Sortable Data Table**
   - In-table instant search.
   - Ascending/descending sorting on all column types.
   - Configurable pagination (10, 25, 50, 100 rows per page).
   - Horizontal scrolling for wide datasets.
   - Numeric columns formatted with aligned monospace figures (`tabular-nums`).

7. **Export & Report Generation**
   - Download active filtered data as **CSV**.
   - Download active filtered data as **Excel (.xlsx)**.
   - Download individual visualizations as **PNG**.
   - Print-optimized **PDF / Browser Report** view with clean margins.

8. **Theme & User Experience**
   - Sleek Light and Dark Mode toggle with persistent preference.
   - 3 prepared sample datasets (Global E-Commerce Sales, Enterprise Tech HR & Compensation, Cloud SaaS Metrics) for 1-click exploration.

---

## 🚀 Running Locally

### Option 1: Web Application (React + Vite + TypeScript)

The web dashboard is fully equipped with high-performance in-browser spreadsheet parsing via SheetJS (`xlsx`) and Chart.js, ensuring zero server upload latency and complete data privacy.

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:3000`.

---

### Option 2: Python Flask Backend (Python 3.9+)

A standalone Python Flask REST API backend is provided in `app.py` for headless data processing using Pandas, NumPy, and OpenPyXL:

1. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the Flask server**:
   ```bash
   python app.py
   ```

4. The API runs on `http://localhost:5000` with the following endpoints:
   - `POST /api/upload`: Upload spreadsheet file (`.csv`, `.xlsx`, `.xls`) and receive metadata, column profiling, and initial preview rows.
   - `POST /api/filter`: Apply search, categorical, and range filters on the session dataset.
   - `POST /api/export`: Export filtered results as `.csv` or `.xlsx`.
   - `GET /api/health`: Health status probe.

---

## 📁 Project Structure

```
├── app.py                      # Standalone Python Flask REST API backend
├── requirements.txt            # Python dependencies (Flask, pandas, openpyxl, xlrd)
├── README.md                   # Project documentation & run guide
├── index.html                  # HTML entry point with fonts & meta tags
├── metadata.json               # Applet metadata configuration
├── package.json                # Node dependencies (React 19, Vite, Chart.js, XLSX)
├── tsconfig.json               # TypeScript compiler options
├── vite.config.ts              # Vite bundler configuration
└── src/
    ├── App.tsx                 # Main application controller & state
    ├── main.tsx                # React DOM root entry
    ├── index.css               # Tailwind CSS & global typography
    ├── types/
    │   └── analytics.ts        # TypeScript interfaces for datasets, columns, charts & filters
    ├── utils/
    │   ├── dataProcessor.ts    # SheetJS parsing, type detection, statistics & aggregations
    │   └── sampleData.ts       # 3 domain sample datasets for 1-click testing
    └── components/
        ├── Navbar.tsx          # Top navigation bar with theme toggle & actions
        ├── UploadModal.tsx     # Drag-and-drop upload & pre-analysis preview
        ├── KpiCards.tsx        # Responsive KPI stat cards with dynamic metrics
        ├── FilterPanel.tsx     # Multi-attribute filter drawer & global search
        ├── ChartCard.tsx       # Chart.js visualization card with controls & PNG export
        ├── ChartGrid.tsx       # Responsive chart container
        ├── DataTable.tsx       # Paginated, sortable, and searchable data table
        ├── SummarySection.tsx  # Statistical summary tables & natural narrative
        └── ExportModal.tsx     # Export dialog for CSV, Excel, and Print reports
```
