export default defineDirectives({
  mounted(el, binding) {
    const mods = binding.modifiers;

    const handler = (e: any) => {
      if (!el.contains(e.target) && el !== e.target) {
        binding.value(e);
      }
    };
    (el as any).__ClickOutsideHandler__ = handler;

    setTimeout(() => document.addEventListener('click', handler), mods.delay ? 50 : 0);
  },
  beforeUnmount(el) {
    document.removeEventListener('click', (el as any).__ClickOutsideHandler__);
  },
  getSSRProps() {
    return {};
  }
});
