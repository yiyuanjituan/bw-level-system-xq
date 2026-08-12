<script setup lang="ts">
import { ref } from "vue";

interface EmojiCategory {
  name: string;
  emojis: string[];
}

const emit = defineEmits<{
  (event: "select", emoji: string): void;
}>();

// 使用系统 Unicode Emoji，避免表情面板依赖远程图片资源。
const categories: EmojiCategory[] = [
  {
    name: "人物",
    emojis: Array.from("😀 😬 😁 😂 🤣 🥳 😃 😄 😅 😆 😇 😉 😊 🙂 🙃 ☺️ 😋 😌 😍 🥰 😘 😗 😙 😚 😜 🤪 🤨 🧐 😝 😛 🤑 🤓 😎 🤩 🤡 🤠 🤗 😏 😶 😐 😑 😒 🙄 🤔 🤥 🤭 🤫 🤬 🤯 😳 😞 😟 😠 😡 😔 😕 🙁 ☹ 😣 😖 😫 😩 🥺 😤 😮 😱 😨 😰 😯 😦 😧 😢 😥 🤤 😪 😓 🥵 🥶 😭 😵 😲 🤐 🤢 🤧 🤮 😷 🤒 🤕 🥴 😴 💤 💩 😈 👿 👹 👺 💀 👻 👽 🤖 😺 😸 😹 😻 😼 😽 🙀 😿 😾 🤲 🙌 👏 👋 🤙 👍 👎 👊 ✊ 🤛 🤜 ✌ 👌 ✋ 🤚 👐 💪 🙏 🦶 🦵 🤝 ☝ 👆 👇 👈 👉 🖕 🖐 🤟 🤘 🤞 🖖 ✍ 🤳 💅 👄 🦷 👅 👂 👃 👁 👀 🧠 👤 👥 🗣 👶 🧒 👦 👧 🧑 👨 👩 👱‍♀️ 👱 🧔 🧓 👴 👵 👲 🧕 👳‍♀️ 👳 👮‍♀️ 👮 👷‍♀️ 👷 💂‍♀️ 💂 🕵️‍♀️ 🕵 👩‍⚕️ 👨‍⚕️ 👩‍🌾 👨‍🌾 👩‍🍳 👨‍🍳 👩‍🎓 👨‍🎓 👩‍🎤 👨‍🎤 👩‍🏫 👨‍🏫 👩‍🏭 👨‍🏭 👩‍💻 👨‍💻 👩‍💼 👨‍💼 👩‍🔧 👨‍🔧 👩‍🔬 👨‍🔬 👩‍🎨 👨‍🎨 👩‍🚒 👨‍🚒 👩‍✈️ 👨‍✈️ 👩‍🚀 👨‍🚀 👩‍⚖️ 👨‍⚖️ 🦸‍♀️ 🦸‍♂️ 🦹‍♀️ 🦹‍♂️ 🤶 🎅 🧙‍♀️ 🧙‍♂️ 🧝‍♀️ 🧝‍♂️ 🧛‍♀️ 🧛‍♂️ 🧟‍♀️ 🧟‍♂️ 🧞‍♀️ 🧞‍♂️ 🧜‍♀️ 🧜‍♂️ 🧚‍♀️ 🧚‍♂️ 👼 🤰 🤱 👸 🤴 👰 🤵 🏃‍♀️ 🏃 🚶‍♀️ 🚶 💃 🕺 👯 👯‍♂️ 👫 👬 👭 🙇‍♀️ 🙇 🤦‍♂️ 🤦‍♀️ 🤷 🤷‍♂️ 💁 💁‍♂️ 🙅 🙅‍♂️ 🙆 🙆‍♂️ 🙋 🙋‍♂️ 🙎 🙎‍♂️ 🙍 🙍‍♂️ 💇 💇‍♂️ 💆 💆‍♂️ 🧖‍♀️ 🧖‍♂️ 💑 👩‍❤️‍👩 👨‍❤️‍👨 💏 👩‍❤️‍💋‍👩 👨‍❤️‍💋‍👨 👪 👨‍👩‍👧 👨‍👩‍👧‍👦 👨‍👩‍👦‍👦 👨‍👩‍👧‍👧 👩‍👩‍👦 👩‍👩‍👧 👩‍👩‍👧‍👦 👩‍👩‍👦‍👦 👩‍👩‍👧‍👧 👨‍👨‍👦 👨‍👨‍👧 👨‍👨‍👧‍👦 👨‍👨‍👦‍👦 👨‍👨‍👧‍👧 👩‍👦 👩‍👧 👩‍👧‍👦 👩‍👦‍👦 👩‍👧‍👧 👨‍👦 👨‍👧 👨‍👧‍👦 👨‍👦‍👦 👨‍👧‍👧 🧶 🧵 🧥 🥼 👚 👕 👖 👔 👗 👙 👘 💄 💋 👣 🥿 👠 👡 👢 👞 👟 🥾 🧦 🧤 🧣 👒 🎩 🧢 ⛑ 🎓 👑 🎒 🧳 👝 👛 👜 💼 👓 🕶 🥽 💍 🌂".split(" "))
  },
  {
    name: "动物与自然",
    emojis: Array.from("🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐽 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🐣 🐥 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🐛 🦋 🐌 🐞 🐜 🦗 🕷️ 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🐘 🦏 🐪 🐫 🦒 🦘 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🐈 🐓 🦃 🕊️ 🐇 🐁 🐀 🐿️ 🦔 🐾 🌵 🎄 🌲 🌳 🌴 🌱 🌿 ☘️ 🍀 🎍 🎋 🍃 🍂 🍁 🌾 🌺 🌻 🌹 🥀 🌷 🌼 🌸 💐 🍄 🌰 🌍 🌎 🌏 🌕 🌙 ⭐ 🌟 ✨ ⚡ ☄️ 🔥 🌪️ 🌈 ☀️ 🌤️ ⛅ 🌧️ ❄️ ☃️ 💨 💧 🌊".split(" "))
  },
  {
    name: "食物和饮料",
    emojis: Array.from("🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶️ 🌽 🥕 🧄 🧅 🥔 🍠 🥐 🥯 🍞 🥖 🥨 🧀 🥚 🍳 🧈 🥞 🧇 🥓 🥩 🍗 🍖 🌭 🍔 🍟 🍕 🥪 🥙 🧆 🌮 🌯 🥗 🥘 🥫 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🦪 🍤 🍙 🍚 🍘 🍥 🥠 🥮 🍢 🍡 🍧 🍨 🍦 🥧 🧁 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🍩 🍪 🌰 🥜 🍯 🥛 ☕ 🍵 🧃 🥤 🍶 🍺 🍻 🥂 🍷 🥃 🍸 🍹 🍾 🧊".split(" "))
  },
  {
    name: "活动",
    emojis: Array.from("⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🥏 🎱 🪀 🏓 🏸 🏒 🏑 🥍 🏏 ⛳ 🏹 🎣 🤿 🥊 🥋 🎽 🛹 🛷 ⛸️ 🥌 🎿 ⛷️ 🏂 🪂 🏋️ 🤼 🤸 ⛹️ 🤺 🤾 🏌️ 🏇 🧘 🏄 🏊 🤽 🚣 🧗 🚵 🚴 🏆 🥇 🥈 🥉 🏅 🎖️ 🏵️ 🎗️ 🎫 🎟️ 🎪 🤹 🎭 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🎷 🎺 🎸 🎻 🎲 ♟️ 🎯 🎳 🎮 🎰 🧩".split(" "))
  },
  {
    name: "旅行和地点",
    emojis: Array.from("🚗 🚕 🚙 🚌 🚎 🏎️ 🚓 🚑 🚒 🚐 🚚 🚛 🚜 🛴 🚲 🛵 🏍️ 🚨 🚔 🚍 🚘 🚖 🚡 🚠 🚟 🚃 🚋 🚞 🚝 🚄 🚅 🚈 🚂 🚆 🚇 🚊 🚉 ✈️ 🛫 🛬 🛩️ 💺 🛰️ 🚀 🛸 🚁 🛶 ⛵ 🚤 🛥️ 🛳️ ⛴️ 🚢 ⚓ ⛽ 🚧 🚦 🚥 🗺️ 🗿 🗽 🗼 🏰 🏯 🏟️ 🎡 🎢 🎠 ⛲ ⛱️ 🏖️ 🏝️ 🏜️ 🌋 ⛰️ 🏕️ ⛺ 🏠 🏡 🏢 🏥 🏦 🏨 🏪 🏫 🏭 🏯 💒 🕌 🕍 ⛪ 🌇 🌆 🌃 🌉".split(" "))
  },
  {
    name: "物品",
    emojis: Array.from("⌚ 📱 💻 ⌨️ 🖥️ 🖨️ 🖱️ 🖲️ 🕹️ 🗜️ 💽 💾 💿 📀 📼 📷 📸 📹 🎥 📽️ 🎞️ 📞 ☎️ 📟 📠 📺 📻 🎙️ 🎚️ 🎛️ 🧭 ⏱️ ⏲️ ⏰ 🕰️ ⌛ ⏳ 📡 🔋 🔌 💡 🔦 🕯️ 🧯 🛢️ 💸 💵 💴 💶 💷 💰 💳 💎 ⚖️ 🧰 🔧 🔨 ⚒️ 🛠️ ⛏️ 🔩 ⚙️ 🧱 ⛓️ 🧲 🔫 💣 🧨 🪓 🔪 🗡️ ⚔️ 🛡️ 🚬 ⚰️ ⚱️ 🏺 🔮 📿 🧿 💈 ⚗️ 🔭 🔬 💊 💉 🩸 🩹 🩺 🚪 🛏️ 🛋️ 🚽 🚿 🛁 🧴 🧷 🧹 🧺 🧻 🧼 🧽 🧸 🖼️ 🛍️ 🛒 🎁 🎈 🎏 🎀 🎊 🎉".split(" "))
  },
  {
    name: "符号",
    emojis: Array.from("❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 ☮️ ✝️ ☪️ 🕉️ ☸️ ✡️ 🔯 🕎 ☯️ ☦️ 🛐 ⛎ ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ 🆔 ⚛️ ☢️ ☣️ 📴 📳 🈶 🈚 🈸 🈺 🈷️ ✴️ 🆚 💮 🉐 ㊙️ ㊗️ 🈴 🈵 🈹 🈲 🅰️ 🅱️ 🆎 🆑 🅾️ 🆘 ❌ ⭕ 🛑 ⛔ 📛 🚫 💯 💢 ♨️ 🚷 🚯 🚳 🚱 🔞 📵 🚭 ❗ ❕ ❓ ❔ ‼️ ⁉️ 🔅 🔆 ⚠️ 🚸 🔱 ⚜️ 🔰 ♻️ ✅ 🈯 💹 ❇️ ✳️ ❎ 🌐 💠 Ⓜ️ 🌀 💤 🏧 🚾 ♿ 🅿️ 🈳 🈂️ 🛂 🛃 🛄 🛅 🚹 🚺 🚼 ⚧️ 🚻 🚮 🎦 📶 🈁 🔣 ℹ️ 🔤 🔡 🔠 🆖 🆗 🆙 🆒 🆕 🆓 0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟 🔢 ▶️ ⏸️ ⏯️ ⏹️ ⏺️ ⏭️ ⏮️ ⏩ ⏪ 🔀 🔁 🔂 ◀️ 🔼 🔽 ⏫ ⏬ ➡️ ⬅️ ⬆️ ⬇️ ↗️ ↘️ ↙️ ↖️ ↕️ ↔️ 🔄 ↪️ ↩️".split(" "))
  },
  {
    name: "旗帜",
    emojis: Array.from("🏳️ 🏴 🏁 🚩 🏳️‍🌈 🏳️‍⚧️ 🇨🇳 🇭🇰 🇲🇴 🇹🇼 🇯🇵 🇰🇷 🇸🇬 🇲🇾 🇹🇭 🇻🇳 🇵🇭 🇮🇩 🇮🇳 🇦🇪 🇸🇦 🇹🇷 🇬🇧 🇫🇷 🇩🇪 🇮🇹 🇪🇸 🇵🇹 🇳🇱 🇧🇪 🇨🇭 🇦🇹 🇸🇪 🇳🇴 🇩🇰 🇫🇮 🇮🇸 🇮🇪 🇵🇱 🇺🇦 🇷🇺 🇬🇷 🇺🇸 🇨🇦 🇲🇽 🇧🇷 🇦🇷 🇨🇱 🇵🇪 🇨🇴 🇦🇺 🇳🇿 🇿🇦 🇪🇬 🇳🇬 🇰🇪 🇺🇳".split(" "))
  }
];

const activeCategory = ref<string | number>(0);
const emojiListRefs = new Map<number, HTMLElement>();

function setEmojiListRef(categoryIndex: number, element: Element | null) {
  if (element instanceof HTMLElement) {
    emojiListRefs.set(categoryIndex, element);
    return;
  }

  emojiListRefs.delete(categoryIndex);
}

function selectCategory(categoryName: string | number) {
  const categoryIndex = Number(categoryName);
  if (!Number.isInteger(categoryIndex) || !categories[categoryIndex]) return;

  activeCategory.value = categoryIndex;
  // 切换分类时回到列表顶部，避免沿用上一个分类的滚动位置。
  const emojiList = emojiListRefs.get(categoryIndex);
  if (emojiList) emojiList.scrollTop = 0;
}
</script>

<template>
  <section class="emoji-picker" aria-label="表情选择">
    <x-tabs
      class="emoji-picker__tabs"
      v-model="activeCategory"
      shrink
      :show-nav-arrows="false"
      line-width="24px"
      line-height="2px"
      @change="selectCategory"
    >
      <x-tab
        v-for="(category, index) in categories"
        :key="category.name"
        :name="index"
        :title="category.name"
      >
        <div
          :id="`plazza-emoji-list-${index}`"
          :ref="element => setEmojiListRef(index, element as Element | null)"
          class="emoji-picker__list"
          role="tabpanel"
        >
          <button
            v-for="(emoji, emojiIndex) in category.emojis"
            :key="`${emoji}-${emojiIndex}`"
            type="button"
            class="emoji-picker__item"
            :aria-label="`插入表情${emoji}`"
            @click="emit('select', emoji)"
          >
            {{ emoji }}
          </button>
        </div>
      </x-tab>
    </x-tabs>
  </section>
</template>

<style scoped lang="less">
.emoji-picker {
  width: 100%;
  height: 157px;
  margin-top: 10px;
  overflow: hidden;
  border: 0.5px solid var(--skin__border);
  border-radius: 7px;
  box-sizing: border-box;
  background: var(--skin__bg_2);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.emoji-picker__tabs {
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  :deep(.x-tabs__wrap) {
    min-height: 36px;
    height: 36px;
    border-bottom: var(--lobby__px, 0.5px) solid var(--skin__border);
    box-sizing: border-box;
  }

  :deep(.x-tabs__nav) {
    padding: 0 6px;
    box-sizing: border-box;
  }

  :deep(.x-tab) {
    min-height: 36px;
    margin-right: 20px;
    padding: 0;
    color: var(--skin__neutral_2);
    font-family: inherit;
    font-size: 12px;
  }

  :deep(.x-tab:last-of-type) {
    margin-right: 0;
  }

  :deep(.x-tab--active) {
    color: var(--skin__primary);
  }

  :deep(.x-tabs__line) {
    border-radius: 1px;
  }

  :deep(.x-tabs__content) {
    overflow: hidden;
  }
}

.emoji-picker__list {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 9.5px;
  max-height: 115px;
  padding: 10px;
  overflow-y: auto;
  box-sizing: border-box;
  overscroll-behavior: contain;
  scrollbar-color: var(--skin__border) transparent;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 2px;
    background: var(--skin__border);
  }
}

.emoji-picker__item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
  padding: 0;
  border: 0;
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
  font-size: 16px;
  line-height: 1;
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 1px solid var(--skin__primary);
    outline-offset: 2px;
  }
}

:global([dir="rtl"]) .emoji-picker__tabs :deep(.x-tab) {
  margin-right: 0;
  margin-left: 20px;

  &:last-child {
    margin-left: 0;
  }
}
</style>
