<script setup lang="ts">
import { ref } from "vue";
import CanvasConnector from "@/components/Common/CanvasConnector.vue";
import type {
  ConnectionPathPoint,
  ConnectorConnection
} from "@/components/Common/canvasConnector";
import agentAAvatar from "@/assets/home/promote/tutorial-agent-a.avif";
import agentBAvatar from "@/assets/home/promote/tutorial-agent-b.avif";
import agentCAvatar from "@/assets/home/promote/tutorial-agent-c.avif";
import agentDAvatar from "@/assets/home/promote/tutorial-agent-d.avif";
import PromoteCommissionMember from "./PromoteCommissionMember.vue";

const connectorColors = {
  relation: "#656565",
  primary: "#DFBE5B",
  accent1: "#1FE11F",
  accent3: "#FFAA09"
} as const;
// 连接器的 2 个偏移单位对应设计宽度下的 1px。
const connectorOffsetPerPixel = 2;
// C1、C3 向上起始线与左右相邻线均保持 18px。
const arrowHorizontalGap = 18 * connectorOffsetPerPixel;
// 以 B1、B2 的起始位置为 0，回路横线每层相差 10px。
const routeVerticalGap = 10 * connectorOffsetPerPixel;
const memberCardFiveSixthsX = "83.3333333333%";
const connectorLineWidth = 5;
// 三角箭头与节点保持 0.2rem，在设计宽度下对应 10px。
const arrowOffsetY = 20;
const activeTutorial = ref("a");
const tutorialTabs = [
  { label: "A的佣金", value: "a" },
  { label: "B1的佣金", value: "b1" },
  { label: "B2的佣金", value: "b2" },
  { label: "C1的佣金", value: "c1" }
];

const relationConnection = (
  id: string,
  paths: ConnectionPathPoint[],
  radius = 0,
  endArrowType: "dot" | "none" = "dot"
): ConnectorConnection => ({
  id,
  paths,
  color: connectorColors.relation,
  lineWidth: connectorLineWidth,
  radius,
  startArrowType: "dot",
  endArrowType
});

const commissionConnection = (
  id: string,
  paths: ConnectionPathPoint[],
  color: string,
  startArrowType: "triangle" | "none" = "triangle"
): ConnectorConnection => ({
  id,
  paths,
  color,
  lineWidth: connectorLineWidth,
  radius: 5,
  startArrowType,
  startArrowSize: 14,
  endArrowType: "dot"
});

const directMembers = [
  { connectorId: "b1", name: "B1", level: "B" as const, avatar: agentBAvatar, netProfit: "-500", formula: "500*10%", commission: "50" },
  { connectorId: "b2", name: "B2", level: "B" as const, avatar: agentBAvatar, netProfit: "-3000", formula: "3000*10%", commission: "300" }
];

const otherMembers = [
  { connectorId: "c1", name: "C1", level: "C" as const, avatar: agentCAvatar, netProfit: "1000", formula: "-1000*10%*30%", commission: "-30" },
  { connectorId: "c2", name: "C2", level: "C" as const, avatar: agentCAvatar, netProfit: "-2000", formula: "2000*10%*30%", commission: "60" },
  { connectorId: "c3", name: "C3", level: "C" as const, avatar: agentCAvatar, netProfit: "-20000", formula: "20000*10%*30%", commission: "600" }
];

const thirdLevelMembers = [
  { connectorId: "d1", avatarConnectorId: "d1-avatar", name: "D1", level: "D" as const, avatar: agentDAvatar, netProfit: "-3000", formula: "3000*10%*30%", commission: "90" }
];

const tutorialConnections: ConnectorConnection[] = [
  relationConnection("a-c-upper-cap", [
    { nodeId: "c1", x: "50%", y: "0%", offsetY: -50 },
    {
      x: { nodeId: "c1", position: "50%" },
      y: { nodeId: "b1", position: "100%", offset: 20 }
    },
    {
      x: { nodeId: "b1", position: "62.5%" },
      y: { nodeId: "b1", position: "100%", offset: 20 }
    },
    {
      x: { nodeId: "c2", position: "50%" },
      y: { nodeId: "b1", position: "100%", offset: 20 }
    },
    { nodeId: "c2", x: "50%", y: "0%", offsetY: -50 }
  ], 10),
  relationConnection("a-b1-stem", [
    { nodeId: "b1", x: "62.5%", y: "100%", offsetY: 5 },
    {
      x: { nodeId: "b1", position: "62.5%" },
      y: { nodeId: "b1", position: "100%", offset: 20 }
    }
  ], 0, "none"),
  relationConnection("a-b-upper-cap", [
    { nodeId: "b1", x: "50%", y: "0%", offsetY: -50 },
    {
      x: { nodeId: "b1", position: "50%" },
      y: { nodeId: "a", position: "100%", offset: 20 }
    },
    {
      x: { nodeId: "a", position: "50%" },
      y: { nodeId: "a", position: "100%", offset: 20 }
    },
    {
      x: { nodeId: "b2", position: "50%" },
      y: { nodeId: "a", position: "100%", offset: 20 }
    },
    { nodeId: "b2", x: "50%", y: "0%", offsetY: -50 }
  ], 10),
  relationConnection("a-main-stem", [
    { nodeId: "a", x: "50%", y: "100%", offsetY: 5 },
    {
      x: { nodeId: "a", position: "50%" },
      y: { nodeId: "a", position: "100%", offset: 20 }
    }
  ], 0, "none"),
  commissionConnection("a-d1-accent1", [
    { nodeId: "a", x: "5%", y: "100%", offsetY: arrowOffsetY },
    {
      x: { nodeId: "a", position: "5%" },
      y: { nodeId: "b1", position: "0%", offset: -routeVerticalGap * 2 }
    },
    {
      x: { nodeId: "c1", position: "0%", offset: -10 },
      y: { nodeId: "b1", position: "0%", offset: -routeVerticalGap * 2 }
    },
    {
      x: { nodeId: "c1", position: "0%", offset: -10 },
      y: { nodeId: "d1", position: "50%" }
    },
    { nodeId: "d1", x: "0%", y: "50%", offsetX: -5 }
  ], connectorColors.accent1),
  commissionConnection("a-b1-accent3", [
    { nodeId: "a", x: "5%", y: "100%", offsetX: arrowHorizontalGap * 2, offsetY: arrowOffsetY },
    {
      x: { nodeId: "a", position: "5%", offset: arrowHorizontalGap * 2 },
      y: { nodeId: "b1", position: "0%", offset: -5 }
    }
  ], connectorColors.accent3),
  commissionConnection("a-b2-accent3", [
    { nodeId: "a", x: "95%", y: "100%", offsetX: -arrowHorizontalGap * 2, offsetY: arrowOffsetY },
    {
      x: { nodeId: "a", position: "95%", offset: -arrowHorizontalGap * 2 },
      y: { nodeId: "b2", position: "0%", offset: -5 }
    }
  ], connectorColors.accent3),
  relationConnection("a-c3-stem", [
    { nodeId: "c3", x: "50%", y: "0%", offsetY: -50 },
    {
      x: { nodeId: "c3", position: "50%" },
      y: { nodeId: "b2", position: "100%", offset: 5 }
    }
  ]),
  relationConnection("a-d1-c1-relation", [
    { nodeId: "c1", x: "50%", y: "100%", offsetY: 5 },
    {
      x: { nodeId: "c1", position: "50%" },
      y: { nodeId: "d1-avatar", position: "0%", offset: -20 }
    },
    {
      x: { nodeId: "d1-avatar", position: "50%" },
      y: { nodeId: "d1-avatar", position: "0%", offset: -20 }
    },
    { nodeId: "d1-avatar", x: "50%", y: "0%", offsetY: -5 }
  ], 10),
  commissionConnection("a-c1-primary", [
    { nodeId: "a", x: "5%", y: "100%", offsetX: arrowHorizontalGap, offsetY: arrowOffsetY },
    {
      x: { nodeId: "a", position: "5%", offset: arrowHorizontalGap },
      y: { nodeId: "b1", position: "0%", offset: -routeVerticalGap }
    },
    {
      x: { nodeId: "c1", position: "0%", offset: -10 + arrowHorizontalGap },
      y: { nodeId: "b1", position: "0%", offset: -routeVerticalGap }
    },
    {
      x: { nodeId: "c1", position: "0%", offset: -10 + arrowHorizontalGap },
      y: { nodeId: "c1", position: "0%", offset: -5 }
    }
  ], connectorColors.primary),
  commissionConnection("a-c2-primary", [
    { nodeId: "a", x: "95%", y: "100%", offsetY: arrowOffsetY },
    {
      x: { nodeId: "a", position: "95%" },
      y: { nodeId: "b2", position: "0%", offset: -routeVerticalGap * 2 }
    },
    {
      x: { nodeId: "c3", position: "100%", offset: 12 },
      y: { nodeId: "b2", position: "0%", offset: -routeVerticalGap * 2 }
    },
    {
      x: { nodeId: "c3", position: "100%", offset: 12 },
      y: { nodeId: "c2", position: "100%", offset: 20 }
    },
    {
      x: { nodeId: "c2", position: "67%" },
      y: { nodeId: "c2", position: "100%", offset: 20 }
    },
    { nodeId: "c2", x: "67%", y: "100%", offsetY: 5 }
  ], connectorColors.primary),
  commissionConnection("a-c3-primary", [
    { nodeId: "a", x: "95%", y: "100%", offsetX: -arrowHorizontalGap, offsetY: arrowOffsetY },
    {
      x: { nodeId: "a", position: "95%", offset: -arrowHorizontalGap },
      y: { nodeId: "b2", position: "0%", offset: -routeVerticalGap }
    },
    {
      x: { nodeId: "c3", position: "100%", offset: 12 - arrowHorizontalGap },
      y: { nodeId: "b2", position: "0%", offset: -routeVerticalGap }
    },
    {
      x: { nodeId: "c3", position: "100%", offset: 12 - arrowHorizontalGap },
      y: { nodeId: "c3", position: "0%", offset: -5 }
    }
  ], connectorColors.primary)
];

const b1DirectMembers = [
  {
    connectorId: "b1-c1",
    name: "C1",
    level: "C" as const,
    avatar: agentCAvatar,
    netProfit: "1000",
    formula: "-1000*10%",
    commission: "-100",
    recipient: "B1"
  },
  {
    connectorId: "b1-c2",
    name: "C2",
    level: "C" as const,
    avatar: agentCAvatar,
    netProfit: "-2000",
    formula: "2000*10%",
    commission: "200",
    recipient: "B1"
  }
];

const b1OtherMembers = [
  {
    connectorId: "b1-d1",
    avatarConnectorId: "b1-d1-avatar",
    name: "D1",
    level: "D" as const,
    avatar: agentDAvatar,
    netProfit: "-3000",
    formula: "3000*10%*30%",
    commission: "90",
    recipient: "B1"
  }
];

const b1Connections: ConnectorConnection[] = [
  relationConnection("b1-c-upper-cap", [
    { nodeId: "b1-c1", x: "50%", y: "0%", offsetY: -50 },
    { nodeId: "b1-c1", x: "50%", y: "0%", offsetY: -65 },
    {
      x: { nodeId: "b1-c2", position: "50%" },
      y: { nodeId: "b1-c2", position: "0%", offset: -65 }
    },
    { nodeId: "b1-c2", x: "50%", y: "0%", offsetY: -50 }
  ], 10),
  relationConnection("b1-main-stem", [
    { nodeId: "b1-main", x: "50%", y: "100%", offsetY: 15 },
    {
      x: { nodeId: "b1-main", position: "50%" },
      y: { nodeId: "b1-c1", position: "0%", offset: -65 }
    }
  ], 10, "none"),
  commissionConnection("b1-d1-primary", [
    {
      nodeId: "b1-main",
      x: "5%",
      y: "100%",
      offsetX: arrowHorizontalGap,
      offsetY: arrowOffsetY
    },
    {
      x: {
        nodeId: "b1-main",
        position: "5%",
        offset: arrowHorizontalGap
      },
      y: {
        nodeId: "b1-c1",
        position: "0%",
        offset: -routeVerticalGap
      }
    },
    {
      x: { nodeId: "b1-c1", position: "0%", offset: -10 },
      y: {
        nodeId: "b1-c1",
        position: "0%",
        offset: -routeVerticalGap
      }
    },
    {
      x: { nodeId: "b1-c1", position: "0%", offset: -10 },
      y: { nodeId: "b1-d1", position: "50%" }
    },
    { nodeId: "b1-d1", x: "0%", y: "50%", offsetX: -5 }
  ], connectorColors.accent1),
  commissionConnection("b1-c1-commission", [
    {
      nodeId: "b1-main",
      x: "5%",
      y: "100%",
      offsetX: arrowHorizontalGap * 2,
      offsetY: arrowOffsetY
    },
    {
      x: {
        nodeId: "b1-main",
        position: "5%",
        offset: arrowHorizontalGap * 2
      },
      y: { nodeId: "b1-c1", position: "0%", offset: -5 }
    }
  ], connectorColors.accent3),
  commissionConnection("b1-c2-commission", [
    {
      nodeId: "b1-main",
      x: "95%",
      y: "100%",
      offsetX: -arrowHorizontalGap,
      offsetY: arrowOffsetY
    },
    {
      x: {
        nodeId: "b1-main",
        position: "95%",
        offset: -arrowHorizontalGap
      },
      y: { nodeId: "b1-c2", position: "0%", offset: -5 }
    }
  ], connectorColors.accent3),
  relationConnection("b1-d1-c1-relation", [
    { nodeId: "b1-c1", x: "50%", y: "100%", offsetY: 5 },
    {
      x: { nodeId: "b1-c1", position: "50%" },
      y: { nodeId: "b1-d1-avatar", position: "0%", offset: -20 }
    },
    {
      x: { nodeId: "b1-d1-avatar", position: "50%" },
      y: { nodeId: "b1-d1-avatar", position: "0%", offset: -20 }
    },
    { nodeId: "b1-d1-avatar", x: "50%", y: "0%", offsetY: -5 }
  ], 10)
];

interface SimpleTutorial {
  mainConnectorId: string;
  name: string;
  avatar: string;
  color: string;
  performance: string;
  directCommission: string;
  totalCommission: string;
  member: {
    connectorId: string;
    name: string;
    level: "C" | "D";
    avatar: string;
    netProfit: string;
    formula: string;
    commission: string;
    recipient: string;
  };
  connections: ConnectorConnection[];
}

// B2 和 C1 都只有一个直属成员，使用同一套结构避免复制模板。
const simpleTutorials: Record<string, SimpleTutorial> = {
  b2: {
    mainConnectorId: "b2-main",
    name: "B2",
    avatar: agentBAvatar,
    color: "var(--skin__accent_3)",
    performance: "20000",
    directCommission: "2000",
    totalCommission: "2000",
    member: {
      connectorId: "b2-c3",
      name: "C3",
      level: "C",
      avatar: agentCAvatar,
      netProfit: "-20000",
      formula: "20000*10%",
      commission: "2000",
      recipient: "B2"
    },
    connections: [
      relationConnection("b2-c3-relation", [
        { nodeId: "b2-main", x: "50%", y: "100%", offsetY: 15 },
        {
          x: { nodeId: "b2-main", position: "50%" },
          y: { nodeId: "b2-c3", position: "0%", offset: -50 }
        }
      ], 5),
      commissionConnection("b2-c3-commission", [
        {
          x: {
            nodeId: "b2-c3",
            position: memberCardFiveSixthsX
          },
          y: {
            nodeId: "b2-main",
            position: "100%",
            offset: arrowOffsetY
          }
        },
        {
          x: {
            nodeId: "b2-c3",
            position: memberCardFiveSixthsX
          },
          y: { nodeId: "b2-c3", position: "0%", offset: -5 }
        }
      ], connectorColors.accent3)
    ]
  },
  c1: {
    mainConnectorId: "c1-main",
    name: "C1",
    avatar: agentCAvatar,
    color: "var(--skin__primary)",
    performance: "3000",
    directCommission: "300",
    totalCommission: "300",
    member: {
      connectorId: "c1-d1",
      name: "D1",
      level: "D",
      avatar: agentDAvatar,
      netProfit: "-3000",
      formula: "3000*10%",
      commission: "300",
      recipient: "C1"
    },
    connections: [
      relationConnection("c1-d1-relation", [
        { nodeId: "c1-main", x: "50%", y: "100%", offsetY: 15 },
        {
          x: { nodeId: "c1-main", position: "50%" },
          y: { nodeId: "c1-d1", position: "0%", offset: -5 }
        }
      ], 5),
      commissionConnection("c1-d1-commission", [
        {
          x: {
            nodeId: "c1-d1",
            position: memberCardFiveSixthsX
          },
          y: {
            nodeId: "c1-main",
            position: "100%",
            offset: arrowOffsetY
          }
        },
        {
          x: {
            nodeId: "c1-d1",
            position: memberCardFiveSixthsX
          },
          y: { nodeId: "c1-d1", position: "0%", offset: -5 }
        }
      ], connectorColors.accent3)
    ]
  }
};
</script>

<template>
  <section class="commission-tutorial">
    <div class="commission-tutorial__content">
      <x-tabs
        v-model="activeTutorial"
        type="card"
        shrink
        :show-nav-arrows="false"
        class="commission-tutorial__tabs"
      >
        <x-tab
          v-for="tab in tutorialTabs"
          :key="tab.value"
          :name="tab.value"
          :title="tab.label"
        >
          <canvas-connector
            v-if="tab.value === 'a' && activeTutorial === tab.value"
            :connections="tutorialConnections"
            class="commission-tutorial__diagram"
          >
            <article class="commission-tutorial__main-member" data-connector-id="a">
              <x-badge
                content="A"
                position="bottom-right"
                bg-color="var(--skin__accent_3)"
                class="commission-tutorial__main-badge"
              >
                <span class="commission-tutorial__main-avatar">
                  <img :src="agentAAvatar" alt="A代理头像" />
                </span>
              </x-badge>

              <div class="commission-tutorial__main-content">
                <p>本期业绩=<em>500</em>+<em>3000</em>-<em>600</em>=<em>2900</em></p>
                <p>直属佣金=2900*<bdi>10%</bdi>=<em>290</em></p>
                <p>其他佣金=<em>-30</em>+<em>60</em>+<em>600</em>+<em>90</em>=<em>720</em></p>
                <p>本期佣金=<em>290</em>+<em>720</em>=<em>1010</em></p>
                <span class="commission-tutorial__balance">上期结余-600</span>
              </div>
            </article>

            <div class="commission-tutorial__member-row commission-tutorial__member-row--direct">
              <promote-commission-member
                v-for="member in directMembers"
                :key="member.name"
                v-bind="member"
              />
            </div>

            <div class="commission-tutorial__member-row commission-tutorial__member-row--other">
              <promote-commission-member
                v-for="member in otherMembers"
                :key="member.name"
                v-bind="member"
              />
            </div>

            <div class="commission-tutorial__member-row commission-tutorial__member-row--third">
              <promote-commission-member
                v-for="member in thirdLevelMembers"
                :key="member.name"
                v-bind="member"
              />
            </div>
          </canvas-connector>

          <canvas-connector
            v-else-if="tab.value === 'b1' && activeTutorial === tab.value"
            :connections="b1Connections"
            class="commission-tutorial__diagram"
          >
            <article class="commission-tutorial__main-member" data-connector-id="b1-main">
              <x-badge
                content="B1"
                position="bottom-right"
                bg-color="var(--skin__accent_3)"
                class="commission-tutorial__main-badge"
              >
                <span class="commission-tutorial__main-avatar">
                  <img :src="agentBAvatar" alt="B1代理头像" />
                </span>
              </x-badge>

              <div class="commission-tutorial__main-content">
                <p>直属业绩=<em>-1000</em>+<em>2000</em>=<em>1000</em></p>
                <p>直属佣金=1000*<bdi>10%</bdi>=<em>100</em></p>
                <p>其他佣金=<em>90</em></p>
                <p>本期佣金=<em>100</em>+<em>90</em>=<em>190</em></p>
              </div>
            </article>

            <div class="commission-tutorial__member-row commission-tutorial__member-row--direct">
              <promote-commission-member
                v-for="member in b1DirectMembers"
                :key="member.name"
                v-bind="member"
              />
            </div>

            <div class="commission-tutorial__member-row commission-tutorial__member-row--other">
              <promote-commission-member
                v-for="member in b1OtherMembers"
                :key="member.name"
                v-bind="member"
              />
            </div>
          </canvas-connector>

          <canvas-connector
            v-else-if="(tab.value === 'b2' || tab.value === 'c1') && activeTutorial === tab.value"
            :connections="simpleTutorials[tab.value].connections"
            class="commission-tutorial__diagram"
          >
            <article
              class="commission-tutorial__main-member"
              :data-connector-id="simpleTutorials[tab.value].mainConnectorId"
            >
              <x-badge
                :content="simpleTutorials[tab.value].name"
                position="bottom-right"
                :bg-color="simpleTutorials[tab.value].color"
                class="commission-tutorial__main-badge"
              >
                <span
                  class="commission-tutorial__main-avatar"
                  :style="{ borderColor: simpleTutorials[tab.value].color }"
                >
                  <img
                    :src="simpleTutorials[tab.value].avatar"
                    :alt="`${simpleTutorials[tab.value].name}代理头像`"
                  />
                </span>
              </x-badge>

              <div class="commission-tutorial__main-content">
                <p>直属业绩=<em>{{ simpleTutorials[tab.value].performance }}</em></p>
                <p>
                  直属佣金={{ simpleTutorials[tab.value].performance }}*<bdi>10%</bdi>=<em>{{
                    simpleTutorials[tab.value].directCommission
                  }}</em>
                </p>
                <p>其他佣金=<em>0</em></p>
                <p>
                  本期佣金=<em>{{ simpleTutorials[tab.value].directCommission }}</em>+<em>0</em>=<em>{{
                    simpleTutorials[tab.value].totalCommission
                  }}</em>
                </p>
              </div>
            </article>

            <div class="commission-tutorial__member-row commission-tutorial__member-row--direct">
              <promote-commission-member v-bind="simpleTutorials[tab.value].member" />
            </div>
          </canvas-connector>

          <van-empty v-else description="暂无教程内容" image-size="1.6rem" />
        </x-tab>
      </x-tabs>
    </div>

    <article class="commission-tutorial__detail">
      <p class="commission-tutorial__no-indent"><strong>举例说明如下：</strong></p>
      <p>假设当前净盈利的返佣比例为10%(即来自直属下级)，跨级部分额外佣金为站长额外固定赠送，赠送比例为30%。A是第一个发现商机的，马上发展了B1和B2；B1又往下发展了C1和C2；B2往下发展了C3，C1往下发展了D1。第三天B1的净盈利为-500，B2的净盈利为-3000，C1的净盈利为1000，C2的净盈利为-2000，C3的净盈利为-20000，D1的净盈利为-3000，其中A的上期结余为-600(即上期结算时平台亏损的金额)，B1、B2、C1的上期结余为0(即上期结算时平台无亏损)。</p>
      <p class="commission-tutorial__no-indent">那么他们之间的收益计算方式如下：</p>
      <p class="commission-tutorial__no-indent"><strong>1、什么是净盈利？</strong></p>
      <p>净盈利=会员本期输赢+领取奖励+充值手续费+提现手续费+三方游戏成本</p>
      <p><strong>(1)以B1为例：</strong>假设B1在本期结算期间输赢-700(即B1亏损700)，且期间B1从平台中领取100奖励，B1的充值让平台消耗15手续费，B1的提现让平台消耗5手续费，B1进入第三方游戏让平台消耗80成本，则B1的净盈利=-700+100+15+5+80=-500，即B1给A贡献业绩是500；</p>
      <p><strong>(2)以C1为例：</strong>假设C1在本期结算期间输赢800(即C1盈利800)，且期间C1从平台中领取100奖励，C1的充值让平台消耗15手续费，C1的提现让平台消耗5手续费，C1进入第三方游戏让平台消耗80成本，则C1的净盈利=800+100+15+5+80=1000，即C1给B1贡献业绩是-1000。</p>
      <p class="commission-tutorial__no-indent"><strong>2、A的收益计算方式如下：</strong></p>
      <p>A的佣金来源除了直属下级B1和B2贡献，还有来自其他下级C1、C2和C3以及D1的贡献；</p>
      <p><strong>(1)A的直属业绩：</strong>直属业绩=-(B1净盈利+B2净盈利)=-(-500-3000)=3500；</p>
      <p><strong>(2)A的本期业绩：</strong>本期业绩=直属业绩+上期结余=3500-600=2900；</p>
      <p><strong>(3)A的直属佣金：</strong>直属佣金=本期业绩*返佣比例=2900*10%=<em>290</em>；</p>
      <p><strong>(4)A的其他佣金：</strong>其他佣金=-(C1净盈利+C2净盈利+C3净盈利+D1净盈利)*返佣比例*赠送比例=-(1000-2000-20000-3000)*10%*30%=<em>720</em>；</p>
      <p><strong>(5)A的本期佣金：</strong>本期佣金=直属佣金+其他佣金=<em>290</em>+<em>720</em>=<em>1010</em>。</p>
    </article>
  </section>
</template>

<style scoped lang="less">
.commission-tutorial {
  padding-bottom: 0.2rem;
  overflow: hidden;
}

.commission-tutorial__content {
  padding: 0 0.2rem 0.2rem;
}

.commission-tutorial__tabs {
  :deep(.x-tabs__wrap) {
    padding: 0.2rem 0;
  }

  :deep(.x-tabs__nav--card) {
    gap: 0.12rem;
    min-width: 100%;
    border: 0;
  }

  :deep(.x-tab--card) {
    flex: 1;
    min-width: 0;
    height: 0.5rem;
    min-height: 0.5rem;
    padding: 0 0.12rem;
    border: var(--lobby__px, 0.01rem) solid var(--skin__border);
    border-radius: 0.3rem;
    color: var(--skin__neutral_1);
    font-size: 0.2rem;
    background: var(--skin__bg_2);
  }

  :deep(.x-tab--card.x-tab--active) {
    border-color: var(--skin__primary);
    color: var(--skin__text_primary, #fff);
    background: var(--skin__primary);
  }
}

.commission-tutorial__diagram {
  position: relative;
}

.commission-tutorial__main-member {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  min-height: 1.8rem;
  padding: 0.2rem;
  border-radius: 0.14rem;
  background: var(--skin__bg_2);
  box-shadow: 0 0.03rem 0.07rem rgba(0, 0, 0, 0.08);
}

.commission-tutorial__main-badge {
  flex: none;

  :deep(.x-badge) {
    right: 0;
    bottom: 0;
    min-width: 0.38rem;
    height: 0.3rem;
    padding: 0 0.08rem;
    border-radius: 50%;
    font-size: 0.18rem;
    line-height: 0.3rem;
    transform: none;
  }

  :deep(.x-badge::before) {
    display: none;
  }
}

.commission-tutorial__main-avatar {
  display: block;
  width: 0.96rem;
  height: 0.96rem;
  padding: 0.03rem;
  border: 0.03rem solid var(--skin__accent_3);
  border-radius: 50%;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
}

.commission-tutorial__main-content {
  position: relative;
  flex: 1;
  max-width: 4.8rem;
  margin-left: 0.2rem;
  padding: 0.45rem 0;
  color: var(--skin__lead);
  font-size: 0.22rem;
  line-height: 1.64;

  p {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin: 0;
  }

  em {
    color: var(--skin__accent_3);
    font-style: normal;
  }
}

.commission-tutorial__balance {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 0.1rem;
  border-radius: 0.14rem 0;
  color: var(--skin__lead, #333);
  background-color: rgba(var(--skin__border__toRgbString), 0.5);
  font-family: "Microsoft YaHei Lobby", "Microsoft YaHei", sans-serif;
  font-size: 0.2rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-align: center;
}

.commission-tutorial__member-row {
  position: relative;
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 0.2rem;
  margin-top: 0.55rem;

}

.commission-tutorial__member-row--third {
  justify-content: center;
}

.commission-tutorial__detail {
  margin: 0 0.2rem;
  padding: 0.2rem;
  border-radius: 0.14rem;
  color: var(--skin__lead);
  font-size: 0.24rem;
  line-height: 0.4rem;
  background: var(--skin__bg_2);
  box-shadow: 0 0.03rem 0.07rem rgba(0, 0, 0, 0.08);

  p {
    margin: 0;
    text-indent: 0.4rem;
  }

  p + p {
    margin-top: 0.08rem;
  }

  strong {
    font-weight: 600;
  }

  em {
    color: var(--skin__accent_3);
    font-style: normal;
  }

  .commission-tutorial__no-indent {
    text-indent: 0;
  }
}

[dir="rtl"] {
  .commission-tutorial__main-content {
    margin-right: 0.2rem;
    margin-left: 0;
  }

  .commission-tutorial__balance {
    right: auto;
    left: 0;
    border-radius: 0 0.14rem;
  }
}
</style>
