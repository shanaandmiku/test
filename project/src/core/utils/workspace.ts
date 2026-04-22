export const initWorkSpace = async (dirHandle: FileSystemDirectoryHandle) => {
  const requireDirs = ['project', 'template']
  for (const requireDir of requireDirs) {
    await dirHandle.getDirectoryHandle(requireDir, { create: true })
  }
}
