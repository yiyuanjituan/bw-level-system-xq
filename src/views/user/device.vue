<script setup lang="ts">
import { getUserDevices } from '@/api/common';
import { showCustomToast } from '@/hooks/useCommon';
import useAppStore from '@/store/modules/app';
import useAuthStore from '@/store/modules/user';
import { toPng } from 'html-to-image';
import { onMounted, ref } from 'vue';

interface UserDevice {
  id: number;
  current: boolean;
  client: string;
  browserType: string;
  operatingSystem: string;
  systemVersion: string;
  deviceBrand: string;
  deviceModel: string;
  ip: string;
  address: string;
  loginTime: string;
}

const app = useAppStore();
const auth = useAuthStore();
const saveImageRef = ref<HTMLElement | null>(null);
const deviceList = ref<UserDevice[]>([]);
const loading = ref(true);
const captureFileName = '设备图片.png';
const captureErrorMessage = '保存图片失败，请稍后重试';

function formatLoginTime(value: string) {
  if (!value)
    return '未知';

  return value.replace(/-/g, '/').replace('T', ' ').slice(0, 19);
}

function formatIpRegion(device: UserDevice) {
  if (!device.address || device.address === '未知')
    return device.ip || '未知';

  return `${device.ip} ${device.address}`;
}

async function loadDevices() {
  loading.value = true;
  try {
    const result = await getUserDevices();
    deviceList.value = Array.isArray(result) ? result : [];
  } catch {
    deviceList.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(loadDevices);

function waitForNextFrame() {
  return new Promise(resolve => requestAnimationFrame(() => resolve(true)));
}

async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll<HTMLImageElement>('img'));

  await Promise.all(images.map((img) => {
    if (img.complete && img.naturalWidth > 0)
      return img.decode?.().catch(() => undefined);

    return new Promise<void>((resolve) => {
      const finish = () => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', finish);
        resolve();
      };

      const handleLoad = () => {
        const decodePromise = img.decode?.();
        if (!decodePromise) {
          finish();
          return;
        }

        decodePromise.catch(() => undefined).finally(finish);
      };

      img.addEventListener('load', handleLoad, { once: true });
      img.addEventListener('error', finish, { once: true });
    });
  }));
}

function expandCaptureLayout(root: HTMLElement) {
  root.style.height = 'auto';
  root.style.overflow = 'visible';

  const main = root.querySelector<HTMLElement>('.main');
  if (main) {
    main.style.height = 'auto';
    main.style.flex = 'none';
    main.style.overflow = 'visible';
  }

  const deviceList = root.querySelector<HTMLElement>('.device-list');
  if (deviceList) {
    deviceList.style.height = 'auto';
    deviceList.style.overflow = 'visible';
    deviceList.style.paddingBottom = '10px';
  }

  const saveImgBtn = root.querySelector<HTMLElement>('.saveImgBtn');
  if (saveImgBtn) {
    saveImgBtn.style.position = 'static';
    saveImgBtn.style.left = '0';
    saveImgBtn.style.bottom = 'auto';
  }
}

function inlineSvgIcons(root: HTMLElement) {
  Array.from(root.querySelectorAll<SVGSVGElement>('svg.svg-icon')).forEach((icon) => {
    const href = icon.querySelector('use')?.getAttribute('xlink:href') || icon.querySelector('use')?.getAttribute('href');
    if (!href)
      return;

    const symbol = document.querySelector<SVGSymbolElement>(href);
    if (!symbol)
      return;

    const inlineSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.getAttributeNames().forEach((name) => {
      const value = icon.getAttribute(name);
      if (value !== null)
        inlineSvg.setAttribute(name, value);
    });

    const viewBox = icon.getAttribute('viewBox') || symbol.getAttribute('viewBox');
    if (viewBox)
      inlineSvg.setAttribute('viewBox', viewBox);

    inlineSvg.innerHTML = symbol.innerHTML;

    const styles = window.getComputedStyle(icon);
    inlineSvg.style.cssText = icon.style.cssText;
    inlineSvg.style.width = styles.width;
    inlineSvg.style.height = styles.height;
    inlineSvg.style.minWidth = styles.width;
    inlineSvg.style.minHeight = styles.height;
    inlineSvg.style.display = styles.display === 'inline' ? 'inline-block' : styles.display;
    inlineSvg.style.verticalAlign = styles.verticalAlign;
    inlineSvg.style.color = styles.color;
    inlineSvg.style.fill = styles.fill;
    inlineSvg.style.stroke = styles.stroke;
    inlineSvg.style.flexShrink = styles.flexShrink;
    inlineSvg.style.transform = styles.transform === 'none' ? '' : styles.transform;
    inlineSvg.style.transformOrigin = styles.transformOrigin;

    icon.replaceWith(inlineSvg);
  });
}

async function createCaptureNode(sourceRoot: HTMLElement) {
  const host = document.createElement('div');
  const captureNode = sourceRoot.cloneNode(true) as HTMLElement;
  const width = Math.ceil(sourceRoot.getBoundingClientRect().width);

  host.style.position = 'fixed';
  host.style.inset = '0';
  host.style.opacity = '0';
  host.style.pointerEvents = 'none';
  host.style.overflow = 'hidden';
  host.style.zIndex = '2147483647';

  captureNode.style.width = `${width}px`;
  captureNode.style.maxWidth = 'none';
  captureNode.style.minHeight = '0';

  expandCaptureLayout(captureNode);
  inlineSvgIcons(captureNode);

  host.appendChild(captureNode);
  document.body.appendChild(host);
  await waitForNextFrame();
  await waitForImages(captureNode);
  await waitForNextFrame();

  return {
    captureNode,
    cleanup: () => host.remove(),
  };
}

function downloadImage(imageData: string) {
  const link = document.createElement('a');
  link.href = imageData;
  link.setAttribute('download', captureFileName);
  link.click();
}

async function saveToImg() {
  if (!saveImageRef.value) {
    showCustomToast({ type: 'fail', message: captureErrorMessage });
    return;
  }

  let cleanup = () => {};

  try {
    const { captureNode, cleanup: disposeCaptureNode } = await createCaptureNode(saveImageRef.value);
    cleanup = disposeCaptureNode;

    const width = Math.ceil(captureNode.scrollWidth);
    const height = Math.ceil(captureNode.scrollHeight);
    const imageData = await toPng(captureNode, {
      cacheBust: true,
      pixelRatio: 2,
      width,
      height,
      canvasWidth: width,
      canvasHeight: height,
    });

    downloadImage(imageData);
  } catch {
    showCustomToast({ type: 'fail', message: captureErrorMessage });
  } finally {
    cleanup();
  }
}
</script>

<template>
  <div ref="saveImageRef" class="device-container">
    <sub-navbar title="登录设备" />
    <div class="main">
      <div class="user-and-siteInfo">
        <div class="container">
          <div class="logo-box">
            <img :src="app.appInfo.logo" alt="" class="logo-img" />
          </div>
          <div class="separate"></div>
          <div class="userInfo">
            <p>
              <span class="title">ID:</span><span class="content">{{ auth.user?.unionid }}</span
              ><span class="copy-box"><copy :text="auth.user?.unionid" /></span>
            </p>
            <p class="account">
              <span class="title">账号:</span><span class="content">{{ auth.user?.account }}</span>
            </p>
          </div>
          <img src="@/assets/common/comm_logo_bg2.avif" alt="" class="bg" />
        </div>
      </div>
      <div class="device-list">
        <div v-if="loading" class="device-state">正在加载设备信息...</div>
        <div v-else-if="!deviceList.length" class="device-state">暂无登录设备记录</div>
        <template v-else>
          <div v-for="device in deviceList" :key="device.id" class="historyDevice">
            <div class="deviceTitle">
              <div class="leftWrap">
                <svg-icon name="icon_dlsb_sj" class-name="picBg" />
                <div class="text-[13px]">{{ device.current ? '当前设备' : '历史设备' }}</div>
                <div v-if="device.current" class="currentBg">
                  <svg-icon name="comm_icon_gou" class-name="!text-[9px]" />
                </div>
              </div>
            </div>
            <div class="device-content-wrapper">
              <div class="info-list">
                <div class="info-item">
                  <p class="infoLabel">客户端</p>
                  <p class="infoValue">{{ device.client }}</p>
                </div>
                <div class="info-item">
                  <p class="infoLabel">浏览器类型</p>
                  <p class="infoValue">{{ device.browserType }}</p>
                </div>
                <div class="info-item">
                  <p class="infoLabel">操作系统</p>
                  <p class="infoValue">{{ device.operatingSystem }}</p>
                </div>
                <div class="info-item">
                  <p class="infoLabel">系统版本</p>
                  <p class="infoValue">{{ device.systemVersion }}</p>
                </div>
                <div class="info-item">
                  <p class="infoLabel">设备品牌</p>
                  <p class="infoValue">{{ device.deviceBrand }}</p>
                </div>
                <div class="info-item">
                  <p class="infoLabel">设备型号</p>
                  <p class="infoValue">{{ device.deviceModel }}</p>
                </div>
                <div class="info-item">
                  <p class="infoLabel">IP地区</p>
                  <p class="infoValue">{{ formatIpRegion(device) }}</p>
                </div>
                <div class="info-item">
                  <p class="infoLabel">登录时间</p>
                  <p class="infoValue">{{ formatLoginTime(device.loginTime) }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div v-if="deviceList.length" class="saveImgBtn" @click="saveToImg">
        <x-button type="primary" class="!w-[100%]">保存图片</x-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.device-container {
  display: flex;
  flex-direction: column;
  color: var(--skin__lead);
  background: var(--skin__bg_1);
  .main {
    flex: 1;
    overflow: auto;
    height: 0;
    .user-and-siteInfo {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      .container {
        min-width: 240px;
        height: 56.5px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-flow: row nowrap;
        background-color: var(--skin__bg_2);
        width: 100%;
        position: relative;
        padding: 10px 0;
        .logo-box {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex !important;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          .logo-img {
            max-width: 115px;
            object-fit: contain;
            cursor: pointer;
            max-height: 100%;
            vertical-align: middle;
          }
        }
        .separate {
          position: relative;
          z-index: 1;
          height: 22px;
          width: 1px;
          background-color: var(--skin__border);
          margin: 0 15px;
          flex-shrink: 0;
        }
        .userInfo {
          font-size: 12px;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          p {
            &:first-child {
              padding-bottom: 5px;
              display: flex;
              flex-wrap: nowrap;
              align-items: center;
            }
          }
          .title {
            padding-right: 5px;
            color: var(--skin__neutral_2);
          }
          .content {
            color: var(--skin_lead);
          }
          .copy-box {
            padding-left: 5px;
            font-size: 15px;
            width: 15px;
            height: 15px;
            margin-top: -1.5px;
            color: var(--skin_primary);
          }
        }
        .bg {
          width: 100%;
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          max-width: 100% !important;
        }
      }
      .sec-container {
        height: 45px;
        width: 100%;
        background-color: var(--skin__bg_2);
        display: flex;
        align-items: center;
        padding: 12px 10px;
        font-size: 13px;
        justify-content: space-between;

        .titleWrap {
          color: var(--skin__lead);
          span {
            color: var(--skin__neutral_2);
          }
        }
        .selectWrap {
          color: var(--skin__primary);
          display: flex;
          align-items: center;
          line-height: 1;
          .arrow-icon {
            margin-left: 1px;
            color: var(--skin__neutral_2);
            font-size: 12px;
            transform: rotate(180deg);
            margin-bottom: -1px;
          }
        }
      }
      .splitLine {
        border-bottom: 0.5px solid var(--skin__border);
        width: 100%;
        height: 0.5px;
      }
    }
    .device-list {
      padding: 10px 10px 65px;
      height: calc(100% - 100px);
      overflow-y: auto;
      .device-state {
        padding: 45px 10px;
        color: var(--skin__neutral_2);
        font-size: 13px;
        text-align: center;
      }
      .currentDevice,
      .historyDevice {
        width: 100%;
        margin-bottom: 10px;
        background-color: var(--skin__bg_2);
        box-shadow: 0 1.5px 5px rgba(0, 0, 0, 0.06);
        border-radius: 7px;
        .deviceTitle {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          min-height: 45px;
          padding: 0 10px 0 8px;
          color: var(--skin__lead);
          font-size: 12px;
          line-height: 1.8;
          text-align: left;
          .leftWrap {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            height: 100%;
            line-height: 1;
            .picBg {
              color: var(--skin__primary);
              font-size: 18px;
              padding-bottom: 2px;
              padding-right: 2.5px;
            }
            .currentBg {
              background-color: var(--skin__accent_1);
              color: #fff;
              width: 14px;
              height: 14px;
              border-radius: 14px;
              margin-left: 2.5px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
        }
        .device-content-wrapper {
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          width: 100%;
          padding: 10px;
          border-top: var(--lobby__px) solid var(--skin__border);
          .info-list {
            width: 100%;
            .info-item {
              display: flex;
              align-items: center;
              justify-content: flex-start;
              width: 100%;
              margin-bottom: 12.5px;
              font-size: 13px;
              .infoLabel {
                width: 150px;
                margin-right: 20px;
                color: var(--skin__neutral_2);
                text-align: left;
                box-sizing: content-box;
                display: -webkit-box;
                overflow: hidden;
                text-overflow: ellipsis;
                vertical-align: middle;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                word-break: break-all;
              }
              .infoValue {
                word-break: break-all;
                overflow: hidden;
                text-overflow: ellipsis;
                vertical-align: middle;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                width: 165px;
                text-align: right;
                color: var(--skin__lead);
                display: flex;
                justify-content: flex-end;
              }
            }
          }
        }
      }
    }
    .saveImgBtn {
      position: absolute;
      bottom: 0;
      left: auto;
      width: 100%;
      padding: 10px 10px 20px;
      background-color: var(--skin__bg_2);
      box-shadow: 0 -1.5px 5px rgba(0, 0, 0, 0.1);
      z-index: 100;
    }
  }
}
</style>
