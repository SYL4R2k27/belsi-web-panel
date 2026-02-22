import { useState, useRef, useCallback } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { cn } from '@/shared/lib/utils'
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  Download,
  FolderOpen,
  X,
} from 'lucide-react'

interface DocFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  addedAt: Date
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

export default function DocumentsPage() {
  const [files, setFiles] = useState<DocFile[]>([])
  const [viewingFile, setViewingFile] = useState<DocFile | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return
    const newFiles: DocFile[] = []
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        newFiles.push({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          addedAt: new Date(),
        })
      }
    }
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  function removeFile(id: string) {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file) URL.revokeObjectURL(file.url)
      return prev.filter((f) => f.id !== id)
    })
    if (viewingFile?.id === id) {
      setViewingFile(null)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Документы"
        description="Загрузка и просмотр PDF документов"
        actions={
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Загрузить PDF
          </Button>
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {/* Drop zone */}
      {files.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 transition-colors cursor-pointer',
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/20 hover:border-primary/50',
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Перетащите PDF файлы сюда</h3>
          <p className="text-muted-foreground text-sm">
            или нажмите, чтобы выбрать файлы с компьютера
          </p>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div>
          {/* Drop zone (compact) when files exist */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'mb-4 flex items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors cursor-pointer',
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/20 hover:border-primary/50',
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Перетащите ещё файлы или нажмите для загрузки</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {files.map((file) => (
              <Card key={file.id} className="group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setViewingFile(file)}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Просмотр
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <a href={file.url} download={file.name}>
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeFile(file.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* PDF Viewer Dialog */}
      <Dialog open={!!viewingFile} onOpenChange={(open) => !open && setViewingFile(null)}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 flex flex-col">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-red-600" />
                <div>
                  <DialogTitle className="text-base">{viewingFile?.name}</DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    {viewingFile && formatFileSize(viewingFile.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {viewingFile && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={viewingFile.url} download={viewingFile.name}>
                      <Download className="mr-1 h-4 w-4" />
                      Скачать
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {viewingFile && (
              <iframe
                src={viewingFile.url}
                className="h-full w-full border-0"
                title={viewingFile.name}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
