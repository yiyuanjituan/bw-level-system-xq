import { showCustomDialog } from "@/hooks/useCommon";
import router from "@/router";

const VERSION_CHECK_INTERVAL = 60 * 1000;

/**
 * 通过入口 HTML 的 ETag 判断前端是否已经重新发布。
 * 首次请求只记录当前版本，后续检测到变化时要求用户刷新页面。
 */
export function startVersionUpdateCheck(): () => void {
  if (!import.meta.env.PROD) {
    return () => undefined;
  }

  let currentEtag = "";
  let isChecking = false;
  let hasUpdate = false;
  let timer: number | undefined;
  const entryUrl = new URL(import.meta.env.BASE_URL, window.location.origin).toString();

  const stop = () => {
    if (timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
    }

    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("online", handleOnline);
  };

  const checkVersion = async () => {
    if (isChecking || hasUpdate) {
      return;
    }

    isChecking = true;

    try {
      const response = await fetch(entryUrl, {
        method: "HEAD",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache"
        }
      });
      const latestEtag = response.headers.get("etag")?.trim();

      if (!response.ok || !latestEtag) {
        return;
      }

      if (!currentEtag) {
        currentEtag = latestEtag;
        return;
      }

      if (latestEtag === currentEtag) {
        return;
      }

      hasUpdate = true;
      stop();

      showCustomDialog({
        title: "温馨提示",
        message: "当前页面已更新，点击刷新体验最新内容，若有问题请联系客服。",
        showCancelButton: true,
        cancelButtonText: "联系客服",
        confirmButtonText: "立即刷新",
        width: 300,
        closeOnClickOverlay: false,
        closeOnPopstate: false,
        lockScroll: true
      }).then((result) => {
        if (result) {
          window.location.reload();
          return;
        }

        void router.push({
          path: "/home/notice",
          query: { noticeType: 4 }
        });
      });
    } catch {
      // 断网或服务器暂时不可用时跳过本次检测，避免影响正常业务。
    } finally {
      isChecking = false;
    }
  };

  function handleVisibilityChange() {
    if (document.visibilityState === "visible") {
      void checkVersion();
    }
  }

  function handleOnline() {
    void checkVersion();
  }

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("online", handleOnline);
  timer = window.setInterval(checkVersion, VERSION_CHECK_INTERVAL);
  void checkVersion();

  return stop;
}
