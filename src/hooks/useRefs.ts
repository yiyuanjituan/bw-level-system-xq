import { reactive } from "vue";

export function useRefs() {
  const refs = reactive<{ [key: string]: any }>({});

  // 设置 refs 的方法，返回一个函数用于更新特定 ref
  function setRefs(name: string) {
    return (el: any) => {
      refs[name] = el;
      return () => refs[name]; // 返回一个函数用于获取当前 ref
    };
  }

  return { refs, setRefs };
}