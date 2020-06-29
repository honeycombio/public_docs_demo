+++
title = "Your first steps with Honeycomb"
linktitle = "Your first steps with Honeycomb"
description = "What to expect when you first use Honeycomb"
hidetoc = true
weight = 15
+++

We recommend reading the [before getting started](/getting-started/before-getting-started/) checklist, to ensure you can successfully complete these steps.

_If you followed the checklist, the following steps should take less than one hour to complete._

## How to start sending in data

After signing up for a Honeycomb account, you will:

1. Create a team that represents your organization
2. Receive a unique API key that allows you to send data to Honeycomb
3. Choose an appropriate beeline or OpenTelemetry library and add it to your project's dependencies
4. Follow the instructions for your integration, which will involve:
    - Configuring your integration with a dataset name and the Honeycomb API key
    - Invoking the integration at initialization time, which will automatically instrument incoming and outgoing network requests
5. Run your code in development. Send it a few test requests to make sure it’s running — for most users, this will get you your first events into Honeycomb! Honeycomb will have those events available within seconds, so you’ll be able to see it working.
6. Go into the Honeycomb UI. You should see your first events that have landed in the system.

<!-- TODO add screenshot showing first events
-->

If you're seeing events appear in Honeycomb, then congratulations! You've successfully instrumented your first codebase.

### Need help?

If you don't see anything after several minutes, something may be wrong. You can reach out to us for help by clicking the chat icon on the bottom right hand corner of this page.

## What's next?

Now that you're seeing data in Honeycomb, you can:

- [Explore the UI](http://ui.honeycomb.io): click on one of your requests in the graph to pull up trace view.
- Add custom instrumentation: Start adding custom telemetry fields that reflect the precise needs of your system
- Deploy to production: start watching real user requests come into Honeycomb.
- Instrument additional systems for [distributed tracing](/working-with-your-data/tracing/)

### What if there’s no appropriate beeline for my language, or I want to instrument my infrastructure?

Start your trial the same way above, by creating a team. However, you will need to take a different route to getting data in.

There are many different ways to get data into Honeycomb. The most basic way is to `curl` data directly into Honeycomb (_not that we recommend that!_). Check out the [other integrations](/getting-data-in/integrations) section of our docs to learn about other ways to get data into Honeycomb.

You can instrument your infrastructure by sending Honeycomb your structured log data. This data is useful, but it also does not allow you to make use of powerful Honeycomb features like [distributed tracing](/working-with-your-data/tracing/). If possible, we recommend instrumenting your applications as well as your infrastructure.
