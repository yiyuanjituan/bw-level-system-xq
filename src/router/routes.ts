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
              tabBarOrder: 1,
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
              tabBarOrder: 1,
              headerOrder: 2,
              isTabBar: true,
              pageTransition: "page-slide-forward"
            }
          },
          {
            path: "cashback",
            name: "CashBack",
            component: () => import("@/views/home/cashBack.vue"),
            meta: {
              title: "返水",
              order: 2,
              tabBarOrder: 1,
              headerOrder: 3,
              isTabBar: true,
              pageTransition: "page-slide-forward"
            }
          },
          {
            path: "canReceive",
            name: "HomeCanReceive",
            component: () => import("@/views/home/canReceive.vue"),
            meta: {
              title: "待领取",
              order: 3,
              tabBarOrder: 1,
              headerOrder: 4,
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
              tabBarOrder: 1,
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
              tabBarOrder: 1,
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
              tabBarOrder: 1,
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
        path: "plazza",
        name: "Plazza",
        component: () => import("@/views/home/plazza.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        }
      },
      {
        path: "plazza/post",
        name: "PlazzaPost",
        component: () => import("@/views/home/plazza/post.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        }
      },
      {
        path: "plazza/publisher/:id",
        name: "PlazzaPublisher",
        component: () => import("@/views/home/plazza/publisher.vue"),
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
        path: "setting",
        name: "Setting",
        component: () => import("@/views/home/setting.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        }
      },
      {
        path: "setting/updateAvator",
        name: "UpdateAvator",
        component: () => import("@/views/home/setting/updateAvator.vue"),
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
      {
        path: "notice",
        name: "Notice",
        component: () => import("@/views/notice/index.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        },
      },
      {
        path: 'notice/detail',
        name: 'NoticeDetail',
        component: () => import("@/views/notice/detail.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        },
      },
      {
        path: "report",
        name: "Report",
        component: () => import("@/views/home/report.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        },
      },
      {
        path: "cashback-rates",
        name: "CashBackRates",
        component: () => import("@/views/home/cashback-rates.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        },
      },
      {
        path: "account-detail",
        name: "HomeAccountDetail",
        component: () => import("@/views/home/report/AccountDetail.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        },
      },
      {
        path: "device",
        name: "UserDevice",
        component: () => import("@/views/user/device.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        }
      },
      {
        path: "promote",
        name: "HomePromote",
        component: () => import("@/views/home/promote/index.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        }
      },
      {
        path: "claim",
        name: "HomeClaim",
        component: () => import("@/views/home/claim.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        }
      },
      {
        path: "apply-claim",
        name: "HomeApplyClaim",
        component: () => import("@/views/home/apply-claim.vue"),
        meta: {
          isSecondary: true,
          pageTransition: "page-slide-forward"
        }
      },
      {
        path: "about",
        name: "About",
        component: () => import("@/views/about/index.vue"),
        meta: {
          title: "关于我们",
          isSecondary: true,
          noCache: true,
          pageTransition: "page-slide-forward"
        }
      },
    ]
  }
];

export default routes;
