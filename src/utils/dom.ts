/**
 * download blob file
 * @param blobData
 * @param fileName
 */
export function downloadBlobFile(blobData: Blob, fileName: string) {
  const blob = new Blob([blobData])
  const downloadElement = document.createElement('a')
  const href = window.URL.createObjectURL(blob)
  downloadElement.href = href
  downloadElement.download = fileName
  document.body.appendChild(downloadElement)
  downloadElement.click()
  document.body.removeChild(downloadElement)
  window.URL.revokeObjectURL(href)
}
