export function useRefs() {
  const refs: Record<string, any> = {};
  const setters = new Map<string, (el: any) => void>();

  function setRefs(name: string) {
    if (!setters.has(name)) {
      setters.set(name, (el: any) => {
        if (el) {
          refs[name] = el;
          return;
        }

        delete refs[name];
      });
    }

    return setters.get(name)!;
  }

  return { refs, setRefs };
}
