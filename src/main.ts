import App from './App.svelte';

const app = new App({
  'target': document.body,
  'props': { 'api': 'https://api.whatexploitsare.online' },
});

export default app;
