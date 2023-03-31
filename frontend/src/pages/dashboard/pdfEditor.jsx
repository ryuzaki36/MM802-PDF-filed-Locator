import { useRef } from "react";
import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';


function PdfEditor() {
  const canvasRef = useRef(null);
  const fieldsRef = useRef({});

  const onFileChange = async (event) => {
    const file = event.target.files[0];

    // Load the PDF file
    const doc = await pdfjs.getDocument(URL.createObjectURL(file)).promise;

    // Render the first page on a canvas
    const pageNumber = 1;
    const page = await doc.getPage(pageNumber);
    const scale = 1.5;
    const viewport = page.getViewport({ scale });
    const canvas = canvasRef.current;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;

    // Add form fields to the canvas and fieldsRef
    const fieldsObj = await doc.getFieldObjects();
    Object.entries(fieldsObj).forEach(([key, value]) => {
      fieldsRef.current[key] = value[0];
      const field = value[0];
      const fieldRect = field.rect;
      const fieldElement = document.createElement('input');
      fieldElement.style.position = 'absolute';
      fieldElement.style.left = `${fieldRect[0]}px`;
      fieldElement.style.top = `${fieldRect[1]}px`;
      fieldElement.style.width = `${fieldRect[2] - fieldRect[0]}px`;
      fieldElement.style.height = `${fieldRect[3] - fieldRect[1]}px`;
      canvas.parentElement.appendChild(fieldElement);
    });
  };

  return (
    <div className="relative">
      <input type="file" onChange={onFileChange} />
      <canvas ref={canvasRef} />
    </div>
  );

}

export default PdfEditor;
