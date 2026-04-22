import { get, set } from 'idb-keyval'

const workSpaceKey = 'last-work-space'

export async function getWorkSpace(): Promise<FileSystemDirectoryHandle | null> {
  return (await get(workSpaceKey)) as FileSystemDirectoryHandle | null
}

export async function getAndSelectWorkSpace(): Promise<FileSystemDirectoryHandle> {
  const workSpace = (await get(
    workSpaceKey,
  )) as FileSystemDirectoryHandle | null
  if (!workSpace) {
    return selectWorkSpace()
  }
  return workSpace
}

// 选择工作空间，需要用户动作触发
export async function selectWorkSpace(): Promise<FileSystemDirectoryHandle> {
  const workSpace = (await window.showDirectoryPicker({
    mode: 'readwrite',
  })) as FileSystemDirectoryHandle

  await set(workSpaceKey, workSpace)

  return workSpace
}

// 检查权限
export async function verifyPermission(
  fileHandle: FileSystemDirectoryHandle,
  readWrite: boolean = false,
): Promise<boolean> {
  const options: {
    mode?: 'read' | 'readwrite'
  } = {}
  if (readWrite) {
    options.mode = 'readwrite'
  }
  // 检查权限是否已经被授予。如果是，则返回true。
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true
  }
  // 用户未授权，因此返回false。
  return false
}

// 检查权限并尝试获取权限。需要用户动作触发
export async function requestPermission(
  fileHandle: FileSystemDirectoryHandle,
  readWrite: boolean = false,
): Promise<boolean> {
  const options: {
    mode?: 'read' | 'readwrite'
  } = {}
  if (readWrite) {
    options.mode = 'readwrite'
  }
  // 检查权限是否已经被授予。如果是，则返回true。
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true
  }
  // 请求权限。如果用户同意授权，则返回true。
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true
  }
  // 用户未授权，因此返回false。
  return false
}
