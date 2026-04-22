import { useState, useEffect, useCallback } from "react";
import SharedSidebar from "./SharedSidebar.jsx";
import {
  FileText,
  Video,
  Upload,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  Eye,
  X,
} from "lucide-react";

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ScholarFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8081/api/files");
      const data = await res.json();
      setFiles(data.files);
    } catch {
      console.error("Failed to fetch files");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (file) => {
    if (!file || !file.name.endsWith(".pdf")) {
      setUploadStatus({ type: "error", message: "Only PDF files are supported" });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8081/api/files/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setUploadStatus({
          type: "success",
          message: `${data.filename} uploaded and indexing...`,
        });
        setTimeout(fetchFiles, 1000);
      } else {
        setUploadStatus({ type: "error", message: data.error });
      }
    } catch {
      setUploadStatus({ type: "error", message: "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    try {
      await fetch(`http://localhost:8081/api/files/${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      fetchFiles();
    } catch {
      console.error("Delete failed");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const filtered = files.filter((f) =>
    f.displayName.toLowerCase().includes(search.toLowerCase())
  );

  const courseReadings = filtered.filter((f) => f.type === "reading" && f.builtIn);
  const lectures = filtered.filter((f) => f.type === "lecture");
  const userFiles = filtered.filter((f) => !f.builtIn);

  return (
    <div className="h-screen flex flex-col">
      <header className="h-12 border-b border-line bg-white flex items-center px-5 shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-lg leading-none">≋</span>
          <span className="font-semibold text-ink">ScholarStack</span>
          <span className="text-sub2 mx-1">›</span>
          <span className="text-sub">Student Portal</span>
          <span className="text-sub2 mx-1">›</span>
          <span className="text-ink2 font-medium">StackVoice</span>
          <span className="text-sub2 mx-1">›</span>
          <span className="text-ink2 font-medium">Scholar Files</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <SharedSidebar active="files" />

        <div className="flex-1 overflow-auto bg-white">
          <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold text-ink mb-1">Scholar Files</h1>
                <p className="text-sub text-sm">
                  {files.length} files indexed for AI search
                </p>
              </div>
              <label className="btn-primary cursor-pointer">
                <Upload size={14} />
                Upload PDF
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files[0])}
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Upload zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 mb-6 text-center transition ${
                dragOver
                  ? "border-ink bg-gray-50"
                  : "border-line"
              }`}
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-sub">
                  <Loader2 size={16} className="animate-spin" />
                  Uploading and indexing...
                </div>
              ) : (
                <p className="text-sm text-sub">
                  Drag and drop a PDF here, or use the Upload button
                </p>
              )}
            </div>

            {uploadStatus && (
              <div
                className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm mb-6 ${
                  uploadStatus.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {uploadStatus.type === "success" ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <AlertCircle size={14} />
                )}
                {uploadStatus.message}
              </div>
            )}

            {/* Search */}
            <div className="relative mb-5">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sub" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..."
                className="input pl-8"
              />
            </div>

            {loading ? (
              <div className="text-center py-12 text-sub text-sm">Loading files...</div>
            ) : (
              <>
                {/* User uploaded */}
                {userFiles.length > 0 && (
                  <Section title="My Uploads" count={userFiles.length}>
                    {userFiles.map((f) => (
                      <FileRow
                        key={f.name}
                        file={f}
                        onDelete={() => handleDelete(f.name)}
                        onPreview={() => setPreview(f)}
                      />
                    ))}
                  </Section>
                )}

                {/* Course Readings */}
                {courseReadings.length > 0 && (
                  <Section title="Course Materials" count={courseReadings.length}>
                    {courseReadings.map((f) => (
                      <FileRow key={f.name} file={f} onPreview={() => setPreview(f)} />
                    ))}
                  </Section>
                )}

                {/* Lectures */}
                {lectures.length > 0 && (
                  <Section title="Lectures" count={lectures.length}>
                    {lectures.map((f) => (
                      <FileRow key={f.name} file={f} onPreview={() => setPreview(f)} />
                    ))}
                  </Section>
                )}

                {filtered.length === 0 && (
                  <div className="text-center py-12 text-sub text-sm">
                    {search ? "No files match your search" : "No files uploaded yet"}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-line shrink-0">
              <h3 className="text-sm font-semibold text-ink truncate">{preview.displayName}</h3>
              <button onClick={() => setPreview(null)} className="text-sub hover:text-ink ml-4 shrink-0">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1">
              {preview.type === "lecture" ? (
                <video
                  src={`http://localhost:8081/lectures/${encodeURIComponent(preview.name)}`}
                  controls
                  autoPlay
                  className="w-full h-full rounded-b-lg bg-black"
                />
              ) : (
                <iframe
                  src={`http://localhost:8081/pdfs/${encodeURIComponent(preview.name)}`}
                  className="w-full h-full border-0 rounded-b-lg"
                  title={preview.displayName}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, count, children }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xs font-semibold text-sub uppercase tracking-wide">{title}</h2>
        <span className="text-xs text-sub2">{count}</span>
      </div>
      <div className="card divide-y divide-line">{children}</div>
    </div>
  );
}

function FileRow({ file, onDelete, onPreview }) {
  const isLecture = file.type === "lecture";
  const Icon = isLecture ? Video : FileText;

  return (
    <div className="flex items-center gap-3 px-4 py-3 group">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isLecture ? "bg-violet-50 text-violet-500" : "bg-blue-50 text-blue-500"
        }`}
      >
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onPreview}>
        <div className="text-sm font-medium text-ink truncate hover:underline">
          {file.displayName}
        </div>
        <div className="text-xs text-sub">
          {fmtSize(file.size)} · {fmtDate(file.modified)}
          {isLecture && file.hasTranscript && (
            <span className="ml-2 text-emerald-600">Transcribed</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-0.5 rounded-full text-xs ${
            isLecture
              ? "bg-violet-50 text-violet-600"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          {isLecture ? "Lecture" : "Reading"}
        </span>
        <button
          onClick={onPreview}
          className="opacity-0 group-hover:opacity-100 text-sub hover:text-ink transition"
        >
          <Eye size={14} />
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 text-sub hover:text-rose-600 transition"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
