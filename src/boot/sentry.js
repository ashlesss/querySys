import * as Sentry from "@sentry/vue";

export default ({ app, router }) => {
    Sentry.init({
      Vue: app,
      dsn: 'https://70350c2a461cfd939f0ec7ce3e387ed0@o4506542037532672.ingest.sentry.io/4506542039433216', // Replace with your Sentry DSN
      integrations: [
        new Sentry.BrowserTracing({
            routingInstrumentation: Sentry.vueRouterInstrumentation(router),
            tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
        })
      ],
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
    });
  };

