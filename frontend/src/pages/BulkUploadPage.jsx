import { useState, useRef, useCallback } from 'react'
import { toast } from 'react-toastify'
import {
  Upload, FileSpreadsheet, Download, CheckCircle2, XCircle, AlertCircle, RefreshCw,
} from 'lucide-react'
import { bulkUploadApi } from '../api/bulkUploadApi'
import { downloadTemplate } from '../utils/excelTemplate'

const STATUS = {
  IDLE:       'IDLE',
  UPLOADING:  'UPLOADING',
  PROCESSING: 'PROCESSING',
  DONE:       'DONE',
  FAILED:     'FAILED',
}

export default function BulkUploadPage() {
  const [file,         setFile]         = useState(null)
  const [dragOver,     setDragOver]     = useState(false)
  const [status,       setStatus]       = useState(STATUS.IDLE)
  const [uploadPct,    setUploadPct]    = useState(0)
  const [jobResult,    setJobResult]    = useState(null)
  const fileInputRef = useRef(null)
  const pollRef      = useRef(null)

  const handleFileDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer?.files?.[0] || e.target.files?.[0]
    if (!f) return
    if (!f.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Please upload a valid Excel file (.xlsx or .xls)')
      return
    }
    setFile(f)
    setStatus(STATUS.IDLE)
    setJobResult(null)
  }, [])

  const startPolling = (jobId) => {
    setStatus(STATUS.PROCESSING)
    pollRef.current = setInterval(async () => {
      try {
        const r = await bulkUploadApi.getJobStatus(jobId)
        const job = r.data
        if (job.status === 'COMPLETED' || job.status === 'FAILED') {
          clearInterval(pollRef.current)
          setJobResult(job)
          setStatus(job.status === 'COMPLETED' ? STATUS.DONE : STATUS.FAILED)
          if (job.status === 'COMPLETED') toast.success(`Import done! ${job.processed} records created.`)
          else toast.error('Import completed with errors.')
        }
      } catch {
        clearInterval(pollRef.current)
        setStatus(STATUS.FAILED)
      }
    }, 2000)
  }

  const handleUpload = async () => {
    if (!file) { toast.warn('Please select a file first.'); return }
    setStatus(STATUS.UPLOADING)
    setUploadPct(0)
    try {
      const r = await bulkUploadApi.uploadFile(file, (e) => {
        if (e.total) setUploadPct(Math.round((e.loaded / e.total) * 100))
      })
      const { jobId } = r.data
      startPolling(jobId)
    } catch (e) {
      toast.error(e.message)
      setStatus(STATUS.FAILED)
    }
  }

  const reset = () => {
    clearInterval(pollRef.current)
    setFile(null); setStatus(STATUS.IDLE); setUploadPct(0); setJobResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isActive = [STATUS.UPLOADING, STATUS.PROCESSING].includes(status)

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Bulk Upload Customers</h1>
          <p>Import up to 1,000,000 customers from an Excel file</p>
        </div>
        <button className="btn btn-secondary" onClick={downloadTemplate}>
          <Download size={15} /> Download Template
        </button>
      </div>

      {/* Instructions */}
      <div
        className="card"
        style={{ marginBottom: 20, background: 'var(--warning-light)', borderColor: 'rgba(210,153,34,0.3)' }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <AlertCircle size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--warning)' }}>
              Required Excel Format
            </div>
            <ul style={{ paddingLeft: 18, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.9 }}>
              <li>Column A: <strong style={{ color: 'var(--text-primary)' }}>name</strong> — Customer full name (mandatory)</li>
              <li>Column B: <strong style={{ color: 'var(--text-primary)' }}>date_of_birth</strong> — Format: YYYY-MM-DD (mandatory)</li>
              <li>Column C: <strong style={{ color: 'var(--text-primary)' }}>nic_number</strong> — Unique NIC (mandatory)</li>
            </ul>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
              Row 1 must be the header row. Large files are processed in the background — do not close this tab.
            </p>
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div
          className={`upload-zone${dragOver ? ' drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => !isActive && fileInputRef.current?.click()}
          style={{ cursor: isActive ? 'not-allowed' : 'pointer' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleFileDrop}
          />
          <FileSpreadsheet size={48} color={file ? 'var(--success)' : 'var(--text-muted)'} />
          <div className="upload-zone-title">
            {file ? file.name : 'Drop your Excel file here'}
          </div>
          <div className="upload-zone-sub">
            {file
              ? `${(file.size / 1024 / 1024).toFixed(2)} MB · Click to change`
              : 'or click to browse — .xlsx / .xls supported'}
          </div>
        </div>
      </div>

      {/* Upload progress */}
      {status === STATUS.UPLOADING && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Uploading file… {uploadPct}%</div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${uploadPct}%` }} />
          </div>
        </div>
      )}

      {/* Processing */}
      {status === STATUS.PROCESSING && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
            <div>
              <div style={{ fontWeight: 600 }}>Processing records…</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                This may take a few minutes for large files. Please keep this tab open.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {jobResult && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            borderColor: status === STATUS.DONE ? 'var(--success)' : 'var(--danger)',
            background: status === STATUS.DONE ? 'var(--success-light)' : 'var(--danger-light)',
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            {status === STATUS.DONE
              ? <CheckCircle2 size={22} color="var(--success)" style={{ flexShrink: 0 }} />
              : <XCircle     size={22} color="var(--danger)"  style={{ flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>
                {status === STATUS.DONE ? 'Import Completed' : 'Import Completed with Errors'}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                {[
                  { label: 'Total Rows',  val: jobResult.total },
                  { label: 'Created',     val: jobResult.processed, color: 'var(--success)' },
                  { label: 'Failed',      val: jobResult.failed,    color: jobResult.failed ? 'var(--danger)' : undefined },
                ].map(({ label, val, color }) => (
                  <div
                    key={label}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 2 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: color || 'var(--text-primary)' }}>
                      {(val || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {jobResult.errors && jobResult.errors.length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6 }}>
                    First {Math.min(jobResult.errors.length, 10)} errors:
                  </div>
                  <div
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px',
                      fontSize: '0.78rem',
                      fontFamily: 'monospace',
                      maxHeight: 160,
                      overflowY: 'auto',
                      color: 'var(--danger)',
                    }}
                  >
                    {jobResult.errors.slice(0, 10).map((e, i) => (
                      <div key={i}>Row {e.row}: {e.message}</div>
                    ))}
                    {jobResult.errors.length > 10 && (
                      <div style={{ color: 'var(--text-muted)' }}>
                        … and {jobResult.errors.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        {(status === STATUS.DONE || status === STATUS.FAILED || file) && (
          <button className="btn btn-secondary" onClick={reset} disabled={isActive}>
            <RefreshCw size={15} /> Reset
          </button>
        )}
        <button
          className="btn btn-primary btn-lg"
          onClick={handleUpload}
          disabled={!file || isActive}
        >
          <Upload size={16} />
          {status === STATUS.UPLOADING  ? `Uploading… ${uploadPct}%` :
           status === STATUS.PROCESSING ? 'Processing…' :
           'Start Import'}
        </button>
      </div>
    </>
  )
}
