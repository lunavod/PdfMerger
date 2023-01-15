import { useEffect, useRef, useState } from 'react'
import './App.css'

import PDFMerger from 'pdf-merger-js/browser'
import { v4 } from 'uuid'
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from 'react-beautiful-dnd'

function App() {
  const [files, setFiles] = useState<{ id: string; file: File }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!inputRef.current) return

    const onChange = (e: Event) => {
      const target = e.target as HTMLInputElement
      const files = Array.from(target.files || [])
      setFiles((f) => [...f, ...files.map((file) => ({ id: v4(), file }))])
      target.value = ''
    }

    inputRef.current.addEventListener('change', onChange)

    return () => {
      inputRef.current?.removeEventListener('change', onChange)
    }
  })

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(files)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setFiles(items)
  }

  const removeFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id))
  }

  return (
    <div className="App">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="listWrapper"
            >
              {files.map((el, i) => (
                <Draggable draggableId={el.id} key={el.id} index={i}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="listElement"
                    >
                      {i + 1}) {el.file.name}
                      <div className="remove" onClick={() => removeFile(el.id)}>
                        X
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <div
                className="addFile"
                onClick={() => inputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={inputRef}
                  multiple
                  style={{ display: 'none' }}
                />
                <div>+ Добавить файл</div>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div>
        <Merger files={files.map((f) => f.file)} />
      </div>
    </div>
  )
}

export default App

const Merger = ({ files }: { files: File[] }) => {
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string>()

  useEffect(() => {
    const render = async () => {
      const merger = new PDFMerger()

      for (const file of files) {
        await merger.add(file)
      }

      const mergedPdf = await merger.saveAsBlob()
      const url = URL.createObjectURL(mergedPdf)

      return setMergedPdfUrl(url)
    }

    render().catch((err) => {
      throw err
    })
    ;() => setMergedPdfUrl('')
  }, [files, setMergedPdfUrl])

  return !mergedPdfUrl ? (
    <>Loading</>
  ) : (
    <iframe
      src={`${mergedPdfUrl}`}
      title="pdf-viewer"
      width="100%"
      height="100%"
      style={{ border: 'none' }}
    ></iframe>
  )
}
