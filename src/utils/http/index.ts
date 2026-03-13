import Axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse
} from "axios";
import { ContentTypeEnum, ResultEnum } from "@/enums/requestEnum";
import { showFailToast } from "vant";
import "vant/es/toast/style";
import { $locale } from "@/locales";
import { showCustomToast } from "@/hooks/useCommon";
import { decrypt } from "@/utils/crypto";
import useAuthStore from "@/store/modules/user";
import { bus } from "@/utils/mitt";

// 默认 axios 实例请求配置
const configDefault = {
  headers: {
    "Content-Type": ContentTypeEnum.FORM_URLENCODED
  },
  timeout: 0,
  baseURL: import.meta.env.VITE_BASE_API,
  data: {}
};

class Http {
  // 当前实例
  private static axiosInstance: AxiosInstance;
  // 请求配置
  private static axiosConfigDefault: AxiosRequestConfig;

  // 请求拦截
  private httpInterceptorsRequest(): void {
    Http.axiosInstance.interceptors.request.use(
      config => {
        // 发送请求前，可在此携带 token
        config.headers["site_id"] = import.meta.env.VITE_SITE_ID;
        config.headers["language"] = $locale.value;

        const auth = localStorage.getItem("user")
        if (auth) {
          const info = JSON.parse(auth);
          config.headers['Authorization'] = info?.token
        }
        return config;
      },
      (error: AxiosError) => {
        showFailToast(error.message);
        return Promise.reject(error);
      }
    );
  }

  // 响应拦截
  private httpInterceptorsResponse(): void {
    Http.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const data = response.data.encrypted ? decrypt(response.data.data) : response.data
        // 与后端协定的返回字段
        const { code, message } = data;
        // 判断请求是否成功
        const isSuccess = Reflect.has(data, "code") && code === ResultEnum.SUCCESS;
        if (isSuccess) {
          return data?.data || data;
        } else {
          // 处理请求错误
          showCustomToast({ type: 'fail', message: message });
          // showFailToast(message);
          return Promise.reject(data);
        }
      },
      (error: AxiosError) => {
        // 处理 HTTP 网络错误
        let message = "";
        // HTTP 状态码
        const status = error.response?.status;
        switch (status) {
          case 400:
            message = "请求错误";
            break;
          case 401:
            message = "未授权，请登录";
            bus.emit('logout')
            break;
          case 403:
            message = "拒绝访问";
            break;
          case 404:
            message = `请求地址出错: ${error.response?.config?.url}`;
            break;
          case 408:
            message = "请求超时";
            break;
          case 500:
            message = "网络繁忙";
            break;
          case 501:
            message = "服务未实现";
            break;
          case 502:
            message = "网关错误";
            break;
          case 503:
            message = "服务不可用";
            break;
          case 504:
            message = "网关超时";
            break;
          case 505:
            message = "HTTP版本不受支持";
            break;
          default:
            message = "网络连接故障";
        }
        showCustomToast({ type: 'fail', message })
        // showFailToast(message);
        return Promise.reject(error);
      }
    );
  }

  constructor(config: AxiosRequestConfig) {
    Http.axiosConfigDefault = config;
    Http.axiosInstance = Axios.create(config);
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  // 通用请求函数
  public request<T>(paramConfig: AxiosRequestConfig): Promise<T> {
    const config = { ...Http.axiosConfigDefault, ...paramConfig };
    return new Promise((resolve, reject) => {
      Http.axiosInstance
        .request(config)
        .then((response: any) => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

export const http = new Http(configDefault);
