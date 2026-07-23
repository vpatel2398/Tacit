/**
 * Extracts plain text from uploaded documents.
 * Supports: PDF, Word (.docx), plain text (.txt), markdown (.md), CSV
 */

export async function parseDocument(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const ext = fileName.toLowerCase().split('.').pop() || ''

  switch (ext) {
    case 'pdf':
      return parsePDF(buffer)
    case 'docx':
      return parseDocx(buffer)
    case 'txt':
    case 'md':
    case 'csv':
      return buffer.toString('utf-8')
    default:
      throw new Error(`Unsupported file type: .${ext}. Use PDF, DOCX, TXT, MD, or CSV.`)
  }
}

async function parsePDF(buffer: Buffer): Promise<string> {
  // pdf-parse v2 API: instantiate PDFParse with the buffer, call getText()
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data: buffer })
  try {
    const result = await parser.getText()
    return result.text
  } finally {
    // Always free memory
    await parser.destroy()
  }
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

/**
 * Guess a friendly doc_type from the filename/extension.
 */
export function guessDocType(fileName: string): string {
  const lower = fileName.toLowerCase()
  if (lower.includes('sop') || lower.includes('procedure')) return 'SOP'
  if (lower.includes('policy')) return 'policy'
  if (lower.includes('manual')) return 'manual'
  if (lower.includes('report')) return 'report'
  if (lower.includes('spec')) return 'specification'
  const ext = lower.split('.').pop() || ''
  return ext.toUpperCase()
}