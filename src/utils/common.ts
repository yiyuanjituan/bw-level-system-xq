import router from "@/router";

export function flattenRoutes(routes, basePath = "") {
  let result = [];

  for (const route of routes) {
    // 1. 计算当前路由的完整路径
    const fullPath = basePath + route.path;

    // 2. 创建一个新的路由对象，避免修改原对象，并修正路径
    const flattenedRoute = {
      ...route,
      path: fullPath.startsWith("//") ? fullPath.slice(1) : fullPath // 处理可能出现的双斜杠
    };
    // 删除 children 属性，因为我们正在拍平它
    delete flattenedRoute.children;

    // 3. 将当前路由加入结果数组
    result.push(flattenedRoute);

    // 4. 如果存在子路由，递归处理，并将结果合并到当前结果中
    if (route.children && route.children.length > 0) {
      // 递归时，基础路径是当前路由的完整路径，并确保路径连接处有 '/'
      const childRoutes = flattenRoutes(route.children, `${fullPath}/`);
      result = result.concat(childRoutes);
    }
  }

  return result;
}

export function handleBack() {
  console.log('点击了返回按钮');
  if (window.history.state.back) {
    router.back();
  } else {
    router.replace('/index')
  }
}
/**
 * 预测输入内容是否为手机号
 * @param {string} input - 输入的内容
 * @param defaultValue
 * @returns {Object} 包含预测结果的对象
 */
export function predictPhoneNumber(input = "", defaultValue: boolean) {
  // 移除所有非数字字符
  const cleanNumber = input
  // const cleanNumber = input.replace(/\D/g, '');
  const length = cleanNumber?.length || 0;

  // 基础验证结果
  const result = {
    input: input,
    cleanNumber: cleanNumber,
    length: length,
    isValid: defaultValue,
    confidence: 0, // 置信度 0-1
    message: ''
  };
  if (length == 0) {
    return result;
  }

  // 长度检查
  if (length < 6) {
    result.message = '输入长度不足，无法判断';
    result.isValid = false;
    return result;
  }

  // 手机号正则表达式（中国大陆）
  const phoneRegex = /^1[3-9]\d{9}$/;

  // 根据长度给出预测
  if (length === 11) {
    // 完整长度验证
    result.isValid = phoneRegex.test(cleanNumber);
    result.confidence = result.isValid ? 1 : 0.1;
    result.message = result.isValid ? '这是一个有效的手机号' : '这不是一个有效的手机号';
  } else if (length > 11) {
    // 超过11位
    result.isValid = false;
    result.confidence = 0.9;
    result.message = '输入长度超过11位，不是有效的手机号';
  } else {
    // 6-10位，进行部分匹配预测
    const partialMatch = /^1[3-9]\d{0,8}$/.test(cleanNumber);

    if (partialMatch) {
      result.isValid = true; // 未完成输入，不算有效
      result.confidence = 0.6 + (length - 6) * 0.1; // 长度越长置信度越高
      result.message = `可能是手机号的前${length}位，还需要输入${11 - length}位`;
    } else {
      result.isValid = false;
      result.confidence = 0.8;
      result.message = '这不像是手机号';
    }
  }

  return result;
}

export async function getCopyText() {
  try {
    // 读取剪贴板文本（需用户交互触发，如点击按钮）
    return await navigator.clipboard.readText();
  } catch (err) {
    console.error('粘贴失败：', err);
    // 创建隐藏输入框，模拟粘贴
    const textarea = document.createElement('textarea');
    textarea.style.position = 'absolute';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);

    // 聚焦并执行粘贴
    textarea.focus();
    const success = document.execCommand('paste');
    if (success) {
      return textarea.value
    } else {
      // result.textContent = '粘贴失败，请手动 Ctrl+V';
    }
    document.body.removeChild(textarea);
  }
}

// export