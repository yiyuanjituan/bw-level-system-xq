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
  const currentPath = history.state.current;
  if (window.history.state.back) {
    router.back();
  } else {
    router.replace("/index");
  }
  setTimeout(() => {
    const newPath = history.state.current;
    if (currentPath == newPath) {
      handleBack();
    }
  }, 100);
}

export function openUrlInNewWindow(url = "", openedWindow?: Window | null) {
  if (openedWindow && !openedWindow.closed) {
    if (url) openedWindow.location.href = url;
    return openedWindow;
  }

  const newWindow = window.open(url, "_blank");
  if (newWindow) {
    newWindow.opener = null;
    return newWindow;
  }

  if (url) {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return null;
}

/**
 * 预测输入内容是否为手机号
 * @param {string} input - 输入的内容
 * @param defaultValue
 * @returns {Object} 包含预测结果的对象
 */
export function predictPhoneNumber(input = "", defaultValue: boolean) {
  // 移除所有非数字字符
  const cleanNumber = input;
  // const cleanNumber = input.replace(/\D/g, '');
  const length = cleanNumber?.length || 0;

  // 基础验证结果
  const result = {
    input: input,
    cleanNumber: cleanNumber,
    length: length,
    isValid: defaultValue,
    confidence: 0, // 置信度 0-1
    message: ""
  };
  if (length == 0) {
    return result;
  }

  // 长度检查
  if (length < 6) {
    result.message = "输入长度不足，无法判断";
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
    result.message = result.isValid ? "这是一个有效的手机号" : "这不是一个有效的手机号";
  } else if (length > 11) {
    // 超过11位
    result.isValid = false;
    result.confidence = 0.9;
    result.message = "输入长度超过11位，不是有效的手机号";
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
      result.message = "这不像是手机号";
    }
  }

  return result;
}

export async function getCopyText() {
  try {
    // 读取剪贴板文本（需用户交互触发，如点击按钮）
    return await navigator.clipboard.readText();
  } catch (err) {
    // console.error('粘贴失败：', err);
    // 创建隐藏输入框，模拟粘贴
    const textarea = document.createElement("textarea");
    textarea.style.position = "absolute";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);

    // 聚焦并执行粘贴
    textarea.focus();
    const success = document.execCommand("paste");
    if (success) {
      return textarea.value;
    } else {
      // result.textContent = '粘贴失败，请手动 Ctrl+V';
    }
    document.body.removeChild(textarea);
  }
}

export function toNumber(value: unknown) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function formatMoney(value: number | string) {
  return toNumber(value).toFixed(2);
}

export const getYuEBaoRichText = (params: any = {}) => {
  return `
    <p class="">
      1.<strong>收益介绍：</strong>存入利息宝的金额，至少满足一个完整周期才能产生利息，若中途提前转出则该周期不计算收益，例如：当前结算周期为${params.config?.calc_cycle_text}，则2026/01/01 00:00:01转入的金额，将在2026/01/01 01:00:01产生第一个周期利息;<br>
      2.<strong>结算周期：</strong>当前利息的结算周期为${params.config?.calc_cycle_text};<br>
      3.<strong>年利率：</strong>当前年利率为${params.config?.year_scale}%;<br>
      4.<strong>计算公式：</strong>利息收益=存入金额 * 年利率 / 结算周期;<br>
      5.<strong>举例说明：</strong>A于2026/01/01 00:00:01存入10,000，年利率为88%，结算周期为1小时，则于2026/01/01 01:00:01获得首次利息收益，计算方式如下:<strong>首次利息 =10,000*88%/365天/24小时*1小时 = 1.004566</strong>;<br>
      6.<strong>转入门槛：</strong>每次转入金额必须大于等于${params.config?.minNum}（即≥${params.config?.minNum}），转入金额无上限，越多收益越大;<br>
      7.<strong>利息封顶：</strong>当前利息不封顶，记得定期或经常来领取收益，以免错过更多收益哦;<br>
      8.<strong>领取时间：</strong>当前为隔天领取，即当天产生的利息，要等到第二天0点后才能领取;<br>
      9.<strong>稽核倍数：</strong>本活动所赠送的利息奖金(利息)需达${params.config?.flow_scale}倍有效投注才能提现，投注不限有效平台,仅限于所领取的利息需要稽核，所转入转出的本金则无稽核要求，仅限于所领取的利息需要稽核，所转入转出的本金则无稽核要求;<br>
      10.<strong>活动声明：</strong>本功能仅限账号本人进行正常游戏投注，禁止租借账号、无风险投注(对赌、对刷、低赔刷水)、恶意套利、使用外挂程式、机器人、利用协议、漏洞、接口、群控或其他技术手段参与，一经查核属实，本平台有权终止会员登录、暂停会员使用网站、及没收奖金和不当盈利的权利，无需特别通知;<br>
      11.<strong>解释说明：</strong>会员领取利息宝奖励时，本平台将默认会员同意且遵守对应条件等相关规定，为避免文字理解歧义，本平台保有本活动最终解释权。
    </p>`;
};
