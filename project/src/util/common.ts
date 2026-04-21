import { toRaw, watch, type Ref, type WatchStopHandle } from 'vue'

export interface SyncLocalStorageRefOptions<T> {
  deep?: boolean
  parse?: (rawValue: string) => T
  storage?: Storage | null
  stringify?: (value: T) => string
}

// 同步 localStorage 和响应式变量，默认使用 JSON 序列化。
export function syncLocalStorageRef<T>(
  storageKey: string,
  stateRef: Ref<T>,
  options: SyncLocalStorageRefOptions<T> = {},
): WatchStopHandle {
  const storage = options.storage ?? resolveLocalStorage()
  const deep = options.deep ?? true
  const parse = options.parse ?? parseJson<T>
  const stringify = options.stringify ?? stringifyJson<T>
  let skipPersistCount = 0

  if (!storage) {
    return createEmptyStopHandle()
  }

  const defaultValueSnapshot = createDefaultValueSnapshot(stateRef.value, stringify)

  try {
    const rawValue = storage.getItem(storageKey)

    if (rawValue === null) {
      storage.setItem(storageKey, stringify(toRaw(stateRef.value)))
    } else {
      applyStoredValue(rawValue, stateRef, parse)
    }
  } catch (error) {
    console.warn(`[syncLocalStorageRef] 初始化失败: ${storageKey}`, error)
  }

  const stopWatch = watch(
    stateRef,
    (nextValue) => {
      if (skipPersistCount > 0) {
        return
      }

      try {
        storage.setItem(storageKey, stringify(toRaw(nextValue)))
      } catch (error) {
        console.warn(`[syncLocalStorageRef] 写入失败: ${storageKey}`, error)
      }
    },
    {
      deep,
      flush: 'sync',
    },
  )

  const handleStorage = (event: StorageEvent) => {
    if (event.storageArea !== storage || event.key !== storageKey) {
      return
    }

    try {
      skipPersistCount += 1
      queueMicrotask(() => {
        skipPersistCount = Math.max(skipPersistCount - 1, 0)
      })

      if (event.newValue === null) {
        const defaultValue = restoreDefaultValue(defaultValueSnapshot, parse)

        if (defaultValue !== null) {
          stateRef.value = restoreStoredValue(stateRef.value, defaultValue)
        }

        return
      }

      applyStoredValue(event.newValue, stateRef, parse)
    } catch (error) {
      console.warn(`[syncLocalStorageRef] storage 事件同步失败: ${storageKey}`, error)
    }
  }

  window.addEventListener('storage', handleStorage)

  return () => {
    stopWatch()
    window.removeEventListener('storage', handleStorage)
  }
}

// 读取浏览器 localStorage，避免在非浏览器环境下直接访问报错。
function resolveLocalStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

// 默认使用 JSON 解析字符串。
function parseJson<T>(rawValue: string): T {
  return JSON.parse(rawValue) as T
}

// 默认使用 JSON 序列化值。
function stringifyJson<T>(value: T): string {
  return JSON.stringify(value)
}

// 创建默认值快照，用于 storage 被外部删除时恢复默认状态。
function createDefaultValueSnapshot<T>(
  value: T,
  stringify: (value: T) => string,
): string | null {
  try {
    return stringify(toRaw(value))
  } catch (error) {
    console.warn('[syncLocalStorageRef] 默认值快照创建失败', error)
    return null
  }
}

// 把持久化字符串解析并回填到当前 ref。
function applyStoredValue<T>(
  rawValue: string,
  stateRef: Ref<T>,
  parse: (rawValue: string) => T,
): void {
  const parsedValue = parse(rawValue)
  stateRef.value = restoreStoredValue(stateRef.value, parsedValue)
}

// 当本地存储被删除时，恢复初始默认值。
function restoreDefaultValue<T>(
  defaultValueSnapshot: string | null,
  parse: (rawValue: string) => T,
): T | null {
  if (defaultValueSnapshot === null) {
    return null
  }

  return parse(defaultValueSnapshot)
}

// 对对象状态优先做属性回填，保留已有实例和原型。
function restoreStoredValue<T>(currentValue: T, storedValue: T): T {
  if (isPlainObject(currentValue) && isPlainObject(storedValue)) {
    Object.assign(currentValue, storedValue)
    return currentValue
  }

  return storedValue
}

// 判断一个值是否为普通对象。
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  const rawValue = toRaw(value)

  if (typeof rawValue !== 'object' || rawValue === null || Array.isArray(rawValue)) {
    return false
  }

  const prototype = Object.getPrototypeOf(rawValue)

  return prototype === Object.prototype || prototype === null
}

// 深拷贝纯数据结构，并递归剥离响应式代理。
export function clonePlainData<T>(value: T): T {
  const rawValue = toRaw(value)

  if (Array.isArray(rawValue)) {
    return rawValue.map((item) => clonePlainData(item)) as T
  }

  if (isPlainObject(rawValue)) {
    return Object.entries(rawValue).reduce<Record<string, unknown>>((result, [key, itemValue]) => {
      result[key] = clonePlainData(itemValue)
      return result
    }, {}) as T
  }

  return rawValue as T
}

// 生成带前缀的随机 id，用于项目和临时资源标识。
export function createRandomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

// 按本地时区格式化更新时间，统一到分钟粒度。
export function formatDateTime(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 读取对象上的点路径值，主要给声明式字段面板使用。
export function getValueAtPath(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((currentValue, segment) => {
    if (!isPlainObject(currentValue)) {
      return undefined
    }

    return currentValue[segment]
  }, value)
}

// 按点路径就地写入对象字段，主要给声明式字段面板使用。
export function setValueAtPath(
  target: Record<string, unknown>,
  path: string,
  value: unknown,
): boolean {
  const segments = path.split('.')

  if (segments.length === 0) {
    return false
  }

  let currentTarget: Record<string, unknown> = target

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index]

    if (!segment) {
      return false
    }

    const nextTarget = currentTarget[segment]

    if (!isPlainObject(nextTarget)) {
      return false
    }

    currentTarget = nextTarget
  }

  const lastSegment = segments[segments.length - 1]

  if (!lastSegment) {
    return false
  }

  currentTarget[lastSegment] = value
  return true
}

// 在无法建立同步时返回空的停止函数，保持调用侧接口统一。
function createEmptyStopHandle(): WatchStopHandle {
  return () => undefined
}
