import Layout from "@/layout/index.vue";
import type { RouteRecordRaw } from "vue-router";
import Demo from "@/views/demo/index.vue";
import HeaderLayout from "@/layout/HeaderLayout.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "root",
    component: Layout,
    redirect: { name: "Index" },
    children: [
      {
        path: "index",
        name: "Index",
        component: () => import("@/views/home/index.vue"),
        meta: {
          title: "主页",
          order: 0,
          isTabBar: true,
          pageTransition: "page-slide-forward"
        }
      },
      {
        path: "demo",
        name: "Demo",
        component: Demo,
        meta: {
          title: "主页",
          order: 0,
          isTabBar: true,
          pageTransition: "page-slide-forward"
        }
      },
      {
        path: "home/mine",
        name: "Mine",
        component: () => import("@/views/home/mine.vue"),
        meta: {
          title: "我的",
          order: 4,
          isTabBar: true,
          pageTransition: "page-slide-forward"
        }
      },
      {
        path: "home",
        name: "HomeNameLayout",
        component: HeaderLayout,
        children: [
          {
            path: "event",
            name: "HomeEvent",
            component: () => import("@/views/home/event.vue"),
            meta: {
              title: "优惠",
              order: 1,
              headerOrder: 1,
              isTabBar: true,
              pageTransition: "page-slide-forward"
            }
          },
          {
            path: "task",
            name: "HomeTask",
            component: () => import("@/views/home/task.vue"),
            meta: {
              title: "任务",
              order: 2,
              headerOrder: 2,
              isTabBar: true,
              pageTransition: "page-slide-forward"
            }
          },
          {
            path: "records",
            name: "HomeRecords",
            component: () => import("@/views/home/records/index.vue"),
            meta: {
              title: "详情",
              order: 5,
              headerOrder: 5,
              isTabBar: true,
              pageTransition: "page-slide-forward"
            }
          },
          {
            path: "yuebao",
            name: "HomeYueBao",
            component: () => import("@/views/home/yuebao.vue"),
            meta: {
              title: "利息宝",
              order: 6,
              headerOrder: 6,
              isTabBar: true,
              pageTransition: "page-slide-forward"
            }
          },
          {
            path: "vip",
            name: "HomeVip",
            component: () => import("@/views/home/vip.vue"),
            meta: {
              title: "VIP",
              order: 3,
              headerOrder: 3,
              isTabBar: true,
              pageTransition: "page-slide-forward"
            }
          },
        ]
      },
      {
        path: "tools",
        name: "Tools",
        component: () => import("@/views/tools/index.vue"),
        meta: {
          title: "工具",
          isTabBar: true,
          order: 2,
          pageTransition: "page-slide-forward"
        }
      },
      {
        path: "about",
        name: "About",
        component: () => import("@/views/about/index.vue"),
        meta: {
          title: "关于",
          noCache: true,
          order: 2,
          isTabBar: true,
          pageTransition: "page-slide-forward"
        }
      }
    ]
  },
  {
    path: "/home",
    component: () => import("@/layout/second.vue"),
    children: [
      {
        path: "subGame",
        name: "Detail",
        component: () => import("@/views/home/subGame.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        }
      },
      {
        path: "login",
        name: "LoginPage",
        component: () => import("@/views/home/login.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        }
      },
      {
        path: "register",
        name: "RegisterPage",
        component: () => import("@/views/home/login.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        }
      },
      {
        path: "embedded",
        name: "Embedded",
        component: () => import("@/views/home/embedded.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        }
      },
      {
        path: "event/detail",
        name: "EventDetail",
        component: () => import("@/views/home/event/detail.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        }
      },
      {
        path: "security",
        name: "Security",
        component: () => import("@/views/home/security.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        }
      },
      {
        path: "withdraw",
        name: "Withdraw",
        component: () => import("@/views/home/withdraw.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        }
      },
    ]
  }
];

export default routes;
